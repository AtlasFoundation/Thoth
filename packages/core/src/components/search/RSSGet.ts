process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/* eslint-disable @typescript-eslint/no-inferrable-types */
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
import { BooleanControl } from '../../dataControls/BooleanControl'
import { InputControl } from '../../dataControls/InputControl'
import { triggerSocket, arraySocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = 'RSS Get is used to get a json array from an RSS feed'

type WorkerReturn = {
  output: any[]
}

export class RSSGet extends ThothComponent<Promise<WorkerReturn>> {
  constructor() {
    super('RSS Get')

    this.task = {
      outputs: {
        output: 'output',
        trigger: 'option',
      },
    }

    this.category = 'Search'
    this.display = true
    this.info = info
  }

  builder(node: ThothNode) {
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const dataOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const output = new Rete.Output('output', 'Output', arraySocket)

    const feedUrl = new InputControl({
      dataKey: 'feed_url',
      name: 'Feed URL',
    })
    const toDocument = new BooleanControl({
      dataKey: 'to_document',
      name: 'To Document',
    })

    node.inspector.add(feedUrl).add(toDocument)

    return node.addInput(dataInput).addOutput(dataOutput).addOutput(output)
  }

  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, thoth }: { silent: boolean; thoth: EngineContext }
  ) {
    const feed_url = node?.data?.feed_url as string
    const to_document = node?.data?.to_document

    if (feed_url === undefined || !feed_url || feed_url?.length <= 0) {
      return {
        output: [],
      }
    }

    let resp: any = undefined
    try {
      resp = await axios.get(feed_url)
    } catch (e) {
      resp = await axios.get(process.env.REACT_APP_CORS_URL + '/' + feed_url)
    }

    const data: any[] = []
    if (to_document === true || to_document === 'true') {
      for (let i = 0; i < resp.data.items.length; i++) {
        const object = {
          title: resp.data.items[i].title,
          description: resp.data.items[i].content_html
            .replace('<br>', '\\n')
            .replace('</p>', '\\n')
            .replace(/<[^>]*>?/gm, ''),
        }
        data.push(object)
      }
    } else {
      for (let i = 0; i < resp.data.items.length; i++) {
        data.push(resp.data.items[i])
      }
    }

    return {
      output: data,
    }
  }
}
