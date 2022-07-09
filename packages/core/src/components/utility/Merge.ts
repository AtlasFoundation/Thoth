import { SocketGeneratorControl } from '../../dataControls/SocketGenerator';
import Rete from 'rete'

import { NodeData, ThothNode, ThothWorkerInputs, ThothWorkerOutputs } from '../../../types'
import { TaskOptions } from '../../plugins/taskPlugin/task'
import { objectSocket, triggerSocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'
import { InputControl } from '../../dataControls/InputControl';

const info = `Merge can take in any number of properties in the form of named sockets, and compose them together iinto an object.  Additionally, another object can be added in, in which case merge will add in any proprties from that object, but overwrite them with any from the sockets.`

export class Merge extends ThothComponent<void> {
  constructor() {
    // Name of the component
    super('Merge')

    this.task = {
      outputs: {
        trigger: 'option',
        object: 'output'
      },
      init: () => { },
      onRun: () => { },
    } as TaskOptions
    this.category = 'Utility'
    this.info = info
  }

  builder(node: ThothNode): ThothNode {
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const objectInput = new Rete.Input('object', 'Object (optional)', objectSocket)
    const outputTrigger = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const objectOutput = new Rete.Output('object', 'Object', objectSocket)

    const nameInput = new InputControl({
      dataKey: 'name',
      name: 'Node name',
    })

    const socketGenerator = new SocketGeneratorControl({
      connectionType: 'input',
      ignored: ['trigger', 'object'],
      name: 'Property Name',
    })

    node.inspector.add(nameInput).add(socketGenerator)

    node.addInput(dataInput).addInput(objectInput).addOutput(outputTrigger).addOutput(objectOutput)
    return node
  }

  worker(node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,) {
    const object = inputs.object[0] as Record<string, any>
    const combinedInputs = Object.entries(inputs).reduce((acc, [key, value]) => {
      if (key === 'object') return acc
      acc[key] = value[0]
      return acc
    }, {} as Record<string, any>)

    const combined = {
      ...object,
      ...combinedInputs
    }

    console.log("COMBINED OBJECT", combined)

    return {
      object: combined
    }
  }
}
