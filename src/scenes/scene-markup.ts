import * as s from '../model/scene-types'
import {Markup} from 'telegraf'
import {InlineKeyboardMarkup} from 'typegram'
import {VpnL10n} from './l10n/VpnL10n'

export function getMarkup(scene: s.Scene, l10n: VpnL10n):
  Markup.Markup<InlineKeyboardMarkup> {
  const buttons = []
  let markup: Markup.Markup<InlineKeyboardMarkup>
  switch (scene.tpe) {
    case 'Start':
      buttons.push(getIphoneInstruction(l10n))
      buttons.push(getMacInstruction(l10n))
      break
    case "DeleteMassage":
      break
    case "IphoneInstruction":
      buttons.push(getStartButton(l10n))
      break
    case "MacInstruction":
      buttons.push(getStartButton(l10n))
      break
  }
  markup = Markup.inlineKeyboard(buttons)
  return markup
}

//navigation buttons
function getStartButton(l10n: VpnL10n) {
  return Markup.button.callback(l10n.goToMainMenu(), markupDataGen('Start'))
}

function getIphoneInstruction(l10n: VpnL10n) {
  return Markup.button.callback(l10n.goToIphoneInstruction(), markupDataGen('IphoneInstruction'))
}

function getMacInstruction(l10n: VpnL10n) {
  return Markup.button.callback(l10n.goToMacInstruction(), markupDataGen('MacInstruction'))
}

function markupDataGen(sceneTpe: string, actionInScene?: string) {
  return sceneTpe + '_' + actionInScene
}

export function markupDataParseSceneTpe(data: string): string {
  return data.split('_',)[0]
}

export function markupDataParseActionInScene(markupData: string): string {
  return markupData.split('_',)[1]
}
