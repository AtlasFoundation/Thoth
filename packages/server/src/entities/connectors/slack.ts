import { App } from '@slack/bolt'
import { CreateSpellHandler } from '../CreateSpellHandler'
import { database } from '../../database'

export class slack_client {
  spellHandler: any
  settings: any
  entity: any

  app: App
  message_reactions: { [reaction: string]: any } = {}

  //to verify use: url/slack/events
  async createSlackClient(spellHandler: any, settings: any, entity: any) {
    if (
      !settings.slack_token ||
      !settings.slack_signing_secret ||
      !settings.slack_bot_token
    ) {
      console.log('invalid slack tokens')
      return
    }

    this.spellHandler = spellHandler
    this.settings = settings
    this.entity = entity

    console.log('slack settings:', settings)
    this.app = new App({
      signingSecret: settings.slack_signing_secret,
      token: settings.slack_bot_token,
      appToken: settings.slack_token,
    })

    this.app.message(async ({ message, say }) => {
      const text = (message as any).text
      const channel = (message as any).channel
      const userId = (message as any).user
      const result = await this.app.client.users.info({
        user: userId,
      })
      const user = result.user?.name

      const response = await spellHandler(
        text,
        user,
        this.settings.slack_bot_name,
        'slack',
        channel,
        this.entity,
        [],
        'msg'
      )
      say(response)
    })

    await this.app.start(settings.slack_port)
    console.log('Slack Bolt app is running on', settings.slack_port, '!')
  }
  async destroy() { }

  prevData: any[] = []
  async setupMessageReactions(data: any) {
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].discord_enabled === 'true' &&
        !this.messageReactionUpdate(data[i])
      ) {
        this.message_reactions[data[i].reaction] = await CreateSpellHandler({
          spell: data[i].spell_handler,
          version: 'latest',
        })
      }
      this.prevData = data
    }
  }
  messageReactionUpdate(datai: any) {
    for (let i = 0; i < this.prevData.length; i++) {
      if (
        this.prevData[i].reaction === datai.reaction &&
        this.prevData[i].discord_enabled === datai.discord_enabled &&
        this.prevData[i].spell_handler === datai.spell_handler
      ) {
        return true
      }

      return false
    }
  }

  async sendMessage(channelId: string, message: string) {
    if (
      !channelId ||
      channelId?.length <= 0 ||
      !message ||
      message?.length <= 0
    ) {
      return
    }

    await this.app.client.chat.postMessage({
      channel: channelId,
      text: message,
    })
  }
}
