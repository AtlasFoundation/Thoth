import { ThothWorkerInputs } from '@thothai/thoth-core/types'
import Koa from 'koa'
import vm2 from 'vm2'
export const buildThothInterface = (
  ctx: Koa.Context,
  initialGameState: Record<string, unknown>
): any => {
  // eslint-disable-next-line functional/no-let
  let gameState = { ...initialGameState }

  return {
    runSpell: () => {
      return {}
    },
    processCode: (
      code: unknown,
      inputs: ThothWorkerInputs,
      data: Record<string, any>,
      state: Record<string, any>
    ) => {
      const { VM } = vm2
      const vm = new VM()

      // Inputs are flattened before we inject them for a better code experience
      const flattenInputs = Object.entries(inputs).reduce(
        (acc, [key, value]: [string, any]) => {
          acc[key] = value[0]
          return acc
        },
        {} as Record<string, any>
      )

      // Freeze the variables we are injecting into the VM
      vm.freeze(data, 'data')
      vm.freeze(flattenInputs, 'input')
      vm.protect(state, 'state')

      // run the code
      const codeToRun = `"use strict"; function runFn(input,data,state){ return (${code})(input,data,state)}; runFn(input,data,state);`

      try {
        const codeResult = vm.run(codeToRun)
        console.log('CODE RESULT', codeResult)
        return codeResult
      } catch (err) {
        console.log({ err })
        throw new Error(
          'Error in spell runner: processCode component: ' + code
        )
      }
    },
    setCurrentGameState: state => {
      gameState = state
    },
    getCurrentGameState: () => {
      return gameState
    },
    updateCurrentGameState: (update: Record<string, unknown>) => {
      const newState = {
        ...gameState,
        ...update,
      }

      gameState = newState
    }
  }
}
