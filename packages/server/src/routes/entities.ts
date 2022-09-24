import { createWikipediaEntity } from '../entities/connectors/wikipedia'
import { database } from '../database'
import { handleInput } from '../entities/connectors/handleInput'
//@ts-ignore
import weaviate from 'weaviate-client'
import Koa from 'koa'
import 'regenerator-runtime/runtime'
import { noAuth } from '../middleware/auth'
import { Route } from '../types'
import axios from 'axios'
import { cacheManager } from '../cacheManager'
import { makeCompletion } from '../utils/MakeCompletionRequest'
import { MakeModelRequest } from '../utils/MakeModelRequest'
import { tts } from '../systems/googleTextToSpeech'
import { getAudioUrl } from './getAudioUrl'
import fs from 'fs'
import path from 'path'
import * as events from '../services/events'
import queryGoogleSearch from './utils/queryGoogle'
import { CustomError } from '../utils/CustomError'

export const modules: Record<string, unknown> = {}

const executeHandler = async (ctx: Koa.Context) => {
  const message = ctx.request.body.command
  const speaker = ctx.request.body.sender
  const agent = ctx.request.body.agent
  const entityId = ctx.request.body.entityId
  const id = ctx.request.body.id
  const msg = 'Hello'
  const spell_handler = ctx.request.body.handler ?? 'default'
  if (message.includes('/become')) {
    let out: any = {}
    if (!(await database.instance.entityExists(agent))) {
      out = await createWikipediaEntity('Speaker', agent, '', '')
    }

    if (out === undefined) {
      out = {}
    }

    out.defaultGreeting = await msg
    database.instance.createEvent(
      'conversation',
      agent,
      'web',
      id,
      agent,
      out.defaultGreeting
    )
    return (ctx.body = out)
  }
  ctx.body = await handleInput(
    message,
    speaker,
    agent,
    'web',
    id,
    spell_handler,
    entityId
  )
}

const createWikipediaEntityHandler = async (ctx: Koa.Context) => { }


const getEntitiesHandler = async (ctx: Koa.Context) => {
  try {
    let data = await database.instance.getEntities()
    return (ctx.body = data)
  } catch (e) {
    console.log('getEntitiesHandler:', e)
    ctx.status = 500
    return (ctx.body = { error: 'internal error' })
  }
}

const getEntityHandler = async (ctx: Koa.Context) => {
  try {
    const instanceId = ctx.request.query.instanceId as string
    const isNum = /^\d+$/.test(instanceId)
    const _instanceId = isNum
      ? parseInt(instanceId)
        ? parseInt(instanceId) >= 1
          ? parseInt(instanceId)
          : 1
        : 1
      : 1
    let data = await database.instance.getEntity(_instanceId)
    if (data === undefined || !data) {
      let newId = _instanceId
      while ((await database.instance.entityExists(newId)) || newId <= 0) {
        newId++
      }

      data = {
        id: newId,
        personality: '',
        enabled: true,
      }
    }
    return (ctx.body = data)
  } catch (e) {
    console.log('getEntityHandler:', e)
    ctx.status = 500
    return (ctx.body = { error: 'internal error' })
  }
}

const addEntityHandler = async (ctx: Koa.Context) => {
  const data = ctx.request.body.data
  let instanceId = ctx.request.body.id ?? ctx.request.body.instanceId

  if (!instanceId || instanceId === undefined || instanceId <= 0) {
    instanceId = 0
    while (
      (await database.instance.entityExists(instanceId)) ||
      instanceId <= 0
    ) {
      instanceId++
    }
  }

  try {
    console.log('updated agent database with', data)
    if (Object.keys(data).length <= 0)
      return (ctx.body = await database.instance.createEntity())
    return (ctx.body = await database.instance.updateEntity(instanceId, data))
  } catch (e) {
    console.log('addEntityHandler:', e)
    ctx.status = 500
    return (ctx.body = { error: 'internal error' })
  }
}

const deleteEntityHandler = async (ctx: Koa.Context) => {
  const { id } = ctx.params
  console.log('deleteEntityHandler', deleteEntityHandler)

  try {
    return (ctx.body = await database.instance.deleteEntity(id))
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const getGreetings = async (ctx: Koa.Context) => {
  const { enabled } = ctx.request.query
  try {
    const greetings = await database.instance.getGreetings(!!enabled)
    return (ctx.body = greetings)
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const addGreetings = async (ctx: Koa.Context) => {
  try {
    const { enabled, sendIn, channelId, message } = ctx.request.body
    const { id } = ctx.params

    if (!id)
      await database.instance.addGreeting(enabled, sendIn, channelId, message)
    else
      await database.instance.updateGreeting(
        enabled,
        sendIn,
        channelId,
        message,
        id
      )

    return (ctx.body = 'ok')
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const deleteGreeting = async (ctx: Koa.Context) => {
  try {
    const { id } = ctx.params
    await database.instance.deleteGreeting(id)
    return (ctx.body = 'ok')
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const getEvent = async (ctx: Koa.Context) => {
  const type = ctx.request.query.type as string
  const agent = ctx.request.query.agent
  const speaker = ctx.request.query.speaker
  const client = ctx.request.query.client
  const channel = ctx.request.query.channel
  const maxCount = parseInt(ctx.request.query.maxCount as string)
  const event = await database.instance.getEvents(
    type,
    agent,
    speaker,
    client,
    channel,
    true,
    maxCount
  )

  console.log('event, query:', ctx.request.query, 'conv:', event)

  return (ctx.body = { event })
}

const getAllEvents = async (ctx: Koa.Context) => {
  try {
    const events = await database.instance.getAllEvents()
    return (ctx.body = events)
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const getSortedEventsByDate = async (ctx: Koa.Context) => {
  try {
    const sortOrder = ctx.request.query.order as string
    if (!['asc', 'desc'].includes(sortOrder)) {
      ctx.status = 400
      return (ctx.body = 'invalid sort order')
    }
    const events = await database.instance.getSortedEventsByDate(sortOrder)
    return (ctx.body = events)
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const deleteEvent = async (ctx: Koa.Context) => {
  try {
    const { id } = ctx.params
    if (!parseInt(id)) {
      ctx.status = 400
      return (ctx.body = 'invalid url parameter')
    }
    const res = await database.instance.deleteEvent(id)
    return (ctx.body = res.rowCount)
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const updateEvent = async (ctx: Koa.Context) => {
  try {
    const { id } = ctx.params
    if (!parseInt(id)) {
      ctx.status = 400
      return (ctx.body = 'invalid url parameter')
    }

    const agent = ctx.request.body.agent
    const sender = ctx.request.body.sender
    const client = ctx.request.body.client
    const channel = ctx.request.body.channel
    const text = ctx.request.body.text
    const type = ctx.request.body.type
    const date = ctx.request.body.date

    const res = await database.instance.updateEvent(id, {
      agent,
      sender,
      client,
      channel,
      text,
      type,
      date,
    })
    return (ctx.body = res)
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const createEvent = async (ctx: Koa.Context) => {
  const agent = ctx.request.body.agent
  const speaker = ctx.request.body.speaker
  const client = ctx.request.body.client
  const channel = ctx.request.body.channel
  const text = ctx.request.body.text
  const type = ctx.request.body.type
  console.log('Creating event:', agent, speaker, client, channel, text, type)

  // Todo needs error handling
  await events.createEvent({
    type,
    agent,
    client,
    channel,
    speaker,
    text
  })

  return (ctx.body = 'ok')
}

const getTextToSpeech = async (ctx: Koa.Context) => {
  const text = ctx.request.query.text as string
  const character = (ctx.request.query.character ?? 'none')
  console.log('text and character are', text, character)
  const voice_provider = ctx.request.query.voice_provider as string
  const voice_character = ctx.request.query.voice_character as string
  const voice_language_code = ctx.request.query.voice_language_code

  console.log('text and character are', text, voice_character)
  const cache = await cacheManager.instance.get(
    'voice_' + voice_provider + '_' + voice_character + '_' + text
  )
  if (cache !== undefined && cache !== null && cache.length > 0) {
    console.log('got sst from cache, cache:', cache)
    return (ctx.body = cache)
  }

  let url = ''

  if (!cache && cache.length <= 0) {
    if (voice_provider === 'uberduck') {
      url = await getAudioUrl(
        process.env.UBER_DUCK_KEY as string,
        process.env.UBER_DUCK_SECRET_KEY as string,
        voice_character as string,
        text as string
      )
    } else {
      url = await tts(
        text,
        voice_provider,
        voice_character,
      )
    }
  }

  console.log('stt url:', url)

  if (url && url.length > 0) {
    cacheManager.instance.set(
      'voice_' + voice_provider + '_' + voice_character + '_' + text,
      url
    )
  }

  return (ctx.body = url)
}

const getEntityImage = async (ctx: Koa.Context) => {
  const agent = ctx.request.query.agent

  const resp = await axios.get(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=original&titles=${agent}`
  )

  if (
    resp.data.query.pages &&
    resp.data.query.pages.length > 0 &&
    resp.data.query.pages[0].original
  ) {
    return (ctx.body = resp.data.query.pages[0].original.source)
  }

  return (ctx.body = '')
}

const customMessage = async (ctx: Koa.Context) => {
  const sender = ctx.request.body?.sender as string
  const agent = ctx.request.body?.agent as string
  const message = (ctx.request.body?.message as string).trim().toLowerCase()
  let isVoice = ctx.request.body?.isVoice as boolean
  let url: any = ''
  let response = message

  if (message.startsWith('[welcome]')) {
    const user = message.replace('[welcome]', '').trim()
    response = 'Welcome ' + user + '!'
    isVoice = true
  }
  let cmd = message.trim().toLowerCase()

  if (cmd.length <= 0) {
    response = "I can't understand you!"
  } else if (cmd === 'play') {
  } else if (cmd === 'pause') {
  } else if (cmd.startsWith('go to')) {
  } else {
    response = await requestInformationAboutVideo(sender, agent, cmd)
  }

  if (isVoice) {
    console.log('generating voice')
    const character = 'kurzgesagt'
    const cache = cacheManager.instance.get(
      'speech_' + character + ': ' + response
    )
    if (cache !== undefined && cache !== null) {
      return (ctx.body = cache)
    }

    url = await getAudioUrl(
      process.env.UBER_DUCK_KEY as string,
      process.env.UBER_DUCK_SECRET_KEY as string,
      character as string,
      response as string
    )

    cacheManager.instance.set('speech_' + character + ': ' + response, url)
  }

  return (ctx.body = { response: isVoice ? url : message, isVoice: isVoice })
}

const getFromCache = async (ctx: Koa.Context) => {
  const key = ctx.request.query.key as string
  const agent = ctx.request.query.agent as string

  const value = cacheManager.instance.get(key)
  return (ctx.body = { data: value })
}

const deleteFromCache = async (ctx: Koa.Context) => {
  const key = ctx.request.query.key as string
  const agent = ctx.request.query.agent as string

  cacheManager.instance._delete(key)
  return (ctx.body = 'ok')
}

const setInCache = async (ctx: Koa.Context) => {
  const key = ctx.request.body.key as string
  const agent = ctx.request.body.agent as string
  const value = ctx.request.body.value

  cacheManager.instance.set(key, value)
  return (ctx.body = 'ok')
}

const textCompletion = async (ctx: Koa.Context) => {
  const prompt = ctx.request.body.prompt as string
  const modelName = ctx.request.body.modelName as string
  const temperature = ctx.request.body.temperature as number
  const maxTokens = ctx.request.body.maxTokens as number
  const topP = ctx.request.body.topP as number
  const frequencyPenalty = ctx.request.body.frequencyPenalty as number
  const presencePenalty = ctx.request.body.presencePenalty as number
  const sender = (ctx.request.body.sender as string) ?? 'User'
  let stop = ctx.request.body.stop as string[]

  if (!stop || stop.length === undefined || stop.length <= 0) {
    stop = ['"""', `${sender}:`, '\n']
  } else {
    for (let i = 0; i < stop.length; i++) {
      if (stop[i] === '#speaker:') {
        stop[i] = `${sender}:`
      }
    }
  }

  console.log("COMPLETION CAME IN")

  const { success, choice } = await makeCompletion(modelName, {
    prompt: prompt.trim(),
    temperature: temperature,
    max_tokens: maxTokens,
    top_p: topP,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
    stop: stop,
  })

  return (ctx.body = { success, choice })
}

const hfRequest = async (ctx: Koa.Context) => {
  const inputs = ctx.request.body.inputs as string
  const model = ctx.request.body.model as string
  const parameters = ctx.request.body.parameters as any
  const options = (ctx.request.body.options as any) || {
    use_cache: false,
    wait_for_model: true,
  }

  const { success, data } = await MakeModelRequest(
    inputs,
    model,
    parameters,
    options
  )

  return (ctx.body = { success, data })
}

const makeWeaviateRequest = async (ctx: Koa.Context) => {
  const keyword = ctx.request.body.keyword as string

  const client = weaviate.client({
    scheme: 'http',
    host: 'semantic-search-wikipedia-with-weaviate.api.vectors.network:8080/',
  })

  const res = await client.graphql
    .get()
    .withNearText({
      concepts: [keyword],
      certainty: 0.75,
    })
    .withClassName('Paragraph')
    .withFields('title content inArticle { ... on Article {  title } }')
    .withLimit(3)
    .do()

  console.log("RESPONSE", res)

  if (res?.data?.Get !== undefined) {
    return (ctx.body = { data: res.data.Get })
  }
  return (ctx.body = { data: '' })
}

const getEntityData = async (ctx: Koa.Context) => {
  const agent = ctx.request.query.agent as string

  const data = await database.instance.getEntity(agent)

  return (ctx.body = { agent: data })
}

const requestInformationAboutVideo = async (
  sender: string,
  agent: string,
  question: string
): Promise<string> => {
  const videoInformation = ``
  const prompt = `Information: ${videoInformation} \n ${sender}: ${question.trim().endsWith('?') ? question.trim() : question.trim() + '?'
    }\n${agent}:`

  const modelName = 'davinci'
  const temperature = 0.9
  const maxTokens = 100
  const topP = 1
  const frequencyPenalty = 0.5
  const presencePenalty = 0.5
  const stop: string[] = ['"""', `${sender}:`, '\n']

  const { success, choice } = await makeCompletion(modelName, {
    prompt: prompt,
    temperature: temperature,
    max_tokens: maxTokens,
    top_p: topP,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
    stop: stop,
  })

  return success ? choice : "Sorry I can't answer your question!"
}

const chatEntity = async (ctx: Koa.Context) => {
  const speaker = ctx.request.body.speaker as string
  const agent = ctx.request?.body?.agent as string

  const personality = ''
  const facts = ''
  let out = undefined

  if (!(await database.instance.entityExists(agent))) {
    out = await createWikipediaEntity(speaker, agent, personality, facts)
  }

  if (out === undefined) {
    out = {}
  }

  return (ctx.body = out)
}

const getEntitiesInfo = async (ctx: Koa.Context) => {
  const id = (ctx.request.query.id as string)
    ? parseInt(ctx.request.query.id as string)
    : -1

  try {
    let data = await database.instance.getEntities()
    let info = undefined
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        info = data[i]
      }
    }

    return (ctx.body = info)
  } catch (e) {
    console.log('getEntitiesHandler:', e)
    ctx.status = 500
    return (ctx.body = { error: 'internal error' })
  }
}

const handleCustomInput = async (ctx: Koa.Context) => {
  const message = ctx.request.body.message as string
  const speaker = ctx.request.body.sender as string
  const agent = ctx.request.body.agent as string
  const client = ctx.request.body.client as string
  const channelId = ctx.request.body.channelId as string

  return (ctx.body = {
    response: handleInput(
      message,
      speaker,
      agent,
      client,
      channelId,
      1,
      'default',
      'latest'
    ),
  })
}

const zoomBufferChunk = async (ctx: Koa.Context) => {
  const chunk = ctx.request.body.chunk
  console.log('GOT ZOOM BUFFER CHUNK:', chunk)
  return (ctx.body = 'ok')
}

const getCalendarEvents = async (ctx: Koa.Context) => {
  try {
    let calendarEvents = await database.instance.getCalendarEvents()
    return (ctx.body = calendarEvents)
  } catch (e) {
    ctx.status = 500
    return (ctx.body = { error: 'internal error' })
  }
}
const addCalendarEvent = async (ctx: Koa.Context) => {
  const name = ctx.request.body.name
  const date = ctx.request.body.date
  const time = ctx.request.body.time
  const type = ctx.request.body.type
  const moreInfo = ctx.request.body.moreInfo

  try {
    await database.instance.createCalendarEvent(
      name,
      date,
      time,
      type,
      moreInfo
    )
    return (ctx.body = 'inserted')
  } catch (e) {
    ctx.status = 500
    return (ctx.body = { payload: [], message: 'internal error' })
  }
}

const editCalendarEvent = async (ctx: Koa.Context) => {
  const id = ctx.params.id
  const name = ctx.request.body.name
  const date = ctx.request.body.date
  const time = ctx.request.body.time
  const type = ctx.request.body.type
  const moreInfo = ctx.request.body.moreInfo

  try {
    await database.instance.editCalendarEvent(
      id,
      name,
      date,
      time,
      type,
      moreInfo
    )
    return (ctx.body = 'edited')
  } catch (e) {
    ctx.status = 500
    return (ctx.body = { error: 'internal error' })
  }
}

const deleteCalendarEvent = async (ctx: Koa.Context) => {
  const id = ctx.params.id
  try {
    await database.instance.deleteCalendarEvent(id)
    return (ctx.body = 'deleted')
  } catch (e) {
    ctx.status = 500
    return (ctx.body = { error: 'internal error' })
  }
}

const addVideo = async (ctx: Koa.Context) => {
  try {
    let { path: videoPath, name, type: mimeType } = ctx.request?.files?.video as any
    const [type] = mimeType.split('/')
    if (type !== 'video') {
      ctx.response.status = 400
      return (ctx.body = 'Only video can be uploaded')
    }

    fs.copyFileSync(
      videoPath,
      path.join(process.cwd(), `/files/videos/${name}`)
    )
    return (ctx.body = 'ok')
  } catch (e) {
    ctx.status = 500
    return (ctx.body = { error: 'internal error' })
  }
}

const post_pipedream = async (ctx: Koa.Context) => {
  console.log('testPipeDream:', ctx.request)
  return (ctx.body = 'ok')
}

const getMessageReactions = async (ctx: Koa.Context) => {
  try {
    const message_reactions = await database.instance.getMessageReactions()
    return (ctx.body = message_reactions)
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}
const createMessageReaction = async (ctx: Koa.Context) => {
  try {
    const { reaction, spell_handler, discord_enabled, slack_enabled } =
      ctx.request.body
    const { id } = ctx.params

    console.log('got body data:', ctx.request.body)
    if (!id) {
      await database.instance.addMessageReaction(
        reaction,
        spell_handler,
        discord_enabled,
        slack_enabled
      )
    } else {
      await database.instance.updateMessageReaction(
        id,
        reaction,
        spell_handler,
        discord_enabled,
        slack_enabled
      )
    }

    return (ctx.body = 'ok')
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}
const deleteMessageReaction = async (ctx: Koa.Context) => {
  try {
    const { id } = ctx.params
    await database.instance.deleteMessageReaction(id)
    return (ctx.body = 'ok')
  } catch (e) {
    console.log(e)
    ctx.status = 500
    return (ctx.body = 'internal error')
  }
}

const queryGoogle = async (ctx: Koa.Context) => {
  console.log("QUERY", ctx.request?.body?.query)
  if (!ctx.request?.body?.query) throw new CustomError('input-failed', 'No query provided in request body')
  const query = ctx.request.body?.query as string
  const result = await queryGoogleSearch(query)

  ctx.body = {
    result
  }
}

export const entities: Route[] = [
  {
    path: '/execute',
    access: noAuth,
    post: executeHandler,
  },
  {
    path: '/createWikipediaEntity',
    access: noAuth,
    post: createWikipediaEntityHandler,
  },
  {
    path: '/entities',
    access: noAuth,
    get: getEntitiesHandler,
  },
  {
    path: '/entity',
    access: noAuth,
    get: getEntityHandler,
    post: addEntityHandler,
  },
  {
    path: '/entity/:id',
    access: noAuth,
    delete: deleteEntityHandler,
  },
  {
    path: '/greetings',
    access: noAuth,
    get: getGreetings,
    post: addGreetings,
  },
  {
    path: '/greetings/:id',
    access: noAuth,
    put: addGreetings,
    delete: deleteGreeting,
  },
  {
    path: '/event',
    access: noAuth,
    get: getEvent,
    post: createEvent,
  },
  {
    path: '/event/:id',
    access: noAuth,
    delete: deleteEvent,
    put: updateEvent,
  },
  {
    path: '/events',
    access: noAuth,
    get: getAllEvents,
  },
  {
    path: '/events_sorted',
    access: noAuth,
    get: getSortedEventsByDate,
  },
  {
    path: '/calendar_event',
    access: noAuth,
    get: getCalendarEvents,
    post: addCalendarEvent,
  },
  {
    path: '/calendar_event/:id',
    access: noAuth,
    patch: editCalendarEvent,
    delete: deleteCalendarEvent,
  },
  {
    path: '/text_to_speech',
    access: noAuth,
    get: getTextToSpeech,
  },
  {
    path: '/get_entity_image',
    access: noAuth,
    get: getEntityImage,
  },
  {
    path: '/cache_manager',
    access: noAuth,
    get: getFromCache,
    delete: deleteFromCache,
    post: setInCache,
  },
  {
    path: '/text_completion',
    access: noAuth,
    post: textCompletion,
  },
  {
    path: '/hf_request',
    access: noAuth,
    post: hfRequest,
  },
  {
    path: '/weaviate',
    access: noAuth,
    post: makeWeaviateRequest,
  },
  {
    path: '/custom_message',
    access: noAuth,
    post: customMessage,
  },
  {
    path: '/chat_agent',
    access: noAuth,
    post: chatEntity,
  },
  {
    path: '/entities_info',
    access: noAuth,
    get: getEntitiesInfo,
  },
  {
    path: '/handle_custom_input',
    access: noAuth,
    post: handleCustomInput,
  },
  {
    path: '/zoom_buffer_chunk',
    access: noAuth,
    post: zoomBufferChunk,
  },
  {
    path: '/video',
    access: noAuth,
    post: addVideo,
  },
  {
    path: '/pipedream',
    access: noAuth,
    post: post_pipedream,
  },
  {
    path: '/message_reactions',
    access: noAuth,
    get: getMessageReactions,
    post: createMessageReaction,
  },
  {
    path: '/message_reaction/:id',
    access: noAuth,
    put: createMessageReaction,
    delete: deleteMessageReaction,
  },
  {
    path: '/query_google',
    access: noAuth,
    post: queryGoogle
  },
]
