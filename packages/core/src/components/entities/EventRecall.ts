process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'
import Rete from 'rete'

import {
  EngineContext,
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../../types'
import { InputControl } from '../../dataControls/InputControl'
import { triggerSocket, stringSocket, anySocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

async function getEvent(
  type: string,
  agent: string,
  speaker: null | string,
  client: string,
  channel: string,
  maxCount = 10,
  max_time_diff = -1
) {
  const params = {
    type: type,
    agent: agent,
    speaker: speaker,
    client: client,
    channel: channel,
    maxCount: maxCount,
    max_time_diff: max_time_diff,
  }

  const serverRoot =
    process.env.REACT_APP_API_ROOT_URL ??
    process.env.API_ROOT_URL ??
    'https://localhost:8001'

  const response = await axios.get(`${serverRoot}/event`, {
    params,
  })

  return response.data
}

const info = 'Event Recall is used to get conversation for an agent and user'

//add option to get only events from max time difference (time diff, if set to 0 or -1, will get all events, otherwise will count in minutes)
type InputReturn = {
  output: unknown
}

export class EventRecall extends ThothComponent<Promise<InputReturn>> {
  constructor() {
    super('Event Recall')

    this.task = {
      outputs: {
        output: 'output',
        trigger: 'option',
      },
    }

    this.category = 'Agents'
    this.display = true
    this.info = info
  }

  builder(node: ThothNode) {
    const agentInput = new Rete.Input('agent', 'Agent', stringSocket)
    const speakerInput = new Rete.Input('speaker', 'Speaker', stringSocket)
    const clientInput = new Rete.Input('client', 'Client', stringSocket)
    const channelInput = new Rete.Input('channel', 'Channel', stringSocket)
    const out = new Rete.Output('output', 'Event', anySocket)
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const dataOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)

    const nameInput = new InputControl({
      dataKey: 'name',
      name: 'Input name',
    })

    const type = new InputControl({
      dataKey: 'type',
      name: 'Type',
      icon: 'moon',
    })

    const max_count = new InputControl({
      dataKey: 'max_count',
      name: 'Max Count',
      icon: 'moon',
    })

    const max_time_diff = new InputControl({
      dataKey: 'max_time_diff',
      name: 'Max Time Difference',
      icon: 'moon',
    })

    node.inspector.add(nameInput).add(max_count).add(type).add(max_time_diff)

    return node
      .addInput(agentInput)
      .addInput(speakerInput)
      .addInput(clientInput)
      .addInput(channelInput)
      .addInput(dataInput)
      .addOutput(dataOutput)
      .addOutput(out)
  }

  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, thoth }: { silent: boolean; thoth: EngineContext }
  ) {
    const speaker = inputs['speaker'] && (inputs['speaker'][0] as string)
    const agent = inputs['agent'] && (inputs['agent'][0] as string)
    const client = inputs['client'] && (inputs['client'][0] as string)
    const channel = inputs['channel'] && (inputs['channel'][0] as string)
    const typeData = node?.data?.type as string
    const type =
      typeData !== undefined && typeData.length > 0
        ? typeData.toLowerCase().trim()
        : 'none'

    const maxCountData = node.data?.max_count as string
    const maxCount = maxCountData ? parseInt(maxCountData) : 10
    const max_time_diffData = node.data?.max_time_diff as string
    const max_time_diff = max_time_diffData ? parseInt(max_time_diffData) : -1

    const conv = await getEvent(
      type,
      agent,
      speaker,
      client,
      channel,
      maxCount,
      max_time_diff
    )
    if (!silent) node.display(type + ' | :' + conv || 'Not found')

    return {
      output: conv ?? '',
    }
  }
}
