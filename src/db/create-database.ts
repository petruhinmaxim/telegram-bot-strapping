import { Client } from 'pg'
import config from '../config/config'

async function main() {
  const dbConf = { ...config.db }
  dbConf.database = 'postgres'
  const client = new Client(dbConf)
  await client.connect()

  const existsRes = 
    await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [config.db.database])
  if (existsRes.rowCount > 0) {
      console.log(`Database "${config.db.database}" already exists`)
  } else {
      await client.query(`CREATE DATABASE ${config.db.database}`)
      console.log(`Database "${config.db.database}" created`)
  }
  await client.end()
}

main()