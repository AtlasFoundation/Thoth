import { WebClient } from '@slack/web-api'
import { createEventAdapter, SlackEventAdapter } from '@slack/events-api'
import { Server } from 'http'
import { App, ExpressReceiver } from '@slack/bolt'
import express from 'express'

export class slack_client {
  spellHandler: any
  settings: any
  entity: any
  haveCustomCommands: boolean
  custom_commands: any[]

  app: App

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

    console.log('settings:', settings)
    this.app = new App({
      signingSecret: settings.slack_signing_secret,
      token: settings.slack_token,
      appToken: settings.slack_app_token,
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
}
