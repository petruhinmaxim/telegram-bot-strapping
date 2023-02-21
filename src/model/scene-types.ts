export type Scene =
    Start | DeleteMassage | IphoneInstruction | MacInstruction |
    AndroidInstruction | WindowsInstruction | GetConfigs | GeneralInfo

export type Start =  {
  tpe: 'Start'
  messageId?: number
  userName?: string
}

export type DeleteMassage =  {
  tpe: 'DeleteMassage'
  messageId?: number
}

export type IphoneInstruction =  {
  tpe: 'IphoneInstruction'
  messageId?: number
}

export type MacInstruction =  {
  tpe: 'MacInstruction'
  messageId?: number
}

export type AndroidInstruction =  {
  tpe: 'AndroidInstruction'
  messageId?: number
}

export type WindowsInstruction =  {
  tpe: 'WindowsInstruction'
  messageId?: number
}

export type GetConfigs =  {
  tpe: 'GetConfigs'
  messageId?: number
  mobileConfigData: string
  pcConfigData: string
}

export type GeneralInfo =  {
  tpe: 'GeneralInfo'
  messageId?: number
}
