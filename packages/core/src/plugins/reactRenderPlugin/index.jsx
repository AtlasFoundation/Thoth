import React from 'react'
import { Node } from './Node'

import { createRoot } from 'react-dom/client';


function install(editor, { component: NodeComponent = Node }) {
  editor.on(
    'rendernode',
    ({ el, node, component, bindSocket, bindControl }) => {
      if (component.render && component.render !== 'react') return
      const Component = component.component || NodeComponent
      const root = createRoot(el)

      node.update = () =>
        root.render(
          <Component
            node={node}
            editor={editor}
            bindSocket={bindSocket}
            bindControl={bindControl}
          />
        )
      node._reactComponent = true
      node.update()
    }
  )

  editor.on('rendercontrol', ({ el, control }) => {
    if (control.render && control.render !== 'react') return
    const Component = control.component
    const root = createRoot(el)

    control.update = () =>
      root.render(<Component {...control.props} />)
    control.update()
  })

  editor.on('connectioncreated connectionremoved', connection => {
    connection.output.node.update()
    connection.input.node.update()
  })

  editor.on('nodeselected', () => {
    editor.nodes.filter(n => n._reactComponent).map(node => node.update())
  })
}

export { Node } from './Node'
export { Socket } from './Socket'
export { Control } from './Control'

export default {
  name: 'react-render',
  install,
}
