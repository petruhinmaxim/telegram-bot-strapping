import {VpnL10n} from './VpnL10n'
import * as s from '../../model/scene-types'
import {escapeString} from "../text-util";

export class VpnL10nRu implements VpnL10n {
    start(scene: s.Start): string {
        return escapeString(`Стартовая сцена тут. описание бота бла бла`)
    }

    //navigation
    goToMainMenu(): string {
        return escapeString(
            'Главное меню'
        )
    }

    goToIphoneInstruction(): string {
        return escapeString(
            'Инструкция Iphone'
        )
    }

    goToMacInstruction(): string {
        return escapeString(
            'Инструкция Mac'
        )
    }

    getText(scene: s.Scene): string {
        let text = ``
        switch (scene.tpe) {
            case `Start`:
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
