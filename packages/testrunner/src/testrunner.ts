import 'regenerator-runtime/runtime'
import { CreateSpellHandler } from './CreateSpellHandler'
import fs from 'fs'

async function init() {
  // read graphs in test graph directory
  const testGraphs = fs.readdirSync('./src/graphs').filter((file) => file.includes('spell'))

  // for each graph, log the name
  testGraphs.forEach(async (graph) => {
    // read the graph
    const graphData = fs.readFileSync(`./src/graphs/${graph}`, 'utf8')

    // read the manifest
    const manifestData = fs.readFileSync(`./src/graphs/${graph}`.replace('spell', 'manifest'), 'utf8')

    // convert the graph to JSON
    const graphJSON = JSON.parse(graphData)

    const spellHandler = await CreateSpellHandler(graphJSON)

    // read the manifest and convert to a JS object
    const manifest = JSON.parse(manifestData)

    // for each entry in the manifest, run the test
    for (const entry of manifest) {
        const resp = await spellHandler({
          message: entry.input,
          speaker: entry.speaker,
          agent: entry.agent,
          client: entry.client,
          channelId: entry.channelId,
          entity: entry.entity,
          eth_private_key: entry.eth_private_key,
          eth_public_address: entry.eth_public_address,
          channel: entry.channel,
        });
        console.log('resp', resp)
      }
    });
}

init()
