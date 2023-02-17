import { ClientBase, QueryResultRow } from 'pg'
import { VpnDBClientLocator, VpnDBConnection, VpnDB } from '../VpnDB'
import { VpnUser } from '../../model/vpn-user-types'

export interface VpnUserRepository {
  insertVpnUser(
      connection: VpnDBConnection,
      VpnUser: VpnUser
  ): Promise <VpnUser>

  selectVpnUserByUserId(
      connection: VpnDBConnection,
      telegramUserId: number
  ): Promise<VpnUser | undefined>

  updateVpnUser(
      connection: VpnDBConnection,
      vpnUser: VpnUser
  ): Promise <VpnUser>
}

export function makeVpnUserRepository(db: VpnDB): VpnUserRepository {
  return new VpnUserRepositoryImpl(db)
}

class VpnUserRepositoryImpl implements VpnUserRepository {
  private clientLocator: VpnDBClientLocator

  constructor(clientLocator: VpnDBClientLocator) {
    this.clientLocator = clientLocator;
  }

  async insertVpnUser(
    connection: VpnDBConnection,
    vpnUser: VpnUser
  ) {
    return sql.insertVpnUser(
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

  async updateVpnUser(
    connection: VpnDBConnection,
    vpnUser: VpnUser
  ) {
    return sql.updateVpnUser(
      await this.clientLocator.ensureClient(connection),
        vpnUser
    )
  }
}

// sql
namespace sql {
  function vpnUserRowMapping(row: QueryResultRow): VpnUser {
    return {
      telegramUserId: Number(row.telegram_user_id),
      currentScene: row.current_scene,
      configPcId: row.config_pc_id,
      configMobileId: row.config_mobile_id
    }
  }

  export async function insertVpnUser(
    client: ClientBase,
    vpnUser: VpnUser
  ) {
    const { telegramUserId, currentScene, configPcId, configMobileId } = vpnUser
    await client.query(
      `
      INSERT INTO vpn_user (telegram_user_id, current_scene, config_pc_id, config_mobile_id)
      VALUES ($1, $2, $3, $4)
      `,
      [telegramUserId, currentScene, configPcId, configMobileId]
    )
    return vpnUser
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

  export async function updateVpnUser(
    client: ClientBase,
    vpnUser: VpnUser
  ) {
    const { telegramUserId, currentScene, configPcId, configMobileId } = vpnUser
    await client.query(
      `
      UPDATE vpn_user
      SET current_scene = $2,
          config_pc_id = $3,
          config_mobile_id = $4
      WHERE telegram_user_id = $1
      `,
        [telegramUserId, currentScene, configPcId, configMobileId]
    )
    return vpnUser
  }
}
