import {ClientBase, QueryResultRow} from 'pg'
import {VpnDBClientLocator, VpnDBConnection, VpnDB} from '../VpnDB'
import {VpnConfig} from '../../model/vpn-user-types'

export interface ConfigRepository {
    insertConfig(
        connection: VpnDBConnection,
        vpnConfig: Omit<VpnConfig, 'configId'>
    ): Promise<VpnConfig>

    selectConfigById(
        connection: VpnDBConnection,
        configId: number
    ): Promise<VpnConfig | undefined>

    selectUnusedConfigs(
        connection: VpnDBConnection
    ): Promise<VpnConfig[]>
}

export function makeConfigRepository(db: VpnDB): ConfigRepository {
    return new ConfigRepositoryImpl(db)
}

class ConfigRepositoryImpl implements ConfigRepository {
    private clientLocator: VpnDBClientLocator

    constructor(clientLocator: VpnDBClientLocator) {
        this.clientLocator = clientLocator;
    }

    async insertConfig(
        connection: VpnDBConnection,
        vpnConfig: Omit<VpnConfig, 'configId'>
    ): Promise<VpnConfig> {
        return sql.insertConfig(
            await this.clientLocator.ensureClient(connection),
            vpnConfig
        )
    }

    async selectConfigById(
        connection: VpnDBConnection,
        configId: number
    ): Promise<VpnConfig | undefined> {
        return sql.selectConfigByUserId(
            await this.clientLocator.ensureClient(connection),
            configId
        )
    }

    async selectUnusedConfigs(
        connection: VpnDBConnection
    ): Promise<VpnConfig[]> {
        return sql.selectUnusedConfigs(
            await this.clientLocator.ensureClient(connection))
    }
}

// sql
namespace sql {
    function configRowMapping(row: QueryResultRow): VpnConfig {
        return {
            configId: Number(row.config_id),
            configName: row.config_name,
            serverId: Number(row.server_id),
            configData: row.config_data
        }
    }

    export async function insertConfig(
        client: ClientBase,
        vpnConfig: Omit<VpnConfig, 'configId'>
    ): Promise<VpnConfig> {
        const {serverId, configName, configData} = vpnConfig
        const res = await client.query(
            `
                INSERT INTO vpn_config (server_id, config_name, config_data)
                VALUES ($1, $2, $3)
                RETURNING config_id
            `,
            [serverId, configName, configData]
        )
        return {
            configId: Number(res.rows[0].config_id),
            configName,
            serverId,
            configData
        }
    }

    export async function selectConfigByUserId(
        client: ClientBase,
        configId: number
    ): Promise<VpnConfig | undefined> {
        const res = await client.query(
            `SELECT *
             FROM vpn_config
             WHERE config_id = $1`,
            [configId]
        )
        return res.rows.map(configRowMapping).shift()
    }
//todo left join with user_vpn_config
    export async function selectUnusedConfigs(
        client: ClientBase
    ): Promise<VpnConfig[]> {
        const res = await client.query(
            `SELECT *
             FROM vpn_config
             `,
        )
        return res.rows.map(configRowMapping)
    }
}
