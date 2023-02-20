import {Pool} from 'pg'
import config from '../config/config'
import {consoleLogger} from '../util/Logger'
import fs from 'fs'
import {makeVpnDB, VpnDB, VpnDBConnection} from '../db/VpnDB'
import path from 'path'
import {makeConfigRepository} from "../db/repository/ConfigRepository";
import {UserConfigs, VpnConfig} from "../model/vpn-user-types";

async function main() {
    const log = consoleLogger()
    const dbPool = new Pool(config.db)
    const vpnDB = makeVpnDB(dbPool)
    const configRepo = makeConfigRepository(vpnDB)
    const filePath = process.argv[2]
    const serverId = Number (process.argv[3])
    //получаем массив с содержимым файлов. Имена отсутствуют. На уникальност проверяется содержимое
    const configsData: {fileName:string, fileData:string}[] = parseFiles(filePath)
    log.info(`${configsData.length} configs for download`)
    for (const data of configsData) {
        const config: Omit<VpnConfig, "configId"> = {
            serverId: serverId,
            configName: data.fileName,
            configData: data.fileData
        }
       await vpnDB.withConnection(log, async con => {
           await configRepo.insertConfig(con,config)
       })
    }
}

main().catch(console.dir)

export function parseFiles(path: string): {fileName:string, fileData:string}[] {
    let result: {fileName:string, fileData:string}[] = []
    const filesName: string[] = fs.readdirSync(path)
    for (let fileName of filesName) {
        const fileData = fs.readFileSync(path + "/" + fileName, "utf-8")
        result.push({fileName, fileData })
    }
    return result
}