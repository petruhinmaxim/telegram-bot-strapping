import actors from 'comedy'
import config from '../config/config'

async function main() {
  const actorSystem = actors.createSystem({
    config: {},
    resources: [
      '/src/db/DBPoolResource',
      '/src/db/VpnDBResource'
    ]
  })
  const rootActor = await actorSystem.rootActor()

  const vpnRootActor = await rootActor.createChild(
    '/src/actor/RootActor',
    { customParameters: config.telegram }
  )
  await vpnRootActor.send('launch')
}

main().catch(console.dir)