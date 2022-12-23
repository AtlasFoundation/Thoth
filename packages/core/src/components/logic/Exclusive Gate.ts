import Rete from 'rete'

import {
  DataSocketType,
  NodeData,
  ThothNode,
  ThothWorkerInputs,
} from '../../../types'
import { MultiSocketGeneratorControl } from '../../dataControls/MultiSocketGenerator'
import { anySocket, triggerSocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = `Fires once all connected triggers have fired.`

export class ExclusiveGate extends ThothComponent<void> {
  constructor() {
    // Name of the component
    super('Exclusive Gate')

    this.task = {
      outputs: { default: 'option' },
    }
    this.category = 'Logic'
    this.info = info
  }

  node = {}

  builder(node: ThothNode) {
    const multiInputGenerator = new MultiSocketGeneratorControl({
      connectionType: 'input',
      socketTypes: ['triggerSocket', 'anySocket'],
      name: 'Triggers',
    })

    node.inspector.add(multiInputGenerator)

    const triggerOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const dataOutput = new Rete.Output('output', 'Output', anySocket)

    node.addOutput(dataOutput).addOutput(triggerOutput)

    return node
  }

  // the worker contains the main business logic of the node.  It will pass those results
  // to the outputs to be consumed by any connected components
  worker(node: NodeData, inputs: ThothWorkerInputs) {
    const nodeInputs = Object.values(inputs as any).filter(
      (input: any) => !!input
    ) as DataSocketType[]

    console.log('inputs', inputs)

    console.log('nodeInputs', nodeInputs)

    // get the name of the first nodeInput with socketType triggerInput
    const triggerInput = nodeInputs.find(
      input => input.socketType === 'triggerSocket'
    )

    console.log('triggerInput', triggerInput)

    const shortName = triggerInput?.name.split(' ')[0] as string

    console.log('shortName', shortName)

    const dataInput = nodeInputs.find(
      input =>
        input.socketType === 'anySocket' && input.name.includes(shortName)
    ) as any

    console.log('dataInput', dataInput)

    const output = inputs[dataInput.name]

    return {
      output,
    }
  }
}
