import Koa from 'koa'
import 'regenerator-runtime/runtime'
import { creatorToolsDatabase } from '../../databases/creatorTools'
import { Route } from '../../types'
import { CustomError } from '../../utils/CustomError'
import { buildThothInterface } from './buildThothInterface'
import { Graph, Module } from './types'

import otJson0 from 'ot-json0'
import { Op } from 'sequelize'
import { GraphData, Spell as SpellType } from '@thothai/thoth-core/types'
import { extractModuleInputKeys } from './runSpell'
import { SpellRunner } from '@thothai/thoth-core/server'

export const modules: Record<string, unknown> = {}

const runSpellHandler = async (ctx: Koa.Context) => {
  const { spell, version } = ctx.params
  const { isTest, userGameState = {} } = ctx.request.body

  const rootSpell = await creatorToolsDatabase.spells.findOne({
    where: { name: spell },
  })

  // eslint-disable-next-line functional/no-let
  let activeSpell

  if (version === 'latest') {
    console.log('latest')
    activeSpell = rootSpell
  } else {
    activeSpell = await creatorToolsDatabase.deployedSpells.findOne({
      where: { name: spell, version },
    })
  }

  //todo validate spell has an input trigger?

  if (!activeSpell?.graph) {
    throw new CustomError(
      'not-found',
      `Spell with name ${spell} and version ${version} not found`
    )
  }

  // TODO use test spells if body option is given
  // const activeSpell = getTestSpell(spell)
  const graph = activeSpell.graph as Graph
  // const modules = activeSpell.modules as Module[]

  // Build the interface
  const thothInterface = buildThothInterface(ctx, userGameState)

  // Extract any keys from the graphs inputs
  const inputKeys = extractModuleInputKeys(graph) as string[]

  // We should report on them here
  const inputs = inputKeys.reduce(
    (acc: { [x: string]: any[] }, input: string) => {
      const requestInput = ctx.request.body[input]

      if (requestInput) {
        acc[input] = requestInput
      } else {
        throw new CustomError('input-failed', `Missing required input ${input}`)
      }
      return acc
    },
    {} as Record<string, unknown>
  )

  const spellToRun = {
    // TOTAL HACK HERE
    ...(activeSpell as any).toJSON(),
    gameState: userGameState,
  }

  // Initialize the spell runner
  const spellRunner = new SpellRunner({ thothInterface })

  // Load the spell in to the spell runner
  await spellRunner.loadSpell(spellToRun as SpellType)

  try {
    // Get the outputs from running the spell
    const outputs = await spellRunner.defaultRun(inputs)

    // Get the updated state
    const state = thothInterface.getCurrentGameState()

    // Return the response
    ctx.body = { spell: activeSpell.name, outputs, state }
  } catch (err) {
    // return any errors
    console.error(err)
    throw new CustomError('server-error', err.message)
  }
}

const saveHandler = async (ctx: Koa.Context) => {
  console.log('ctx.request is', ctx.request)
  const body =
    typeof ctx.request.body === 'string'
      ? JSON.parse(ctx.request.body)
      : ctx.request.body

  console.log('ctx.request.body is', ctx.request.body)

  if (!body) throw new CustomError('input-failed', 'No parameters provided')

  const spell = await creatorToolsDatabase.spells.findOne({
    where: { id: body.id },
  }) as any

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
    const spellUpdate = otJson0.type.apply(spell.toJSON(), diff)

    const updatedSpell = await creatorToolsDatabase.spells.update(spellUpdate,
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

const deploySpellHandler = async (ctx: Koa.Context) => {
  const name = ctx.params.name
  const body =
    typeof ctx.request.body === 'string'
      ? JSON.parse(ctx.request.body)
      : ctx.request.body

  const spell = await creatorToolsDatabase.spells.findOne({ where: { name } })
  if (!spell) throw new CustomError('input-failed', 'spell not found')

  const lastDeployedSpell = await creatorToolsDatabase.deployedSpells.findOne({
    where: { name },
    order: [['version', 'desc']],
  })

  const newVersion: number = lastDeployedSpell
    ? lastDeployedSpell.version + 1
    : 1

  const newDeployedSpell = await creatorToolsDatabase.deployedSpells.create({
    name: spell.name,
    graph: spell.graph,
    versionName: body?.versionName,
    version: newVersion,
    message: body?.message,
    modules: spell.modules,
  })

  return (ctx.body = newDeployedSpell.id)
}

const getdeployedSpellsHandler = async (ctx: Koa.Context) => {
  const name = ctx.params.name

  const spells = await creatorToolsDatabase.deployedSpells.findAll({
    where: { name },
    attributes: { exclude: ['graph'] },
    order: [['version', 'desc']],
  })
  return (ctx.body = spells)
}

const getDeployedSpellHandler = async (ctx: Koa.Context) => {
  console.log('handling')
  console.log('ctx.request', ctx.request.body)
  console.log('ctx.params', ctx.params)
  const name = ctx.params.name ?? 'default'
  const version = ctx.params.version ?? 'latest'
  const spell = await creatorToolsDatabase.deployedSpells.findOne({
    where: { name: name, version: version },
  })
  console.log('done')
  return (ctx.body = spell)
}

export const spells: Route[] = [
  {
    path: '/game/spells/save',
    post: saveHandler,
  },
  {
    path: '/game/spells/saveDiff',
    post: saveDiffHandler,
  },
  {
    path: '/game/spells',
    post: newHandler,
  },
  {
    path: '/game/spells/:name',
    patch: patchHandler,
    delete: deleteHandler,
  },
  {
    path: '/game/spells',
    get: getSpellsHandler,
  },
  {
    path: '/game/spells/:name',
    get: getSpellHandler,
  },
  {
    path: '/game/spells/exists',
    post: postSpellExistsHandler,
  },
  {
    path: '/game/spells/:name/deploy',
    post: deploySpellHandler,
  },
  {
    path: '/game/spells/deployed/:name',
    get: getdeployedSpellsHandler,
  },
  {
    path: '/game/spells/deployed/:name/:version',
    get: getDeployedSpellHandler,
  },
  {
    path: '/spells/:spell/:version',
    post: runSpellHandler,
  },
]
