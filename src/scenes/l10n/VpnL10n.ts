import {Scene} from "../../model/scene-types";

export interface VpnL10n {
  getText(scene: Scene): string
  
  //navigation
  goToMainMenu():string
  goToIphoneInstruction():string
  goToMacInstruction():string
  goToAndroidInstruction():string
  goToWindowsInstruction():string
  goToGeneralInfo():string
  goToGetConfigs():string
}