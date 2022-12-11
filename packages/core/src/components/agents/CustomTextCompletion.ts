process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/* eslint-disable no-async-promise-executor */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'
import Rete from 'rete'

import {
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
  EngineContext,
} from '../../../types'
import { InputControl } from '../../dataControls/InputControl'
import { SocketGeneratorControl } from '../../dataControls/SocketGenerator'
import { triggerSocket, stringSocket, anySocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = 'Custom Text Completion is using OpenAI for the agent to respond.'

type WorkerReturn = {
  output: string
}

export class CustomTextCompletion extends ThothComponent<
  Promise<WorkerReturn>
> {
  constructor() {
    super('Custom Text Completion')

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
    const settings = new Rete.Input('settings', 'Settings', anySocket)
    const agentInput = new Rete.Input('agent', 'Agent', stringSocket)
    const speakerInput = new Rete.Input('speaker', 'Speaker', stringSocket)
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const dataOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const outp = new Rete.Output('output', 'output', stringSocket)

    const inputGenerator = new SocketGeneratorControl({
      connectionType: 'input',
      name: 'Input Sockets',
      ignored: ['trigger'],
    })

    const modelName = new InputControl({
      dataKey: 'modelName',
      name: 'Model Name',
      icon: 'moon',
    })

    const temperature = new InputControl({
      dataKey: 'temperature',
      name: 'Temperature',
      icon: 'moon',
    })

    const maxTokens = new InputControl({
      dataKey: 'maxTokens',
      name: 'Max Tokens',
      icon: 'moon',
    })

    const topP = new InputControl({
      dataKey: 'topP',
      name: 'Top P',
      icon: 'moon',
    })

    const frequencyPenalty = new InputControl({
      dataKey: 'frequencyPenalty',
      name: 'Frequency Penalty',
      icon: 'moon',
    })

    const presencePenalty = new InputControl({
      dataKey: 'presencePenalty',
      name: 'Presence Penalty',
      icon: 'moon',
    })

    const stop = new InputControl({
      dataKey: 'stop',
      name: 'Stop',
      icon: 'moon',
    })

    node.inspector
      .add(inputGenerator)
      .add(modelName)
      .add(temperature)
      .add(maxTokens)
      .add(topP)
      .add(frequencyPenalty)
      .add(presencePenalty)
      .add(stop)

    return node
      .addInput(agentInput)
      .addInput(speakerInput)
      .addInput(settings)
      .addInput(dataInput)
      .addOutput(dataOutput)
      .addOutput(outp)
  }

  async worker(
    node: NodeData,
    rawInputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, thoth }: { silent: boolean; thoth: EngineContext }
  ) {
    const agent = rawInputs['agent'][0] as string
    const speaker = rawInputs['speaker'][0] as string
    const inputs: any = Object.entries(rawInputs).reduce(
      (acc, [key, value]) => {
        console.log('key:', key, 'value:', value)
        acc[key] = value[0]
        return acc
      },
      {} as Record<string, unknown>
    )

    let data = ''
    for (const key in inputs) {
      if (
        key === 'Chat' ||
        key === 'agent' ||
        key === 'speaker' ||
        key === 'Static Chat' ||
        key === 'settings'
      ) {
        continue
      }
      if (key === 'Facts') {
        data += `The following are facts about ${agent}\n` + inputs[key] + '\n'
      } else {
        data += inputs[key] + '\n'
      }
    }
    data += `The following is a conversation with ${agent} and ${speaker}.\n`
    data += (inputs['Static Chat'] as string) ?? '' + '\n'
    data += inputs['Chat']
    data += '\n' + agent + ':'

    const settings = ((rawInputs.settings && rawInputs.settings[0]) ??
      {}) as any
    const modelName = settings.modelName ?? (node?.data?.modelName as string)
    const temperatureData =
      settings.temperature ?? (node?.data?.temperature as string)
    const temperature = parseFloat(temperatureData)
    const maxTokensData =
      settings.max_tokens ?? (node?.data?.maxTokens as string)
    const maxTokens = parseInt(maxTokensData)
    const topPData = settings.top_p ?? (node?.data?.topP as string)
    const topP = parseFloat(topPData)
    const frequencyPenaltyData =
      settings.frequency_penalty ?? (node?.data?.frequencyPenalty as string)
    const frequencyPenalty = parseFloat(frequencyPenaltyData)
    const presencePenaltyData =
      settings.presence_penalty ?? (node?.data?.presencePenalty as string)
    const presencePenalty = parseFloat(presencePenaltyData)
    const stop = settings.stop ?? (node?.data?.stop as string).split(',')
    for (let i = 0; i < stop.length; i++) {
      stop[i] = stop[i].trim()
      if (stop[i] === '\\n') {
        stop[i] = '\n'
      }
    }
    stop.push('\n\n')
    stop.push('\n\n\n')

    const filteredStop = stop.filter(function (el: any) {
      return el != null && el !== undefined && el.length > 0
    })

    console.log('---------------------------')
    console.log('created prompt:', data)
    console.log('---------------------------')
    console.log('filteredStop is', filteredStop)

    const resp = await axios.post(
      `${process.env.REACT_APP_API_URL ??
      process.env.API_URL ??
      'https://localhost:8001'
      }/text_completion`,
      {
        prompt: data,
        modelName: modelName,
        temperature: temperature,
        maxTokens: maxTokens,
        topP: topP,
        frequencyPenalty: frequencyPenalty,
        presencePenalty: presencePenalty,
        stop: filteredStop,
        agent: agent,
        sender: speaker,
      }
    )
    console.log('resp.data is ', resp.data)

    const { success, choice } = resp.data

    if (!success)
      return {
        output: 'Sorry, I had a completion error:' + JSON.stringify(resp.data),
      }

    const res =
      success !== 'false' && success !== false
        ? choice.text
        : 'Sorry, I had an error!'

    console.log('success:', success, 'choice:', choice.text, 'res:', res)

    return {
      output: res,
    }
  }
}
