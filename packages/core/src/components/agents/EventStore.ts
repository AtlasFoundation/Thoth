/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import axios from 'axios'
import Rete from 'rete'

import {
  Agent,
  EngineContext,
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../../types'
import { InputControl } from '../../dataControls/InputControl'
import { triggerSocket, stringSocket, agentSocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = 'Event Store is used to store events for an agent and user'

type CreateEventArgs = {
  type: string,
  agent: string,
  speaker: string,
  text: string,
  client: string,
  channel: string
}

export async function createEvent(
  { type,
    agent,
    speaker,
    text,
    client,
    channel }: CreateEventArgs
) {
  const response = await axios.post(
    `${process.env.REACT_APP_API_ROOT_URL ??
    process.env.API_ROOT_URL ??
    'https://localhost:8001'
    }/event`,
    {
      type,
      agent,
      speaker,
      text,
      client,
      channel,
    }
  )
  console.log('Created event', response.data)
  return response.data
}

export class EventStore extends ThothComponent<Promise<void>> {
  constructor() {
    super('Store Event')

    this.task = {
      outputs: {
        trigger: 'option',
      },
    }

    this.category = 'Agents'
    this.display = true
    this.info = info
  }

  builder(node: ThothNode) {
    const agentInput = new Rete.Input('agent', 'Agent', agentSocket)
    const factsInp = new Rete.Input('primary', 'Primary Event', stringSocket)

    const nameInput = new InputControl({
      dataKey: 'name',
      name: 'Input name',
    })

    const type = new InputControl({
      dataKey: 'type',
      name: 'Type',
      icon: 'moon',
    })

    node.inspector.add(nameInput).add(type)

    const factaInp = new Rete.Input(
      'secondary',
      'Secondary Event (Opt)',
      stringSocket
    )

    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const dataOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)

    return node
      .addInput(factsInp)
      .addInput(factaInp)
      .addInput(agentInput)
      .addInput(dataInput)
      .addOutput(dataOutput)
  }

  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, thoth }: { silent: boolean; thoth: EngineContext }
  ) {
    const agent = (inputs['agent'][0] as Agent)
    const primary = ((inputs['primary'] && inputs['primary'][0]) ||
      inputs['primary']) as string
    const secondary = ((inputs['secondary'] && inputs['secondary'][0]) ||
      inputs['secondary']) as string

    if (!primary) return console.log('Event null, so skipping')

    const typeData = node?.data?.type as string
    const type =
      typeData !== undefined && typeData.length > 0
        ? typeData.toLowerCase().trim()
        : 'none'

    let respUser
    let respAgent

    const { speaker, client, channel } = agent

    if (primary) {
      respUser = await createEvent(
        {
          type,
          agent: agent.agent,
          speaker,
          text: primary,
          client,
          channel
        }
      )
    }

    if (secondary) {
      respAgent = await createEvent(
        {
          type,
          agent: agent.agent,
          speaker: agent.agent,
          text: secondary,
          client,
          channel
        }
      )
    }
    if (!silent) node.display(respUser?.data + '|' + respAgent?.data)
  }
}