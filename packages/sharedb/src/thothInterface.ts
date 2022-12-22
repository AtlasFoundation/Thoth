import { EngineContext } from '@thothai/thoth-core/types'

export const buildThothInterface = (): EngineContext => {
  return {
    setCurrentGameState() { },
    getCurrentGameState() {
      return {}
    },
    updateCurrentGameState() { },
    async runSpell() {
      return {}
    },
    processCode() { },
  }
}
