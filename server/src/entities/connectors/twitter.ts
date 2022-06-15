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
  haveCustomCommands
  custom_commands

  createTwitterClient = async (spellHandler, settings, entity) => {
    console.log('TWITTER SETTINGS:', settings)
    this.spellHandler = spellHandler
    this.settings = settings
    this.entity = entity
    this.haveCustomCommands = settings.haveCustomCommands
    this.custom_commands = settings.custom_commands

    const bearerToken = settings['twitter_token']
    const twitterUser = settings['twitter_id']
    const twitterAppToken = settings['twitter_app_token']
    const twitterAppTokenSecret = settings['twitter_app_token_secret']
    const twitterAccessToken = settings['twitter_access_token']
    const twitterAccessTokenSecret = settings['twitter_access_token_secret']

    if (
      (!bearerToken &&
        !twitterAppToken &&
        !twitterAppTokenSecret &&
        !twitterAccessToken &&
        !twitterAccessTokenSecret) ||
      !twitterUser
    )
      return console.warn('No API token for Whatsapp bot, skipping')

    let twitter = createTwitterClient(
      bearerToken,
      twitterAppToken,
      twitterAppTokenSecret,
      twitterAccessToken,
      twitterAccessTokenSecret
    )
    console.log('created twitter client')
    const client = twitter.readWrite
    console.log('getting username')
    const localUser = await twitter.v2.userByUsername(twitterUser)
    console.log('created twitter local user')

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

          if (this.haveCustomCommands) {
            for (let i = 0; i < this.custom_commands[i].length; i++) {
              if (body.startsWith(this.custom_commands[i].command_name)) {
                const _content = body.replace(
                  this.custom_commands[i].command_name,
                  ''
                )

                const response = await this.custom_commands[i].spell_handler(
                  _content,
                  authorName,
                  this.settings.twitter_bot_name ?? 'Agent',
                  'twitter',
                  event.id,
                  settings.entity,
                  []
                )

                await this.handleMessage(
                  response,
                  event.id,
                  'DM',
                  twitter,
                  tv1,
                  localUser
                )
                return
              }
            }
          }

          const resp = this.spellHandler(
            body,
            authorName,
            this.settings.twitter_bot_name ?? 'Agent',
            'twitter',
            event.id,
            settings.entity,
            []
          )
          await this.handleMessage(
            resp,
            event.id,
            'DM',
            twitter,
            tv1,
            localUser
          )
        }
      }
    }, 25000)
    /*!twit.data.text.match(regex2)) {
    /*const rules = await client.v2.streamRules()
        if (rules.data?.length) {
            await client.v2.updateStreamRules({
                delete: { ids: rules.data.map(rule => rule.id) },
            })
        }
        const tweetRules = process.env.TWITTER_TWEET_RULES.split(',')
        const _rules = []
        for (let x in tweetRules) {
            log('rule: ' + tweetRules[x])
            _rules.push({value: tweetRules[x]})
        }
        await client.v2.updateStreamRules({
            add: _rules
        })
        const stream = await client.v2.searchStream({
            "tweet.fields": ['referenced_tweets', 'author_id'],
            expansions: ['referenced_tweets.id']
        })
        stream.autoReconnect = true
        stream.on(ETwitterStreamEvent.Data, async twit => {
            const isARt = twit.data.referenced_tweets?.some(twit => twit.type === 'retweeted') ?? false
            if (isARt || (localUser !== undefined && twit.data.author_id == localUser.data.id)) {
                log('isArt found')
            } else {
                if (/*!twit.data.text.match(regex) && */
    /*   log('regex doesnt match')
                } else {
                    let authorName = 'unknown'
                    const author = await twitter.v2.user(twit.data.author_id)
                    if (author) authorName = author.data.username
                    let date = new Date();
                    if (twit.data.created_at) date = new Date(twit.data.created_at)
                    const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                    const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
                    var ts = Math.floor(utc.getTime() / 1000);
                    await database.instance.messageExistsAsyncWitHCallback2('reddit', twit.data.id, twit.data.id, authorName, twit.data.text, ts, () => {
                        MessageClient.instance.sendMessage(twit.data.text,
                            twit.data.id,
                            'twitter',
                            twit.data.in_reply_to_user_id ? twit.data.in_reply_to_user_id : twit.data.id,
                            ts + '',
                            false,
                            authorName,
                            'Twit')
                            log('sending twit: ' + JSON.stringify(twit))
                        database.instance.addMessageInHistoryWithDate(
                            'twitter',
                            twit.data.id,
                            twit.data.id,
                            authorName,
                            twit.data.text,
                            utcStr)
                    })
                }
            }
        })*/
  }
}
