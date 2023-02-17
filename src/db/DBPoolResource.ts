import { ActorSystem } from 'comedy'
import { Pool } from 'pg'
import { Logger, actorLogger } from '../util/Logger'
import config from '../config/config'

export default class DBPoolResource {
  private log!: Logger
  private pool!: Pool
  
  async initialize(system: ActorSystem) {
    const rootActor = await system.rootActor()
    this.log = actorLogger(rootActor)
    this.log.info('Initializing DB Pool resource...')
    this.pool = new Pool(config.db)
  }

  async destroy() {
    await this.pool.end()
    this.log.info('DB Pool closed')
  }

  getResource() {
    return this.pool
  }
}