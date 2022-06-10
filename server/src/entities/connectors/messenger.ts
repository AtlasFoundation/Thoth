/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable require-await */
/* eslint-disable camelcase */
/* eslint-disable no-invalid-this */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import request from 'request'
import { cacheManager } from '../../cacheManager'
import { CreateSpellHandler } from '../CreateSpellHandler'

export class messenger_client {
  settings
  entity
  cache: cacheManager

  constructor() {
    this.cache = new cacheManager()
  }

  handleMessage = async (senderPsid, receivedMessage) => {
    const text = receivedMessage.text
    console.log('receivedMessage: ' + text + ' from: ' + senderPsid)

    if (receivedMessage.text) {
      const [ spellVersion, _spellHandler ] = await this.cache.client
        .multi()
        .get('messenger_spell_version')
        .get('messenger_spell_handler')
        .exec()

      const spellHandler = await CreateSpellHandler({
        spell: _spellHandler,
        version: spellVersion
      })

      const resp = await spellHandler(
        text,
        senderPsid,
        'MessengerBot',
        'messenger',
        senderPsid,
        null,
        []
      )
      this.callSendAPI(senderPsid, { text: resp }, resp)
    }
  }

  async handlePacketSend(senderPsid, response) {
    // log('response: ' + response)
    // if (
    //   response !== undefined &&
    //   response.length <= 2000 &&
    //   response.length > 0
    // ) {
    //   let text = response
    //   while (
    //     text === undefined ||
    //     text === '' ||
    //     text.replace(/\s/g, '').length === 0
    //   )
    //     text = getRandomEmptyResponse()
    //   this.callSendAPI(senderPsid, { text: text }, text)
    // } else if (response.length > 20000) {
    //   const lines = []
    //   let line = ''
    //   for (let i = 0; i < response.length; i++) {
    //     line += response
    //     if (i >= 1980 && (line[i] === ' ' || line[i] === '')) {
    //       lines.push(line)
    //       line = ''
    //     }
    //   }

    //   for (let i = 0; i < lines.length; i++) {
    //     if (
    //       lines[i] !== undefined &&
    //       lines[i] !== '' &&
    //       lines[i].replace(/\s/g, '').length !== 0
    //     ) {
    //       if (i === 0) {
    //         let text = lines[1]
    //         while (
    //           text === undefined ||
    //           text === '' ||
    //           text.replace(/\s/g, '').length === 0
    //         )
    //           text = getRandomEmptyResponse()
    //         this.callSendAPI(senderPsid, { text: text }, text)
    //       }
    //     }
    //   }
    // } else {
    //   let emptyResponse = getRandomEmptyResponse()
    //   while (
    //     emptyResponse === undefined ||
    //     emptyResponse === '' ||
    //     emptyResponse.replace(/\s/g, '').length === 0
    //   )
    //     emptyResponse = getRandomEmptyResponse()
    //   this.callSendAPI(senderPsid, { text: emptyResponse }, emptyResponse)
    // }
  }

  async callSendAPI(senderPsid, response, text) {
    // The page access token we have generated in your app settings
    const PAGE_ACCESS_TOKEN = await this.cache.get('messenger_page_access_token')

    // Construct the message body
    const requestBody = {
      recipient: {
        id: senderPsid,
      },
      message: response,
    }

    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: 'https://graph.facebook.com/v14.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: requestBody,
      },
      (err, _res, _body) => {
        if (!err) {
          console.log('Message sent!')
        } else {
          console.error('Unable to send message:' + err)
        }
      }
    )
  }

  createMessengerClient = async ( settings, entity) => {
    this.settings = settings
    this.entity = entity
    const { 
      messenger_page_access_token, 
      messenger_verify_token,
      messenger_spell_handler_incoming,
      spell_version
    } = this.settings

    if (!messenger_page_access_token || !messenger_verify_token)
      return console.warn('No API tokens for Messenger bot, skipping')
    

    await this.cache.client
      .multi()
      .set('messenger_page_access_token', messenger_page_access_token)
      .set('messenger_verify_token', messenger_verify_token)
      .set('messenger_spell_handler', messenger_spell_handler_incoming)
      .set('messenger_spell_version', spell_version ?? '')
      .exec()
  }
}