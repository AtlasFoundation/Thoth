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
        trigger: 'option'
      },
      init: () => { },
      onRun: () => { },
    } as TaskOptions
    this.category = 'Utility'
    this.info = info
  }
  // the builder is used to "assemble" the node component.
  // when we have enki hooked up and have grabbed all few shots, we would use the builder
  // to generate the appropriate inputs and ouputs for the fewshot at build time
  builder(node: ThothNode): ThothNode {
    // create inputs here. First argument is the name, second is the type (matched to other components sockets), and third is the socket the i/o will use
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const objectInput = new Rete.Input('object', 'Object (optional)', objectSocket)
    const outputTrigger = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const objectOutput = new Rete.Output('object', 'Object', objectSocket)

    const nameInput = new InputControl({
      dataKey: 'name',
      name: 'Object name',
    })

    const socketGenerator = new SocketGeneratorControl({
      connectionType: 'input',
      name: 'Property Name',
      ignored: ['trigger', 'object'],
    })

    node.inspector.add(socketGenerator).add(nameInput)
    return node.addInput(dataInput).addInput(objectInput).addOutput(outputTrigger).addOutput(objectOutput)
  }

  // the worker contains the main business logic of the node.  It will pass those results
  // to the outputs to be consumed by any connected components
  worker(node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,) {
    const object = inputs.object[0] as Record<string, any>
    const combinedInputs = Object.entries(inputs).reduce((acc, [key, value]) => {
      acc[key] = value[0]
      return acc
    }, {} as Record<string, any>)

    const combined = {
      ...object,
      ...combinedInputs
    }

    return {
      object: combined
    }
  }
}
