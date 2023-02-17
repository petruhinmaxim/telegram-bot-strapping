import { ClientBase, QueryResultRow } from 'pg'
import { VpnDBClientLocator, VpnDBConnection, VpnDB } from '../VpnDB'
import { TelegramUserData } from '../../model/vpn-user-types'

export interface TelegramUserDataRepository {
  insertTelegramUserData(
      connection: VpnDBConnection,
      telegramUserData: TelegramUserData
  ): Promise <TelegramUserData>

  selectTelegramUserDataByUserId(
      connection: VpnDBConnection,
      telegramTelegramUserDataId: number
  ): Promise<TelegramUserData | undefined>

  updateTelegramUserData(
      connection: VpnDBConnection,
      vpnTelegramUserData: TelegramUserData
  ): Promise <TelegramUserData>
}

export function makeTelegramUserDataRepository(db: VpnDB): TelegramUserDataRepository {
  return new TelegramUserDataRepositoryImpl(db)
}

class TelegramUserDataRepositoryImpl implements TelegramUserDataRepository {
  private clientLocator: VpnDBClientLocator

  constructor(clientLocator: VpnDBClientLocator) {
    this.clientLocator = clientLocator;
  }

  async insertTelegramUserData(
    connection: VpnDBConnection,
    telegramUserData: TelegramUserData
  ) {
    return sql.insertTelegramUserData(
      await this.clientLocator.ensureClient(connection),
      telegramUserData
    )
  }

  async selectTelegramUserDataByUserId(
    connection: VpnDBConnection,
    telegramTelegramUserDataId: number
  ): Promise<TelegramUserData | undefined> {
    return sql.selectTelegramUserDataByUserId(
      await this.clientLocator.ensureClient(connection),
      telegramTelegramUserDataId
    )
  }

  async updateTelegramUserData(
    connection: VpnDBConnection,
    telegramUserData: TelegramUserData
  ) {
    return sql.updateTelegramUserData(
      await this.clientLocator.ensureClient(connection),
        telegramUserData
    )
  }
}

// sql

namespace sql {
  function telegramUserDataRowMapping(row: QueryResultRow): TelegramUserData {
    return {
      telegramUserId: Number(row.telegram_user_id),
      username: row.user_name,
      firstName: row.first_name,
      lastName: row.last_name,
      languageCode: row.language_code
    }
  }

  export async function insertTelegramUserData(
    client: ClientBase,
    telegramUserData: TelegramUserData
  ) {
    const { telegramUserId, username, firstName, lastName, languageCode } = telegramUserData
    await client.query(
      `
      INSERT INTO telegram_user_data (telegram_user_id, user_name, first_name, last_name, language_code)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [telegramUserId, username, firstName, lastName, languageCode]
    )
    return telegramUserData
  }

  export async function selectTelegramUserDataByUserId(
    client: ClientBase,
    telegramUserId: number
  ): Promise<TelegramUserData | undefined> {
    const res = await client.query(
        `SELECT * 
                        FROM telegram_user_data WHERE telegram_user_id = $1`,
      [telegramUserId]
    )
    return res.rows.map(telegramUserDataRowMapping).shift()
  }

  export async function updateTelegramUserData(
    client: ClientBase,
    telegramUserData: TelegramUserData
  ) {
    const { telegramUserId, username, firstName, lastName, languageCode } = telegramUserData
    await client.query(
      `
      UPDATE telegram_user_data
      SET user_name = $2,
          first_name = $3,
          last_name = $4,
          language_code = $5
      WHERE telegram_user_id = $1
      `,
        [telegramUserId, username, firstName, lastName, languageCode]
    )
    return telegramUserData
  }
}
