import Rete from 'rete'

import { NodeData, ThothNode, ThothWorkerOutputs, ThothWorkerInputs } from '../../../types'
import { DropdownControl } from '../../dataControls/DropdownControl'
import { TaskOptions } from '../../plugins/taskPlugin/task'
import * as sockets from '../../sockets'
import { ThothComponent } from '../../thoth-component'
// import { DropdownControl } from '../../dataControls/DropdownControl';

const info = `Used to cast any socket into another socket type.  Be sure you know the type of input to your any to cast it into your socket type, as it might break things otherwise.`

export class Cast extends ThothComponent<void> {
  constructor() {
    // Name of the component
    super('Cast')

    this.task = {
      outputs: {},
    } as TaskOptions
    this.category = 'Utility'
    this.info = info
  }

  addSocket(node: ThothNode, name: sockets.SocketNameType) {
    console.log('adding socket', name)
    const key = sockets.socketNameMap[name]
    const output = sockets[key]
    const socket = new Rete.Output(key, name, output)
    const oldOutputKey = Array.from(node.outputs.keys())[0];
    const oldOutput = node.outputs.get(oldOutputKey)
    node.data.name = name

    const connection = node
      .getConnections()
      .filter(
        con => con['output'].key === oldOutputKey
      )[0]

    if (connection) node.inspector.editor.removeConnection(connection)
    if (oldOutput) {
      node.removeOutput(oldOutput)
      node.outputs.clear()
    }

    this.task.outputs = {}
    this.task.outputs[key] = 'output'
    node.addOutput(socket)
  }

  builder(node: ThothNode): ThothNode {
    const input = new Rete.Input('input', 'Input', sockets.anySocket, true)
    const output = new Rete.Output('output', 'Output', sockets.anySocket)

    const values = Object.keys(sockets.socketNameMap).filter(s => s !== 'Trigger')

    const socketDropdown = new DropdownControl({
      name: 'Socket Type',
      dataKey: 'socketType',
      values,
      defaultValue: 'any Type'
    })


    const that = this

    socketDropdown.onData = function (data) {
      that.addSocket.apply(that, [node, data])
    }

    node.inspector.add(socketDropdown)
    node.addInput(input).addOutput(output)

    if (node.data.socketType) {
      this.addSocket(node, node.data.socketType as sockets.SocketNameType)
    }

    return node
  }

  worker(node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs) {
    const value = inputs.input[0]
    const key = node.data.socketType

    return {
      [key as string]: value
    }
  }
}
