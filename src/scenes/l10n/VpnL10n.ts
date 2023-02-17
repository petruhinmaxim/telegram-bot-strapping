import * as s from '../../model/scene-types'
import {Scene} from "../../model/scene-types";

export interface VpnL10n {
  start(scene: s.Start): string
  getText(scene: Scene): string
  
  //navigation
  goToMainMenu():string
  goToIphoneInstruction():string
  goToMacInstruction():string
}