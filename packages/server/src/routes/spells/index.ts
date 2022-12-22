import Koa from 'koa'
import 'regenerator-runtime/runtime'
import { creatorToolsDatabase } from '../../databases/creatorTools'
import { Route } from '../../types'
import { CustomError } from '../../utils/CustomError'
import {
  buildThothInterface,
  extractModuleInputKeys,
  runSpell,
} from './runSpell'
import { Graph, Module } from './types'

import otJson0 from 'ot-json0'
import { Op } from 'sequelize'

export const modules: Record<string, unknown> = {}

const runSpellHandler = async (ctx: Koa.Context) => {
  const { spell, version } = ctx.params
  const { userGameState = {} } = ctx.request.body

  let rootSpell = await creatorToolsDatabase.spells.findOne({
    where: { name: spell },
  })

  //todo validate spell has an input trigger?

  if (!rootSpell?.graph) {
    throw new CustomError(
      'not-found',
      `Spell with name ${spell} and version ${version} not found`
    )
  }

  const graph = rootSpell.graph as Graph

  const modules = rootSpell.modules as Module[]

  const gameState = {
    ...rootSpell?.gameState,
    ...userGameState,
  }

  const thoth = buildThothInterface(ctx, gameState)

  const inputKeys = extractModuleInputKeys(graph) as string[]
  
  const spellInputs = ctx.request.body.inputs;

  const inputs = inputKeys.reduce((inputs, expectedInput: string) => {
    const requestInput = spellInputs

    if (requestInput) {
      inputs[expectedInput] = [requestInput]

      return inputs
    } else {
      return ctx.body = { 'error': `Spell expects a value for ${expectedInput} to be provided `}
      // throw new CustomError(
      //   'input-failed',
      //   error
      // )
    }
  }, {} as Record<string, unknown>)

  const outputs = await runSpell(graph, inputs, thoth, modules)

  const newGameState = thoth.getCurrentGameState()
  const body = { spell: rootSpell.name, outputs, gameState: newGameState }
  ctx.body = body
}

const saveHandler = async (ctx: Koa.Context) => {
  const body =
    typeof ctx.request.body === 'string'
      ? JSON.parse(ctx.request.body)
      : ctx.request.body

  if (!body) throw new CustomError('input-failed', 'No parameters provided')

  const spell = await creatorToolsDatabase.spells.findOne({
    where: { id: body.id },
  })

  if (spell) {
    throw new CustomError(
      'input-failed',
      'A spell with that name already exists.'
    )
  }

  if (!spell) {
    const newSpell = await creatorToolsDatabase.spells.create({
      name: body.name,
      graph: body.graph,
      gameState: body.gameState || {},
      modules: body.modules || [],
    })
    return (ctx.body = { id: newSpell.id })
  } else {
    // TODO eventually we should actually validate the body before dumping it in.
    await spell.update(body)
    return (ctx.body = { id: spell.id })
  }
}

const saveDiffHandler = async (ctx: Koa.Context) => {
  const { body } = ctx.request
  const { name, diff } = body

  if (!body) throw new CustomError('input-failed', 'No parameters provided')

  const spell = await creatorToolsDatabase.spells.findOne({
    where: { name },
  })

  if (!spell)
    throw new CustomError('input-failed', `No spell with ${name} name found.`)
  if (!diff)
    throw new CustomError('input-failed', 'No diff provided in request body')

  try {
    const newGraph = otJson0.type.apply(spell.graph, diff)

    const updatedSpell = await creatorToolsDatabase.spells.update(
      {
        graph: newGraph,
      },
      {
        where: { name },
      }
    )

    ctx.response.status = 200
    ctx.body = updatedSpell
  } catch (err) {
    throw new CustomError('server-error', 'Error processing diff.', err)
  }
}

const newHandler = async (ctx: Koa.Context) => {
  const body = ctx.request.body
  if (!body) throw new CustomError('input-failed', 'No parameters provided')

  const missingBody = ['graph', 'name'].filter(property => !body[property])

  if (missingBody.length > 0) {
    const message = `Request body missing ${missingBody.join(', ')} values`
    throw new CustomError('input-failed', message)
  }

  // TODO fix these typescript errors
  //@ts-ignore
  const spell = await creatorToolsDatabase.spells.findOne({
    //@ts-ignore
    where: {
      name: body.name,
      deletedAt: { [Op.ne]: null },
    },
    paranoid: false,
  })

  if (spell) await spell.destroy({ force: true })

  const newSpell = await creatorToolsDatabase.spells.create({
    name: body.name,
    graph: body.graph,
    gameState: {},
    modules: [],
  })

  return (ctx.body = newSpell)
}

const patchHandler = async (ctx: Koa.Context) => {
  const name = ctx.params.name
  const spell = await creatorToolsDatabase.spells.findOne({
    where: {
      name,
    },
  })
  if (!spell) throw new CustomError('input-failed', 'spell not found')

  await spell.update(ctx.request.body)

  return (ctx.body = { id: spell.id })
}

const getSpellsHandler = async (ctx: Koa.Context) => {
  let queryBody: any = {}
  const spells = await creatorToolsDatabase.spells.findAll({
    ...queryBody,
    attributes: {
      exclude: ['graph', 'gameState', 'modules'],
    },
  })
  ctx.body = spells
}

const getSpellHandler = async (ctx: Koa.Context) => {
  const name = ctx.params.name
  try {
    const spell = await creatorToolsDatabase.spells.findOne({
      where: { name },
    })

    if (!spell) {
      const newSpell = await creatorToolsDatabase.spells.create({
        name,
        graph: { id: 'demo@0.1.0', nodes: {} },
        gameState: {},
        modules: [],
      })
      ctx.body = newSpell
    } else {
      ctx.body = spell
    }
  } catch (e) {
    console.error(e)
  }
}

// TODO create a 'build handler' WHOF that can take in things like an array of required params and parse errors, etc.

const postSpellExistsHandler = async (ctx: Koa.Context) => {
  const body = ctx.request.body
  if (!body) throw new CustomError('input-failed', 'No parameters provided')

  const missingBody = ['name'].filter(property => !body[property])

  if (missingBody.length > 0) {
    const message = `Request body missing ${missingBody.join(', ')} values`
    throw new CustomError('input-failed', message)
  }

  const { name } = ctx.body as { name: string }

  try {
    const spell = await creatorToolsDatabase.spells.findOne({
      where: { name },
    })

    if (spell) return (ctx.body = true)

    ctx.body = false
  } catch (err) {
    ctx.body = false
  }
}

const deleteHandler = async (ctx: Koa.Context) => {
  const name = ctx.params.name
  const spell = await creatorToolsDatabase.spells.findOne({
    where: { name },
  })
  if (!spell) throw new CustomError('input-failed', 'spell not found')

  try {
    await spell.destroy()

    ctx.body = true
  } catch (err) {
    throw new CustomError('server-error', 'error deleting spell')
  }
}

export const spells: Route[] = [
  {
    path: '/spells/save',
    post: saveHandler,
  },
  {
    path: '/spells/saveDiff',
    post: saveDiffHandler,
  },
  {
    path: '/spells',
    post: newHandler,
  },
  {
    path: '/spells/:name',
    patch: patchHandler,
    delete: deleteHandler,
  },
  {
    path: '/spells',
    get: getSpellsHandler,
  },
  {
    path: '/spells/:name',
    get: getSpellHandler,
  },
  {
    path: '/spells/exists',
    post: postSpellExistsHandler,
  },
  {
    path: '/:spell/:version',
    post: runSpellHandler,
  },
]
