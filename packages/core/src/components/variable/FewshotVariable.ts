/* eslint-disable @typescript-eslint/no-unused-vars */
import Rete from 'rete'

import {
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../../types'
import { FewshotControl } from '../../dataControls/FewshotControl'
import { InputControl } from '../../dataControls/InputControl'
import { anySocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = `Fewshot Variable`

const fewshot = ``

type InputReturn = {
  output: string
}

export class FewshotVariable extends ThothComponent<InputReturn> {
  constructor() {
    super('Fewshot Variable')

    this.task = {
      outputs: {
        output: 'output',
      },
    }

    this.category = 'Variable'
    this.info = info
    this.display = true
  }

  builder(node: ThothNode) {
    if (!node.data.fewshot) node.data.fewshot = fewshot
    const out = new Rete.Output('output', 'output', anySocket)

    const name = new InputControl({
      dataKey: 'name',
      name: 'Name',
      icon: 'moon',
    })

    const fewshotControl = new FewshotControl({})

    node.inspector.add(fewshotControl).add(name)

    return node.addOutput(out)
  }

  worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, data }: { silent: boolean; data: string | undefined }
  ) {
    const fewshot = node.data.fewshot as string

    this.name = node?.data?.name as string

    return {
      output: fewshot,
    }
  }
}
