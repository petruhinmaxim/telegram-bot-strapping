import {VpnL10n} from './VpnL10n'
import * as s from '../../model/scene-types'
import {
    escapeString
} from '../text-util'

export class VpnL10nEn implements VpnL10n {
    start(scene: s.Start): string {
        return escapeString(
            `Hello! `
        )
    }

    //navigation
    goToMainMenu(): string {
        return escapeString(
            'Main menu'
        )
    }
    goToIphoneInstruction(): string {
        return escapeString(
            'IphoneInstruction'
        )
    }
    goToMacInstruction(): string {
        return escapeString(
            'MacInstruction'
        )
    }

    getText(scene: s.Scene): string {
        let text = ''
        switch (scene.tpe) {
            case 'Start':
                text = this.start(scene)
                break
            case "IphoneInstruction":
                text = this.goToIphoneInstruction()
                break
            case "MacInstruction":
                text = this.goToMacInstruction()
                break
        }
        return text
    }
}
