import vm2 from 'vm2'
import { EngineContext, ThothWorkerInputs } from '@thothai/thoth-core/types'
import { runSpell } from './api/spell'

export const buildThothInterface = (
  defaultState: Record<string, any>
): EngineContext => {
  // notes: need a way to replace state between runs?

  let gameState = {
    ...defaultState,
  }

  return {
    getCurrentGameState: () => gameState,
    setCurrentGameState: (state: Record<string, any>) => {
      gameState = state
    },
    queryGoogle: async () => { return "" },
    getEvent: () => new Promise(() => { }),
    storeEvent: () => new Promise(() => { }),
    getWikipediaSummary: () => new Promise(() => { }),
    updateCurrentGameState: (update: Record<string, unknown>) => {
      const newState = {
        ...gameState,
        ...update,
      }
      gameState = newState
    },
    async runSpell(inputs: Record<string, any>, spellId: string) {
      return runSpell({ spellId, inputs })
    },
    processCode: (
      code: unknown,
      inputs: ThothWorkerInputs,
      data: Record<string, any>,
      state: Record<string, any>
    ) => {
      const { VM } = vm2

      const logValues: any[] = []

      const sandboxConsole = {
        log: (val: any, ...rest: any[]) => {
          if (rest.length) {
            logValues.push(JSON.stringify([val, ...rest], null, 2))
          } else {
            logValues.push(JSON.stringify(val, null, 2))
          }
        },
      }

      const flattenedInputs = Object.entries(
        inputs as ThothWorkerInputs
      ).reduce((acc, [key, value]) => {
        // eslint-disable-next-line prefer-destructuring
        acc[key as string] = value[0] // as any[][0] <- this change was made 2 days ago
        return acc
      }, {} as Record<string, any>)

      const vm = new VM()

      vm.protect(state, 'state')

      vm.freeze(flattenedInputs, 'input')
      vm.freeze(data, 'data')
      vm.freeze(sandboxConsole, 'console')

      const codeToRun = `"use strict"; function runFn(input,data,state){ const copyFn=${code}; return copyFn(input,data,state)}; runFn(input,data,state);`
      try {
        return vm.run(codeToRun)
      } catch (err) {
        console.log({ err })
        throw new Error('Error in rungraph: processCode.')
      }
    },
  }
}
