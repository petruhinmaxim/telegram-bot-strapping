export type Scene =
    Start | DeleteMassage | IphoneInstruction | MacInstruction

export type Start =  {
  tpe: 'Start'
  messageId?: number
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

