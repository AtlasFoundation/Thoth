import { IRunContextEditor, ThothNode } from '../../../types'
import { ThothComponent } from '../../thoth-component'

function install(editor: IRunContextEditor) {
  editor.on('componentregister', (component: ThothComponent<unknown>) => {
    const builder = component.builder

    // we are going to override the default builder with our own, and will invoke the original builder inside it.
    component.builder = (node: ThothNode) => {
      builder.call(component, node)
    }
  })
}

const defaultExport = {
  name: 'multiSocketGenerator',
  install,
}

export default defaultExport
