import { ActorSystem } from 'comedy'
import { Logger, actorLogger } from '../util/Logger'
import { Pool } from 'pg'
import { VpnDB, makeVpnDB } from './VpnDB'

export default class VpnDBResource {
  private readonly dbPool: Pool

  private log!: Logger
  private VpnDB!: VpnDB

  static inject() {
    return ['DBPoolResource']
  }

  constructor(dbPool: Pool) {
    this.dbPool = dbPool
  }

  async initialize(system: ActorSystem) {
    const rootActor = await system.rootActor()
    this.log = actorLogger(rootActor)
    this.log.info('Initializing VpnDB resource...')
    this.VpnDB = makeVpnDB(this.dbPool)
  }

  async destroy() {
    await this.VpnDB.end()
    this.log.info('VpnDB closed')
  }

  getResource() {
    return this.VpnDB
  }
}
