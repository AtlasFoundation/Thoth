import { database } from './../database'
import { GetEventArgs, CreateEventArgs } from '@thothai/thoth-core/types'

export const getEvents = async ({
  type,
  agent,
  speaker,
  client,
  channel,
  maxCount,
  max_time_diff,
}: GetEventArgs) => {
  const event = await database.instance.getEvents({
    type,
    agent,
    speaker,
    client,
    channel,
    maxCount,
    max_time_diff
})

  if (!event) return null

  return event
}

export const createEvent = async (args: CreateEventArgs) => {
  const { type, agent, speaker, client, channel, text, sender } = args
  return await database.instance.createEvent({
    type,
    agent,
    speaker,
    sender,
    client,
    channel,
    text,
  })
}
