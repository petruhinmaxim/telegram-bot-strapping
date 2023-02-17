import { Logger, actorLogger } from '../util/Logger'
import { Actor, ActorRef } from 'comedy'
import { TelegrafActorProps } from './TelegrafActor'
import * as tg from '../model/telegram-massege-types';

export interface RootActorProps {
  mainToken: string
  adminToken: string
}

export default class RootActor {
  private log!: Logger
  private selfActor!: Actor
  private props!: RootActorProps
  private mainTelegrafActor!: ActorRef
  private adminTelegrafActor!: ActorRef
  private logicActor!: ActorRef

  initialize(selfActor: Actor) {
    this.log = actorLogger(selfActor)
    this.selfActor = selfActor
    this.props = selfActor.getCustomParameters()
    this.log.info('init')
  }

  async destroy() {
    await this.mainTelegrafActor?.destroy()
    await this.adminTelegrafActor?.destroy()
    await this.logicActor?.destroy()
  }

  async launch() {
    const [
      mainTelegrafActor,
      adminTelegrafActor,
      logicActor
    ] =
      await Promise.all([
        this.selfActor.createChild(
          '/src/actor/TelegrafActor',
          {
            customParameters: <TelegrafActorProps>{
              token: this.props.mainToken,
              channel: 'main'
            }
          }
        ),
        this.selfActor.createChild(
          '/src/actor/TelegrafActor',
          {
            customParameters: <TelegrafActorProps>{
              token: this.props.adminToken,
              channel: 'admin'
            }
          }
        ),
        this.selfActor.createChild('/src/actor/LogicActor')
      ])

    this.mainTelegrafActor = mainTelegrafActor
    this.adminTelegrafActor = adminTelegrafActor
    this.logicActor = logicActor

    await Promise.all([
      this.mainTelegrafActor.send('launch'),
      this.adminTelegrafActor.send('launch'),
    ])
  }

  async processInboundTelegramMessage(msg: tg.InboundTelegramMessage) {
    await this.logicActor.send('processInboundTelegramMessage', msg)
  }

  async processOutboundTelegramMessage(msg: tg.OutboundTelegramMessage) {
    switch (msg.channel) {
      case 'main':
        await this.mainTelegrafActor.send('processOutboundTelegramMessage', msg)
        break
      case 'admin':
        await this.adminTelegrafActor.send('processOutboundTelegramMessage', msg)
        break
    }
  }

  async processReturnOutboundWithMessageId(msg: tg.OutboundTelegramMessage) {
    await this.logicActor.send('processReturnOutboundWithMessageId', msg)
  }
}
