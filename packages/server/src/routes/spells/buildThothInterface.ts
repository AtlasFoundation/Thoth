import { CustomError } from './../../utils/CustomError';
import { EngineContext, ThothWorkerInputs } from '@thothai/thoth-core/types'
import Koa from 'koa'
import vm2 from 'vm2'
import { CompletionRequest, completionsParser } from '../completions'

export const buildThothInterface = (
  ctx: Koa.Context,
  initialGameState: Record<string, unknown>
): EngineContext => {
  // eslint-disable-next-line functional/no-let
  let gameState = { ...initialGameState }

  return {
    completion: async (request: CompletionRequest) => {
      const response = await completionsParser({
        ...request,
        prompt: request.prompt?.trim(),
        stop: request.stop,
      })
      return response?.result || ''
    },
    runSpell: () => {
      return {}
    },
    readFromImageCache: async () => {
      return { images: [] }
    },
    processCode: (
      code: unknown,
      inputs: ThothWorkerInputs,
      data: Record<string, any>,
      state: Record<string, any>
    ) => {
      const { VM } = vm2
      const vm = new VM()

      const flattenInputs = Object.entries(
        inputs as ThothWorkerInputs
      ).reduce((acc, [key, value]) => {
        acc[key as string] = value[0]
        return acc
      }, {} as Record<string, any>)


      vm.freeze(data, 'data')
      vm.freeze(flattenInputs, 'input')
      vm.protect(state, 'state')


      const runCode = `"use strict"; function runFn(input,data,state){ return (${code})(input,data,state)}; runFn(input,data,state);`

      try {
        return vm.run(runCode)
      } catch (err) {
        console.log({ err })
        throw new CustomError('server-error', 'Error in spell runner: processCode component.')
      }
    },
    enkiCompletion: async (taskName: string, inputs: string) => {
      return { outputs: [] }
    },
    huggingface: async (model: string, options: any) => {
      // const outputs = await huggingface({ context: ctx, model, options })
      return {}
    },
    setCurrentGameState: (state) => {
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
    },
    getEvent: () => Promise.resolve(''),
    storeEvent: () => Promise.resolve(''),
    getWikipediaSummary: () => Promise.resolve({})
  }
}