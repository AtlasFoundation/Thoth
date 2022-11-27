/* eslint-disable no-console */
import Rete from 'rete'
import { v4 as uuidv4 } from 'uuid'

import {
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../../types'
import { Task } from '../../plugins/taskPlugin/task'
import {
  arraySocket,
  stringSocket,
  triggerSocket,
  agentSocket,
} from '../../sockets'
import { ThothComponent, ThothTask } from '../../thoth-component'

const info = `Restructure Agent Data`

type InputReturn = {
  output: {
    Input: string
    Speaker: string
    Agent: string
    Client: string
    ChannelID: string
    Entity: object
    RoomInfo: {
      user: string
      inConversation: boolean
      isBot: boolean
      info3d: string
    }[]
  }
}

export class InputRestructureComponent extends ThothComponent<
  Promise<InputReturn>
> {
  nodeTaskMap: Record<number, ThothTask> = {}

  constructor() {
    // Name of the component
    super('Input Restructure')

    this.task = {
      outputs: {
        output: 'output',
        trigger: 'option',
      },
      init: (task = {} as Task, node: ThothNode) => {
        this.nodeTaskMap[node.id] = task
      },
    }

    this.category = 'Agents'
    this.info = info
    this.display = true
  }

  builder(node: ThothNode) {
    // module components need to have a socket key.
    // todo add this somewhere automated? Maybe wrap the modules builder in the plugin
    node.data.socketKey = node?.data?.socketKey || uuidv4()

    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const input = new Rete.Input('input', 'input', stringSocket)
    const speaker = new Rete.Input('speaker', 'speaker', stringSocket)
    const agent = new Rete.Input('agent', 'agent', stringSocket)
    const client = new Rete.Input('client', 'client', stringSocket)
    const channelId = new Rete.Input('channel', 'channel', stringSocket)
    const entity = new Rete.Input('entity', 'entity', stringSocket)
    const roomInfo = new Rete.Input('roomInfo', 'roomInfo', arraySocket)
    const dataOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const agentSoc = new Rete.Output('output', 'output', agentSocket)

    return node
      .addInput(speaker)
      .addInput(agent)
      .addInput(client)
      .addInput(channelId)
      .addInput(entity)
      .addInput(roomInfo)
      .addInput(input)
      .addInput(dataInput)
      .addOutput(agentSoc)
      .addOutput(dataOutput)
  }

  // eslint-disable-next-line require-await
  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent }: { silent: boolean }
  ) {
    const agent: any = {}
    Object.entries(inputs).map(([k, v]) => {
      agent[k] = v[0]
    })
    console.log('agent ::: ', agent)

    return {
      output: {
        Input: agent.input,
        Speaker: agent.speaker,
        Agent: agent.agent,
        Client: agent.client,
        ChannelID: agent.channel,
        Entity: agent.entity,
        RoomInfo: agent.roomInfo,
      },
    }
  }
}
