import { TelegramUserData } from './vpn-user-types'
import { Scene } from './scene-types'

export type InboundTelegramMessage = {
  channel: Channel
  telegramUser: TelegramUserData
  inputPayload: InputPayload
}

export type InputPayload = TextInput | CallbackInput

export type TextInput = {
  tpe: 'TextInput'
  messageId: number
  text: string
}

export type CallbackInput = {
  tpe: 'CallbackInput'
  messageId: number
  data: string
}

export interface OutboundTelegramMessage {
  chatId: number
  userData: TelegramUserData
  outputPayload: OutputPayload
  channel: Channel
}

export type OutputPayload =
  TextOutput
  | DeleteMessageOutput
  | EditOutput
  | SendOutput

export type TextOutput = {
  tpe: 'TextOutput'
  text: string
}

export type SendOutput = {
  tpe: 'SendOutput'
  scene: Scene
}

export type DeleteMessageOutput = {
  tpe: 'DeleteMessageOutput'
  messageId: number
}

export type EditOutput = {
  tpe: 'EditOutput'
  scene: Scene
}

export type Channel = 'main' | 'admin'
