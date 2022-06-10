<<<<<<< HEAD:core/src/plugins/socketGenerator/socketManager.ts
import {
  DataSocketType,
  GraphData,
  ThothEditor,
  ThothNode,
} from '../../../types'
=======
import { ChainData, DataSocketType, ThothNode } from '../../../types'
import { ThothEditor } from '../../editor'
>>>>>>> latitude/0.0.68:packages/core/src/plugins/socketGenerator/socketManager.ts
import { ModuleSocketType } from '../modulePlugin/module-manager'

export default class SocketManager {
  node: ThothNode
  editor: ThothEditor
  nodeOutputs: DataSocketType[] = []
  inputs: ModuleSocketType[]
  outputs: ModuleSocketType[]
  triggerOuts: ModuleSocketType[]
  triggerIns: ModuleSocketType[]

  constructor(node: ThothNode, editor: ThothEditor) {
    this.editor = editor
    this.node = node
  }

  initializeNode() {
    if (!this.node.data.inputs) this.node.data.inputs = []
    if (!this.node.data.outputs) this.node.data.outputs = []
  }

  updateSocketsFromChain(chain: GraphData) {}

  regenerateSockets() {}
}
