import {Actor} from 'comedy'
import {actorLogger, Logger} from '../util/Logger'
import * as tg from '../model/telegram-massege-types'
import {TelegramUserData, telegramUserEquals, UserConfigs, VpnConfig, VpnUser} from '../model/vpn-user-types'
import {VpnDB, VpnDBConnection} from '../db/VpnDB'
import {makeTelegramUserDataRepository, TelegramUserDataRepository} from '../db/repository/TelegramUserDataRepository'
import {makeVpnUserRepository, VpnUserRepository} from "../db/repository/VpnUserRepository";
import {markupDataParseSceneTpe} from '../scenes/scene-markup'
import {ConfigRepository, makeConfigRepository} from "../db/repository/ConfigRepository";
import {makeUserConfigRepository, UserConfigRepository} from "../db/repository/UserConfigRepository";

export default class LogicActor {
    private readonly vpnDB: VpnDB
    private log!: Logger
    private selfActor!: Actor
    private telegramUserDataRepo!: TelegramUserDataRepository
    private vpnUserRepo!: VpnUserRepository
    private configRepo!: ConfigRepository
    private userConfigsRepo!: UserConfigRepository

    static inject() {
        return ['VpnDBResource']
    }

    constructor(vpnDB: VpnDB) {
        this.vpnDB = vpnDB
    }

    async initialize(selfActor: Actor) {
        this.log = actorLogger(selfActor)
        this.selfActor = selfActor
        this.telegramUserDataRepo = makeTelegramUserDataRepository(this.vpnDB)
        this.vpnUserRepo = makeVpnUserRepository(this.vpnDB)
        this.configRepo = makeConfigRepository(this.vpnDB)
        this.userConfigsRepo = makeUserConfigRepository(this.vpnDB)
        this.log.info('init')
    }

    private async ensureUser(
        con: VpnDBConnection,
        telegramUserData: TelegramUserData
    ): Promise<VpnUser> {
        let vpnUser: VpnUser | undefined
        const telegramUserId = telegramUserData.telegramUserId
        let userData = await this.telegramUserDataRepo.selectTelegramUserDataByUserId(con, telegramUserId)
        if (!userData) {
            await this.telegramUserDataRepo.insertTelegramUserData(con, telegramUserData)
            vpnUser = {
                telegramUserId: telegramUserData.telegramUserId,
                currentScene: {tpe: "Start"}
            }
        } else {
            if (!telegramUserEquals(telegramUserData, userData)) {
                await this.telegramUserDataRepo.updateTelegramUserData(con, telegramUserData)
            }
            vpnUser = await this.vpnUserRepo.selectVpnUserByUserId(con, telegramUserId)
            if (!vpnUser) {
                vpnUser = {
                    telegramUserId: telegramUserData.telegramUserId,
                    currentScene: {tpe: "Start"}
                }
            }
        }
        return vpnUser
    }

    private async sendToUser(
        user: VpnUser,
        outputPayload: tg.OutputPayload,
        channel: tg.Channel = 'main'
    ) {
        await this.selfActor.getParent().send(
            'processOutboundTelegramMessage',
            <tg.OutboundTelegramMessage>{
                chatId: user.telegramUserId,
                channel,
                outputPayload
            }
        )
    }

    async processInboundTelegramMessage(msg: tg.InboundTelegramMessage) {
        await this.vpnDB.withConnection(this.log, async con => {
            const vpnUser = await this.ensureUser(con, msg.telegramUser)
            //todo analytics
            switch (msg.inputPayload.tpe) {
                case 'TextInput':
                    await this.processMainText(con, vpnUser, msg.telegramUser, msg.inputPayload)
                    break
                case 'CallbackInput':
                    await this.processMainCallback(con, vpnUser, msg.telegramUser, msg.inputPayload,)
                    break
            }
        })
    }

    private async processMainCallback(
        con: VpnDBConnection,
        user: VpnUser,
        userData: TelegramUserData,
        payload: tg.CallbackInput
    ) {
        const sceneTpeInCallbackData = markupDataParseSceneTpe(payload.data)
        switch (sceneTpeInCallbackData) {
            case 'Start': {
                user.currentScene = {
                    tpe: "Start",
                    messageId: payload.messageId,
                    userName: userData.firstName
                }
                break
            }
            case 'IphoneInstruction': {
                user.currentScene = {
                    tpe: "IphoneInstruction",
                    messageId: payload.messageId
                }
                break
            }
            case 'MacInstruction': {
                user.currentScene = {
                    tpe: "MacInstruction",
                    messageId: payload.messageId
                }
                break
            }
            case 'AndroidInstruction': {
                user.currentScene = {
                    tpe: "AndroidInstruction",
                    messageId: payload.messageId
                }
                break
            }
            case 'WindowsInstruction': {
                user.currentScene = {
                    tpe: "WindowsInstruction",
                    messageId: payload.messageId
                }
                break
            }
            case 'GetConfigs': {
                let mobileConfigId: number
                let pcConfigId: number
                let userConfigs: UserConfigs | undefined
                await this.vpnDB.withConnection(this.log, async con => {
                    userConfigs = await this.userConfigsRepo.selectConfigsById(con, userData.telegramUserId)
                })
                if (userConfigs) {
                    mobileConfigId = userConfigs.mobileConfigId
                    pcConfigId = userConfigs.pcConfigId
                } else {
                    await this.vpnDB.withConnection(this.log, async con => {
                        const userConfigsId: { mobileConfigId: number, pcConfigId: number } =
                            await this.configRepo.selectUnusedConfigs(con)
                        mobileConfigId = userConfigsId.mobileConfigId
                        pcConfigId = userConfigsId.pcConfigId

                        await this.userConfigsRepo.insertUserConfig(con, {
                            telegramUserId: user.telegramUserId,
                            mobileConfigId,
                            pcConfigId
                        })
                    })
                }
                let mobileConfig: VpnConfig | undefined
                let pcConfig: VpnConfig | undefined
                await this.vpnDB.withConnection(this.log, async con => {
                    mobileConfig = await this.configRepo.selectConfigById(con, mobileConfigId)
                    pcConfig = await this.configRepo.selectConfigById(con, pcConfigId)
                })
                if (mobileConfig && pcConfig)
                    user.currentScene = {
                        tpe: "GetConfigs",
                        messageId: payload.messageId,
                        mobileConfigData: mobileConfig.configData,
                        pcConfigData: pcConfig.configData
                    }
                break
            }
            case 'GeneralInfo': {
                user.currentScene = {
                    tpe: "GeneralInfo",
                    messageId: payload.messageId
                }
                break
            }
            case 'DeleteMassage': {
                user.currentScene = {
                    tpe: "DeleteMassage",
                    messageId: payload.messageId
                }
                break
            }
        }
        let out: tg.OutputPayload
        if(sceneTpeInCallbackData == "GetConfigs") {
            out = {
                tpe: 'SendFile',
                scene: user.currentScene
            }
        }
        else {
            out = {
                tpe: 'EditOutput',
                scene: user.currentScene
            }
        }
        await this.vpnUserRepo.upsertVpnUser(con, user)
        await this.sendToUser(user, out)
    }

    private async processMainText(
        con: VpnDBConnection,
        user: VpnUser,
        userData: TelegramUserData,
        payload: tg.TextInput
    ) {
        // dell user message
        let out: tg.OutputPayload = {
            tpe: 'DeleteMessageOutput',
            messageId: payload.messageId
        }
        await this.sendToUser(user, out)

        if (payload.text == '/start') {
            // del previous message
            if (user.currentScene.messageId) {
                out = {
                    tpe: 'DeleteMessageOutput',
                    messageId: user.currentScene.messageId
                }
                await this.sendToUser(user, out)
            }
            user.currentScene = {
                tpe: 'Start',
                messageId: payload.messageId,
                userName: userData.firstName
            }
            out = {
                tpe: 'SendOutput',
                scene: user.currentScene
            }
        }
        await this.sendToUser(user, out)
        await this.vpnUserRepo.upsertVpnUser(con, user)
    }
}

