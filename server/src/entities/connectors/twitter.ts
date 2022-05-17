/* eslint-disable prefer-const */
/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { TwitterApi } from 'twitter-api-v2'

import { handleInput } from './handleInput'

function log(...s: (string | boolean)[]) {
  console.log(...s)
}

const createTwitterClient = (
  bearerKey: string,
  appKey: string,
  appSecret: string,
  accessToken: string,
  accessSecret: string
) => {
  if (bearerKey && bearerKey !== undefined && bearerKey.length > 0) {
    console.log('creating with bearer key')
    return new TwitterApi(bearerKey)
  } else {
    console.log('creating with app key')
    return new TwitterApi({
      appKey: appKey,
      appSecret: appSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    })
  }
}

export class twitter_client {
  async handleMessage(response, chat_id, args, twitter, twitterV1, localUser) {
    console.log(
      'handle message:',
      response,
      chat_id,
      args,
      twitter,
      twitterV1,
      localUser
    )
    if (args === 'DM') {
      const dmSent = await twitterV1.v1.sendDm({
        recipient_id: chat_id,
        text: response,
      })
    } else if (args === 'Twit') {
      await twitterV1.v1.reply(response, chat_id)
    }
  }

  spellHandler
  settings
  entity

  createTwitterClient = async (spellHandler, settings, entity) => {
    console.log('TWITTER SETTINGS:', settings)
    this.spellHandler = spellHandler
    this.settings = settings
    this.entity = entity

    const bearerToken = settings['twitter_token']
    const twitterUser = settings['twitter_id']
    const twitterAppToken = settings['twitter_app_token']
    const twitterAppTokenSecret = settings['twitter_app_token_secret']
    const twitterAccessToken = settings['twitter_access_token']
    const twitterAccessTokenSecret = settings['twitter_access_token_secret']

    if ((!bearerToken && !twitterAppToken && !twitterAppTokenSecret && !twitterAccessToken && !twitterAccessTokenSecret) || !twitterUser)
      return console.warn('No API token for Whatsapp bot, skipping')

    let twitter = createTwitterClient(
      bearerToken,
      twitterAppToken,
      twitterAppTokenSecret,
      twitterAccessToken,
      twitterAccessTokenSecret
    )
    const client = twitter.readWrite
    const localUser = await twitter.v2.userByUsername(twitterUser)

    setInterval(async () => {
      const tv1 = createTwitterClient(
        bearerToken,
        twitterAppToken,
        twitterAppTokenSecret,
        twitterAccessToken,
        twitterAccessTokenSecret
      )
      const eventsPaginator = await tv1.v1.listDmEvents()
      for await (const event of eventsPaginator) {
        log('Event: ' + JSON.stringify(event.message_create.message_data.text))
        if (event.type == 'message_create') {
          if (event.message_create.sender_id == localUser.data.id) {
            log('same sender')
            return
          }

          let authorName = 'unknown'
          const author = await twitter.v2.user(event.message_create.sender_id)
          if (author) authorName = author.data.username
          
          const body = event.message_create.message_data.text

          const resp = this.spellHandler(
            body,
            authorName,
            this.settings.twitter_bot_name ?? 'Agent',
            'twitter',
            event.id,
            settings.entity,
            []
          )
          await this.handleMessage(resp, event.id, 'DM', twitter, tv1, localUser)
        }
      }
    }, 25000)
  }
}
