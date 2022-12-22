import thothCore from '@thothai/thoth-core/dist/server'

const {
  components: { moduleInput, moduleOutput, tenseTransformer },
} = thothCore as any

export const components = [
  moduleInput(),
  moduleOutput(),
  tenseTransformer(),
]
