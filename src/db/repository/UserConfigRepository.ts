import {ClientBase, QueryResultRow} from 'pg'
import {VpnDBClientLocator, VpnDBConnection, VpnDB} from '../VpnDB'
import {UserConfigs} from '../../model/vpn-user-types'

export interface UserConfigRepository {
    insertUserConfig(
        connection: VpnDBConnection,
        userConfigs: UserConfigs
    ): Promise<UserConfigs>

    selectConfigsById(
        connection: VpnDBConnection,
        telegramUserId: number
    ): Promise<UserConfigs | undefined>
}

export function makeUserConfigRepository(db: VpnDB): UserConfigRepository {
    return new UserConfigRepositoryImpl(db)
}

class UserConfigRepositoryImpl implements UserConfigRepository {
    private clientLocator: VpnDBClientLocator

    constructor(clientLocator: VpnDBClientLocator) {
        this.clientLocator = clientLocator;
    }

    async insertUserConfig(
        connection: VpnDBConnection,
        userConfigs: UserConfigs
    ): Promise<UserConfigs> {
        return sql.insertConfigs(
            await this.clientLocator.ensureClient(connection),
            userConfigs
        )
    }

    async selectConfigsById(
        connection: VpnDBConnection,
        telegramUserId: number
    ): Promise<UserConfigs | undefined> {
        return sql.selectConfigsById(
            await this.clientLocator.ensureClient(connection),
            telegramUserId
        )
    }
}

// sql
namespace sql {
    function userConfigsRowMapping(row: QueryResultRow): UserConfigs {
        return {
            telegramUserId: Number(row.config_id),
            mobileConfigId: Number(row.server_id),
            pcConfigId: Number(row.server_id)
        }
    }

    export async function insertConfigs(
        client: ClientBase,
        userConfigs: UserConfigs
    ): Promise<UserConfigs> {
        const {telegramUserId, mobileConfigId, pcConfigId} = userConfigs
        const res = await client.query(
            `
                INSERT INTO user_vpn_config (telegram_user_id, mobile_config_id, pc_config_id)
                VALUES ($1, $2, $3)
            `,
            [telegramUserId, mobileConfigId, pcConfigId]
        )
        return {
            telegramUserId,
            mobileConfigId,
            pcConfigId
        }
    }

    export async function selectConfigsById(
        client: ClientBase,
        telegramUserId: number
    ): Promise<UserConfigs | undefined> {
        const res = await client.query(
            `SELECT *
             FROM user_vpn_config
             WHERE telegram_user_id = $1`,
            [telegramUserId]
        )
        return res.rows.map(userConfigsRowMapping).shift()
    }
}
