import 'regenerator-runtime/runtime'
import { config } from 'dotenv-flow'
config()

// todo fix this import
import { roomManager } from '@thothai/thoth-core/src/components/agents/roomManager'
import { database } from './database'
import { World } from './entities/World'

async function init() {
  console.log('Starting agent runner')
  new database()
  await database.instance.connect()
  new World()
  new roomManager()
}

init()
