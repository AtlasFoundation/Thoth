import { WebClient } from '@slack/web-api'
import { createEventAdapter, SlackEventAdapter } from '@slack/events-api'
import { Server } from 'http'
import { App, ExpressReceiver } from '@slack/bolt'
import express from 'express'
import { CreateSpellHandler } from '../handlers/CreateSpellHandler'
import { database } from '../../database'

export class slack_client {
  spellHandler: any
  settings: any
  entity: any
  haveCustomCommands: boolean
  custom_commands: any[]

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
    this.haveCustomCommands = settings.haveCustomCommands
    this.custom_commands = settings.custom_commands

    this.app = new App({
      signingSecret: settings.slack_signing_secret,
      token: settings.slack_token,
      appToken: settings.slack_app_token,
    })

    const reaction_handlers = await database.instance.getMessageReactions()
    this.setupMessageReactions(reaction_handlers)
    setInterval(async () => {
      const reactionhandlers = await database.instance.getMessageReactions()
      this.setupMessageReactions(reactionhandlers)
    }, 5000)

    this.app.event('reaction_added', async ({ event, context }) => {
      const userId = (event as any).user
      const emoji = (event as any).reaction
      const result = await this.app.client.users.info({
        user: userId,
      })
      const user = result.user?.name
      const emojid = ':' + emoji + ':'

      if (
        this.message_reactions[emojid] &&
        this.message_reactions[emojid] !== undefined
      ) {
        const response = await this.message_reactions[emojid](
          '',
          user,
          this.settings.slack_bot_name,
          'discord',
          (event as any).item.channel,
          this.entity,
          []
        )
        if (response && response !== undefined && response?.length > 0) {
          await this.app.client.chat.postMessage({
            channel: (event as any).item.channel,
            text: 'test',
          })
        }
      }
    })

    this.app.message(async ({ message, say }) => {
      const text = (message as any).text
      const channel = (message as any).channel
      const userId = (message as any).user
      const result = await this.app.client.users.info({
        user: userId,
      })
      const user = result.user?.name

      if (this.haveCustomCommands) {
        for (let i = 0; i < this.custom_commands.length; i++) {
          console.log(
            'command:',
            this.custom_commands[i].command_name,
            'starting_with:',
            text.startsWith(this.custom_commands[i].command_name)
          )
          if (text.startsWith(this.custom_commands[i].command_name)) {
            const _content = text
              .replace(this.custom_commands[i].command_name, '')
              .trim()
            console.log(
              'handling command:',
              this.custom_commands[i].command_name,
              'content:',
              _content
            )

            const cresponse = await this.custom_commands[i].spell_handler(
              _content,
              user,
              this.settings.slack_bot_name,
              'slack',
              channel,
              this.entity,
              []
            )

            say(cresponse)
            return
          }
        }
      }

      const response = await spellHandler(
        text,
        user,
        this.settings.slack_bot_name,
        'slack',
        channel,
        this.entity,
        []
      )
      say(response)
    })

    await this.app.start(settings.slack_port)
    console.log('Slack Bolt app is running on', settings.slack_port, '!')
  }
  async destroy() {}

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
}
