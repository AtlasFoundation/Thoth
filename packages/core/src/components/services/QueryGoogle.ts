import Rete from 'rete'

import { EngineContext, NodeData, ThothNode, ThothWorkerInputs, ThothWorkerOutputs } from '../../../types'
import { TaskOptions } from '../../plugins/taskPlugin/task'
import { stringSocket, triggerSocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = `When the alert component is triggered, it will fire an alert with the message in the input box.`

type WorkerReturn = {
  result: string
}

export class QueryGoogle extends ThothComponent<Promise<WorkerReturn>> {
  constructor() {
    // Name of the component
    super('Query Google')

    this.task = {
      outputs: {
        result: 'output',
        trigger: 'option'
      },
      init: () => { },
      onRun: () => { },
    } as TaskOptions
    this.category = 'Services'
    this.info = info
  }
  // the builder is used to "assemble" the node component.
  // when we have enki hooked up and have grabbed all few shots, we would use the builder
  // to generate the appropriate inputs and ouputs for the fewshot at build time
  builder(node: ThothNode): ThothNode {
    // create inputs here. First argument is the name, second is the type (matched to other components sockets), and third is the socket the i/o will use
    const query = new Rete.Input('query', 'Query', stringSocket)
    const triggerIn = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const triggerOut = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const result = new Rete.Output('result', 'Result', stringSocket)

    return node.addInput(triggerIn).addInput(query).addOutput(triggerOut).addOutput(result)
  }

  // the worker contains the main business logic of the node.  It will pass those results
  // to the outputs to be consumed by any connected components
  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { thoth }: { thoth: EngineContext }) {
    const { queryGoogle } = thoth

    const query = inputs.query[0] as string
    const result = await queryGoogle(query)

    return {
      result
    }
  }
}
