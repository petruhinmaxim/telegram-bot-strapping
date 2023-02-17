import { Pool, PoolClient } from 'pg'
import { Logger } from '../util/Logger'

export type VpnDBConnection = string

export interface VpnDBClientLocator {
  ensureClient(
    connection: VpnDBConnection
  ): Promise<PoolClient>
}

export interface VpnDB extends VpnDBClientLocator {
  withConnection<T>(
    log: Logger,
    fn: (connection: VpnDBConnection) => Promise<T>
  ): Promise<T>

  withTransaction<T>(
    log: Logger,
    fn: (connection: VpnDBConnection) => Promise<T>
  ): Promise<T>

  end(): Promise<void>
}

export function makeVpnDB(dbPool: Pool): VpnDB {
  return new VpnDBImpl(dbPool)
}

class VpnDBImpl implements VpnDB {

  private dbPool: Pool
  private connections: { [connection: VpnDBConnection]: PoolClient } = {}
  private connectionsCounter: number = 0

  constructor(dbPool: Pool) {
    this.dbPool = dbPool
  }

  async end(): Promise<void> {
    for (const connection in this.connections) {
      await this.release(connection)
    }
  }

  ensureClient(
    connection: VpnDBConnection
  ): Promise<PoolClient> {
    const client = this.connections[connection]
    return client == null
      ? Promise.reject(`Unknown connection ${connection}`)
      : Promise.resolve(client)
  }

  async connect(): Promise<VpnDBConnection> {
    const client = await this.dbPool.connect()
    const connection = `${this.connectionsCounter++}`
    this.connections[connection] = client
    return connection
  }

  async release(connection: VpnDBConnection): Promise<void> {
    const client = await this.ensureClient(connection)
    await client.release()
    delete this.connections[connection]
  }

  async withConnection<T>(
    log: Logger,
    fn: (connection: VpnDBConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.connect()
    try {
      return await fn(connection)
    } catch (e) {
      log.error(`${e}`)
      return Promise.reject(e)
    } finally {
      await this.release(connection)
    }
  }

  async withTransaction<T>(
    log: Logger,
    fn: (connection: VpnDBConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.connect()
    const client = await this.ensureClient(connection)
    try {
      await client.query('BEGIN')
      const res = await fn(connection)
      await client.query('COMMIT')
      return res
    } catch (e) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        log.error(`ROLLBACK failed: ${rollbackError}`)
      }
      log.error(`${e}`)
      return Promise.reject(e)
    } finally {
      await this.release(connection)
    }
  }
}
