import discord_client from './connectors/discord'
import { telegram_client } from './connectors/telegram'
import { zoom_client } from './connectors/zoom'
import { twitter_client } from './connectors/twitter'
import { reddit_client } from './connectors/reddit'
import { instagram_client } from './connectors/instagram'
import { messenger_client } from './connectors/messenger'
import { whatsapp_client } from './connectors/whatsapp'
import { twilio_client } from './connectors/twilio'
//import { harmony_client } from '../../../core/src/connectors/harmony'
import { xrengine_client } from './connectors/xrengine'
import { CreateSpellHandler } from './CreateSpellHandler'
import { cacheManager } from '../cacheManager'
import { getAudioUrl } from '../routes/getAudioUrl'
import { tts } from '../systems/googleTextToSpeech'
import { stringIsAValidUrl } from '../utils/utils'
import { urlencoded, json } from 'express'
import express from 'express'

export class Entity {
  name = ''
  //Clients
  discord: discord_client | null
  telegram: telegram_client | null
  zoom: zoom_client | null
  twitter: twitter_client | null
  reddit: reddit_client | null
  instagram: instagram_client | null
  messenger: messenger_client | null
  whatsapp: whatsapp_client | null
  twilio: twilio_client | null
  //harmony: any
  xrengine: xrengine_client | null
  id: any

  router: any
  app: any

  async startDiscord(
    discord_api_token: string,
    discord_starting_words: string,
    discord_bot_name_regex: string,
    discord_bot_name: string,
    discord_empty_responses: string,
    spell_handler: string,
    spell_version: string,
    use_voice: boolean,
    voice_provider: string,
    voice_character: string,
    voice_language_code: string
  ) {
    console.log('initializing discord, spell_handler:', spell_handler)
    if (this.discord)
      throw new Error('Discord already running for this agent on this instance')

    const spellHandler = await CreateSpellHandler({
      spell: spell_handler,
      version: spell_version,
    })

    this.discord = new discord_client()
    console.log('createDiscordClient')
    await this.discord.createDiscordClient(
      this,
      discord_api_token,
      discord_starting_words,
      discord_bot_name_regex,
      discord_bot_name,
      discord_empty_responses,
      spellHandler,
      use_voice,
      voice_provider,
      voice_character,
      voice_language_code
    )
    console.log('Started discord client for agent ' + this.name)
    // const response = await spellHandler(
    //   'testmessage',
    //   'testsender',
    //   'testbot',
    //   'discord',
    //   "0",
    //   this.id
    // )
    // console.log("response is ", response)
  }

  async stopDiscord() {
    if (!this.discord) throw new Error("Discord isn't running, can't stop it")
    await this.discord.destroy()
    this.discord = null
    console.log('Stopped discord client for agent ' + this.name)
  }

  async startXREngine(settings: {
    entity: any
    url: string
    spell_handler: string
    spell_version: string
    xrengine_bot_name: string
    xrengine_bot_name_regex: string
    xrengine_starting_words: string
    xrengine_empty_responses: string
    handleInput?: any
    use_voice: boolean
    voice_provider: string
    voice_character: string
    voice_language_code: string
  }) {
    if (this.xrengine)
      throw new Error(
        'XREngine already running for this agent on this instance'
      )

    const spellHandler = await CreateSpellHandler({
      spell: settings.spell_handler,
      version: settings.spell_version,
    })

    settings.handleInput = spellHandler

    this.xrengine = new xrengine_client()
    this.xrengine.createXREngineClient(
      this,
      settings,
      this.xrengine,
      spellHandler
    )
    console.log('Started xrengine client for agent ' + this.name)
  }

  stopXREngine() {
    if (!this.xrengine) throw new Error("XREngine isn't running, can't stop it")
    this.xrengine.destroy()
    ;(this.xrengine as any) = null
    console.log('Stopped xrengine client for agent ' + this.name)
  }

  async startTwitter(
    twitter_token: any,
    twitter_id: any,
    twitter_app_token: any,
    twitter_app_token_secret: any,
    twitter_access_token: any,
    twitter_access_token_secret: any,
    twitter_bot_name: any,
    twitter_bot_name_regex: any,
    twitter_spell_handler_incoming: any,
    spell_version: string,
    entity: any
  ) {
    console.log('initializing Twitter:', twitter_token)
    if (this.twitter)
      throw new Error(
        'Twitter already running for this entity on this instance'
      )

    const spellHandler = CreateSpellHandler({
      spell: twitter_spell_handler_incoming,
      version: spell_version,
    })

    this.twitter = new twitter_client()
    console.log('createTwitterClient')
    await this.twitter.createTwitterClient(
      spellHandler,
      {
        twitter_token,
        twitter_id,
        twitter_app_token,
        twitter_app_token_secret,
        twitter_access_token,
        twitter_access_token_secret,
        twitter_bot_name,
        twitter_bot_name_regex,
        twitter_spell_handler_incoming,
      },
      entity
    )
    console.log('Started twitter client for agent ' + this)
    // const response = await spellHandler(
    //   'testmessage',
    //   'testsender',
    //   'testbot',
    //   'discord',
    //   "0",
    //   this.id
    // )
    // console.log("response is ", response)
  }

  stopTwitter() {
    if (!this.twitter) throw new Error("Twitter isn't running, can't stop it")
    this.twitter = null
    console.log('Stopped twitter client for agent ' + this)
  }

  async startTelegram(
    telegram_bot_token: string,
    telegram_bot_name: string,
    entity: any,
    spell_handler: string,
    spell_version: string
  ) {
    console.log('initializing telegram:', telegram_bot_token)
    if (this.telegram)
      throw new Error(
        'Telegram already running for this entity on this instance'
      )

    const spellHandler = await CreateSpellHandler({
      spell: spell_handler,
      version: spell_version,
    })

    this.telegram = new telegram_client()
    await this.telegram.createTelegramClient(spellHandler, {
      telegram_bot_token,
      telegram_bot_name,
      entity,
    })
  }
  stopTelegram() {
    if (this.telegram) {
      this.telegram.destroy()
      this.telegram = null
    }
  }

  startReddit(
    reddit_app_id: string,
    reddit_app_secret_id: string,
    reddit_oauth_token: string,
    reddit_bot_name: string,
    reddit_bot_name_regex: string,
    reddit_spell_handler_incoming: string,
    spell_version: string,
    entity: any
  ) {
    console.log('initializing reddit:', reddit_app_id)
    if (this.reddit) {
      throw new Error('Reddit already running for this entity on this instance')
    }

    const spellHandler = CreateSpellHandler({
      spell: reddit_spell_handler_incoming,
      version: spell_version,
    })

    this.reddit = new reddit_client()
    this.reddit.createRedditClient(
      spellHandler,
      {
        reddit_app_id,
        reddit_app_secret_id,
        reddit_oauth_token,
        reddit_bot_name,
        reddit_bot_name_regex,
      },
      entity
    )
  }

  stopReddit() {
    if (this.reddit) {
      this.reddit.destroy()
      this.reddit = null
    }
  }

  async startInstagram(
    instagram_username: string,
    instagram_password: string,
    instagram_bot_name: string,
    instagram_bot_name_regex: string,
    instagram_spell_handler_incoming: string,
    spell_version: string,
    entity: any
  ) {
    if (this.instagram) {
      throw new Error(
        'Instagram already running for this client on this instance'
      )
    }

    const spellHandler = await CreateSpellHandler({
      spell: instagram_spell_handler_incoming,
      version: spell_version,
    })

    this.instagram = new instagram_client()
    this.instagram.createInstagramClient(
      spellHandler,
      {
        instagram_username,
        instagram_password,
        instagram_bot_name,
        instagram_bot_name_regex,
        instagram_spell_handler_incoming,
      },
      entity
    )
  }

  stopInstagram() {
    if (!this.instagram)
      throw new Error("Instagram isn't running, can't stop it")
    this.instagram = null
  }

  async startMessenger(
    messenger_page_access_token: string,
    messenger_verify_token: string,
    messenger_bot_name: string,
    messenger_bot_name_regex: string,
    messenger_spell_handler_incoming: string,
    spell_version: string,
    entity: any
  ) {
    if (this.messenger) {
      throw new Error(
        'Messenger already running for this client on this instance'
      )
    }

    const spellHandler = await CreateSpellHandler({
      spell: messenger_spell_handler_incoming,
      version: spell_version,
    })

    this.messenger = new messenger_client()
    this.messenger.createMessengerClient(
      this.app,
      this.router,
      spellHandler,
      {
        messenger_page_access_token,
        messenger_verify_token,
        messenger_bot_name,
        messenger_bot_name_regex,
      },
      entity
    )
  }

  stopMessenger() {
    if (!this.messenger)
      throw new Error("Messenger isn't running, can't stop it")
    this.messenger = null
  }

  async startTwilio(
    twilio_account_sid: any,
    twilio_auth_token: any,
    twilio_phone_number: any,
    twilio_bot_name: any,
    twilio_empty_responses: any,
    twilio_spell_handler_incoming: any,
    spell_version: any
  ) {
    if (this.twilio) {
      throw new Error('Twlio already running for this client on this instance')
    }

    const spellHandler = await CreateSpellHandler({
      spell: twilio_spell_handler_incoming,
      version: spell_version,
    })

    this.twilio = new twilio_client()
    this.twilio.createTwilioClient(
      this.app,
      this.router,
      {
        twilio_account_sid,
        twilio_auth_token,
        twilio_phone_number,
        twilio_bot_name,
        twilio_empty_responses,
        twilio_spell_handler_incoming,
        entity: this,
      },
      spellHandler
    )
  }

  async stopTwlio() {}

  async onDestroy() {
    console.log(
      'CLOSING ALL CLIENTS, discord is defined:,',
      this.discord === null || this.discord === undefined
    )
    if (this.discord) this.stopDiscord()
    if (this.xrengine) this.stopXREngine()
    if (this.twitter) this.stopTwitter()
    if (this.telegram) this.stopTelegram()
    if (this.reddit) this.stopReddit()
    if (this.instagram) this.stopInstagram()
    if (this.messenger) this.stopMessenger()
    if (this.twilio) this.stopTwlio()
  }

  async generateVoices(data: any) {
    if (data.use_voice) {
      const phrases = data.voice_default_phrases
      if (phrases && phrases.length > 0) {
        const pArr = phrases.split('|')
        for (let i = 0; i < pArr.length; i++) {
          pArr[i] = pArr[i].trim()
        }
        const filtered = pArr.filter(
          (p: string) => p && p !== undefined && p?.length > 0
        )

        for (let i = 0; i < filtered.length; i++) {
          if (
            await cacheManager.instance.has(
              'voice_' +
                data.voice_provider +
                '_' +
                data.voice_character +
                '_' +
                filtered[i]
            )
          ) {
            continue
          }

          let url: any = ''
          if (data.voice_provider === 'uberduck') {
            url = await getAudioUrl(
              process.env.UBER_DUCK_KEY as string,
              process.env.UBER_DUCK_SECRET_KEY as string,
              data.voice_character,
              filtered[i]
            )
          } else {
            url = await tts(
              filtered[i],
              data.voice_character,
              data.voice_language_code
            )
          }

          if (url && url.length > 0 && stringIsAValidUrl(url)) {
            await cacheManager.instance.set(
              'voice_' +
                data.voice_provider +
                '_' +
                data.voice_character +
                '_' +
                filtered[i],
              url
            )
          }
        }
      }
    }
  }

  constructor(data: any, port: number) {
    if (!this.router && !this.app) {
      this.router = express.Router()
      this.router.use(urlencoded({ extended: false }))
      this.app = express()
      this.app.use(json())
    }
    this.app.listen(port, () => {
      console.log(`Entity Web Server listening on http://localhost:${port}`)
    })

    if (!cacheManager.instance) {
      new cacheManager()
    }

    this.onDestroy()
    this.id = data.id
    console.log('initing agent')
    console.log('agent data is ', data)
    this.name = data.agent ?? data.name ?? 'agent'

    this.generateVoices(data)

    if (data.discord_enabled) {
      this.startDiscord(
        data.discord_api_key,
        data.discord_starting_words,
        data.discord_bot_name_regex,
        data.discord_bot_name,
        data.discord_empty_responses,
        data.discord_spell_handler_incoming,
        data.spell_version,
        data.use_voice,
        data.voice_provider,
        data.voice_character,
        data.voice_language_code
      )
    }

    if (data.xrengine_enabled) {
      this.startXREngine({
        url: data.xrengine_url,
        entity: data,
        spell_handler: data.xrengine_spell_handler_incoming,
        spell_version: data.spell_version,
        xrengine_bot_name: data.xrengine_bot_name,
        xrengine_bot_name_regex: data.xrengine_bot_name_regex,
        xrengine_starting_words: data.xrengine_starting_words,
        xrengine_empty_responses: data.xrengine_empty_responses,
        use_voice: data.use_voice,
        voice_provider: data.voice_provider,
        voice_character: data.voice_character,
        voice_language_code: data.voice_language_code,
      })
    }

    if (data.twitter_client_enable) {
      this.startTwitter(
        data.twitter_token,
        data.twitter_id,
        data.twitter_app_token,
        data.twitter_app_token_secret,
        data.twitter_access_token,
        data.twitter_access_token_secret,
        data.twitter_bot_name,
        data.twitter_bot_name_regex,
        data.twitter_spell_handler_incoming,
        data.spell_version,
        data
      )
    }

    if (data.telegram_enabled) {
      this.startTelegram(
        data.telegram_bot_token,
        data.telegram_bot_name,
        data,
        data.telegram_spell_handler_incoming,
        data.spell_version
      )
    }

    if (data.instagram_enabled) {
      this.startInstagram(
        data.instagram_username,
        data.instagram_password,
        data.instagram_bot_name,
        data.instagram_bot_name_regex,
        data.instagram_spell_handler_incoming,
        data.spell_version,
        data
      )
    }

    if (data.messenger_enabled) {
      this.startMessenger(
        data.messenger_page_access_token,
        data.messenger_verify_token,
        data.messenger_bot_name,
        data.messenger_bot_name_regex,
        data.messenger_spell_handler_incoming,
        data.spell_version,
        data
      )
    }

    if (data.twilio_enabled) {
      this.startTwilio(
        data.twilio_account_sid,
        data.twilio_auth_token,
        data.twilio_phone_number,
        data.twilio_bot_name,
        data.twilio_empty_responses,
        data.twilio_spell_handler_incoming,
        data.spell_version
      )
    }
  }

  // TODO: Fix me

  // for (let i = 0; i < clients.length; i++) {
  //   if (clients[i].enabled === 'true') {
  //     if (clients[i].client === 'discord') {
  //       this.discord = new discord_client()
  //       this.discord.createDiscordClient(this, clients[i].settings)
  //     } else if (clients[i].client === 'telegram') {
  //       this.telegram = new telegram_client()
  //       this.telegram.createTelegramClient(this, clients[i].settings)
  //     } else if (clients[i].client === 'zoom') {
  //       this.zoom = new zoom_client()
  //       this.zoom.createZoomClient(this, clients[i].settings)
  //     } else if (clients[i].client === 'twitter') {
  //       this.twitter = new twitter_client()
  //       this.twitter.createTwitterClient(this, clients[i].settings)
  //     } else if (clients[i].client === 'reddit') {
  //       this.reddit = new reddit_client()
  //       this.reddit.createRedditClient(this, clients[i].settings)
  //     } else if (clients[i].client === 'instagram') {
  //       this.instagram = new instagram_client()
  //       this.instagram.createInstagramClient(this, clients[i].settings)
  //     } else if (clients[i].client === 'messenger') {
  //       this.messenger = new messenger_client()
  //       this.messenger.createMessengerClient(app, this, clients[i].settings)
  //     } else if (clients[i].client === 'whatsapp') {
  //       this.whatsapp = new whatsapp_client()
  //       this.whatsapp.createWhatsappClient(this, clients[i].settings)
  //     } else if (clients[i].client === 'twilio') {
  //       this.twilio = new twilio_client()
  //       this.twilio.createTwilioClient(app, router, this, clients[i].settings)
  //     } else if (clients[i].client === 'harmony') {
  //       //this.harmony = new harmony_client();
  //       //this.harmony.createHarmonyClient(this, clients[i].settings);
  //     }
  //   }
  // }
}

export default Entity
