import { ClientBase, QueryResultRow } from 'pg'
import { VpnDBClientLocator, VpnDBConnection, VpnDB } from '../VpnDB'
import { VpnUser } from '../../model/vpn-user-types'

export interface VpnUserRepository {
  upsertVpnUser(
      connection: VpnDBConnection,
      VpnUser: VpnUser
  ): Promise<number>

  selectVpnUserByUserId(
      connection: VpnDBConnection,
      telegramUserId: number
  ): Promise<VpnUser | undefined>
}

export function makeVpnUserRepository(db: VpnDB): VpnUserRepository {
  return new VpnUserRepositoryImpl(db)
}

class VpnUserRepositoryImpl implements VpnUserRepository {
  private clientLocator: VpnDBClientLocator

  constructor(clientLocator: VpnDBClientLocator) {
    this.clientLocator = clientLocator;
  }

  async upsertVpnUser(
      connection: VpnDBConnection,
      vpnUser: VpnUser
  ): Promise<number> {
    return sql.upsertVpnUser(
        await this.clientLocator.ensureClient(connection),
        vpnUser
    )
  }

  async selectVpnUserByUserId(
    connection: VpnDBConnection,
    telegramVpnUserId: number
  ): Promise<VpnUser | undefined> {
    return sql.selectVpnUserByUserId(
      await this.clientLocator.ensureClient(connection),
      telegramVpnUserId
    )
  }
}

// sql
namespace sql {
  function vpnUserRowMapping(row: QueryResultRow): VpnUser {
    return {
      telegramUserId: Number(row.telegram_user_id),
      currentScene: row.current_scene
    }
  }

  export async function upsertVpnUser(
      client: ClientBase,
      vpnUser: VpnUser
  ): Promise<number> {
    const { telegramUserId, currentScene } = vpnUser
    const res = await client.query(
        `
          INSERT INTO vpn_user (telegram_user_id, current_scene)
          VALUES ($1, $2)
          ON CONFLICT (telegram_user_id) DO UPDATE SET
            current_scene = excluded.current_scene
      `,
        [telegramUserId, currentScene]
    )
    return res.rowCount
  }

  export async function selectVpnUserByUserId(
    client: ClientBase,
    telegramUserId: number
  ): Promise<VpnUser | undefined> {
    const res = await client.query(
        `SELECT * 
                        FROM vpn_user WHERE telegram_user_id = $1`,
      [telegramUserId]
    )
    return res.rows.map(vpnUserRowMapping).shift()
  }
}
