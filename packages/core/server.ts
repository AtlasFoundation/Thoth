import { getComponents, components } from './src/components/components'
import { initSharedEngine } from './src/engine'
import { Task } from './src/plugins/taskPlugin/task'
import SpellRunner from './src/spellManager/SpellRunner'
import { ThothComponent } from './src/thoth-component'

export { getComponents } from './src/components/components'
export { Task } from './src/plugins/taskPlugin/task'
export { initSharedEngine }
export { SpellRunner }

export * from './src/spellManager'
export * from './src/utils/chainHelpers'

export default {
  components,
  getComponents,
  initSharedEngine,
  Task,
  ThothComponent,
}
