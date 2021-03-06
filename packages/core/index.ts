import { getComponents, components } from './src/components/components'
import { initEditor } from './src/editor'
import { initSharedEngine } from './src/engine'
import { Task } from './src/plugins/taskPlugin/task'
import { ThothComponent } from './src/thoth-component'
export { zoomAt } from './src/plugins/areaPlugin/zoom-at'

export { getComponents } from './src/components/components'
export { initEditor } from './src/editor'
export { Task } from './src/plugins/taskPlugin/task'
export { Socket, Node, Control } from './src/plugins/reactRenderPlugin'

export default {
  components,
  getComponents,
  initSharedEngine,
  initEditor,
  Task,
  ThothComponent,
}
