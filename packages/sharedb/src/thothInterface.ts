import { EngineContext } from '@thothai/thoth-core/types'

export const buildThothInterface = (): EngineContext => {
  return {
    async completion(body) {
      return 'testing'
    },
    setCurrentGameState() {},
    getCurrentGameState() {
      return {}
    },
    updateCurrentGameState() {},
    async huggingface() {
      return {}
    },
    async runSpell() {
      return {}
    },
    async readFromImageCache() {
      return { images: [] }
    },
    processCode() {},
  }
}
