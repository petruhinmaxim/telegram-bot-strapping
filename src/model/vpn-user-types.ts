import { Scene } from './scene-types'

export type VpnUser = {
  telegramUserId: number
  currentScene: Scene
  configPcId?: number
  configMobileId?: number
}

export type VpnConfig = {
  configId: number
  serverId: number
  configData: string
}

export type VpnServer = {
  serverId: number
  serverName: string
  subscriptionDate: Date
  ip: string
  vnsIp: string
  userName: string
  password: string
}

export type TelegramUserData = {
  telegramUserId: number
  username?: string
  firstName?: string
  lastName?: string
  languageCode?: string
}

export function telegramUserEquals(
  a: TelegramUserData,
  b: TelegramUserData
): boolean {
  return a.telegramUserId === b.telegramUserId
    && a.username === b.username
    && a.firstName === b.firstName
    && a.lastName === b.lastName
    && a.languageCode === b.languageCode
}
