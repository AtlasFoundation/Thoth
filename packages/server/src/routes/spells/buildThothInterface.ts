import { CustomError } from './../../utils/CustomError'
import { EngineContext, ThothWorkerInputs } from '@thothai/thoth-core/types'
import Koa from 'koa'
import vm2 from 'vm2'
import * as events from '../../services/events'
import { GetEventArgs, CreateEventArgs } from '@thothai/thoth-core/types'

import { searchWikipedia } from '../wikipedia/helpers'
import queryGoogle from '../utils/queryGoogle'

export const buildThothInterface = (
  ctx: Koa.Context,
  initialGameState: Record<string, unknown>
): EngineContext => {
  // eslint-disable-next-line functional/no-let
  let gameState = { ...initialGameState }

  return {
    runSpell: () => {
      return {}
    },
    queryGoogle: async query => {
      const response = await queryGoogle(query)
      return response
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
        throw new CustomError(
          'server-error',
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
    },
    // IMPLEMENT THESE INTERFACES FOR THE SERVER
    getEvent: async (args: GetEventArgs) => {
      return await events.getEvents(args)
    },
    storeEvent: async (args: CreateEventArgs) => {
      return await events.createEvent(args)
    },
    getWikipediaSummary: async (keyword: string) => {
      let out = null
      try {
        out = (await searchWikipedia(keyword as string)) as any
      } catch (err) {
        throw new Error('Error getting wikipedia summary')
      }

      console.log('WIKIPEDIA SEARCH', out)

      return out
    },
  }
}
