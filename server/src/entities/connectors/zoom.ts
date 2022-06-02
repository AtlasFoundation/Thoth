/* eslint-disable no-param-reassign */
/* eslint-disable require-await */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { launch, getStream } from 'puppeteer-stream'
import Xvfb from 'xvfb'
import { detectOsOption } from './utils'
import { singleton } from '../../utils/speechUtils'
import * as fs from 'fs'
import http from 'http'
import { BufferEncodingOption } from 'fs'
import io from 'socket.io-client'

export class zoom_client {
  async createZoomClient(spellHandler, settings, entity) {
    const xvfb = new Xvfb()
    await xvfb.start(async function (err, xvfbProcess) {
      if (err) {
        console.log(err)
        xvfb.stop(function (_err) {
          if (_err) console.log(_err)
        })
      }

      console.log('started virtual window')
      const zoomObj = new zoom(spellHandler, settings, entity)
      await zoomObj.init()
    })
  }
  destroy() {}
}

export class zoom {
  spellHandler
  settings
  entity

  fakeMediaPath

  browser
  page
  socket

  constructor(spellHandler, settings, entity) {
    this.spellHandler = spellHandler
    this.settings = settings
    this.entity = entity
  }

  async init() {
    const options = {
      headless: false,
      ignoreHTTPSErrors: true,
      devtools: true,
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        //`--use-file-for-fake-video-capture=${this.fakeMediaPath}video.y4m`,
        //`--use-file-for-fake-audio-capture=${this.fakeMediaPath}test_audio.wav`,
        '--disable-web-security',
        '--autoplay-policy=no-user-gesture-required',
        '--ignoreHTTPSErrors: true',
      ],
      ignoreDefaultArgs: ['--mute-audio'],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      ...detectOsOption(),
    }
    console.log(JSON.stringify(options))

    this.browser = await launch(options)
    this.page = await this.browser.newPage()
    this.page.on('console', log => {
      if (
        log._text.includes('color:green') ||
        log._text.includes('clib state')
      ) {
        return
      }

      console.log(log._text)
    })

    this.page.setViewport({ width: 0, height: 0 })
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
    )
    await this.navigate(this.settings.zoom_invitation_link)
    await this.delay(20000)
    await this.catchScreenshot()
    await this.clickElementById('button', 'onetrust-accept-btn-handler')
    await this.catchScreenshot()
    await this.delay(500)
    await this.typeMessage('inputname', this.settings.zoom_bot_name, false)
    await this.clickElementById('button', 'joinBtn')
    await this.delay(20000)

    await this.clickElementById('button', 'wc_agree1')
    await this.delay(20000)
    try {
      await this.typeMessage(
        'inputpasscode',
        this.settings.zoom_password,
        false
      )
      await this.clickElementById('button', 'joinBtn')
      await this.delay(20000)
    } catch (ex) {}

    //await this.playVideo('https://woolyss.com/f/spring-vp9-vorbis.webm')

    await this.clickElementById('button', 'audioOptionMenu')
    await this.catchScreenshot()
    const linkHandlers = await this.page.$x(
      "//a[contains(text(), 'Fake Audio Input 1')]"
    )

    if (linkHandlers.length > 0) {
      await linkHandlers[0].click()
    } else {
      console.log('Link not found')
    }
    await this.clickElementById('button', 'videoOptionMenu')
    await this.catchScreenshot()
    const linkHandlers2 = await this.page.$x(
      "//a[contains(text(), 'fake_device_0')]"
    )
    if (linkHandlers2.length > 0) {
      await linkHandlers2[0].click()
    } else {
      console.log('Link not found')
    }

    await this.clickElementById('button', 'audioOptionMenu')
    await this.catchScreenshot()
    const linkHandlers3 = await this.page.$x(
      "//a[contains(text(), 'Fake Audio Output 1')]"
    )

    if (linkHandlers3.length > 0) {
      await linkHandlers3[0].click()
    } else {
      console.log('Link not found')
    }

    await this.clickElementById('button', 'audioOptionMenu')
    await this.catchScreenshot()
    /*await this.page.evaluate(async su => {
      //su.initRecording()
    }, singleton.getInstance())*/

    /*
    const file = fs.createWriteStream('test5.webm')
    const stream = await getStream(this.page, { audio: true, video: true })
    stream.on('data', chunk => {
      console.log('puppeteer stream chunk:', chunk)
    })
    stream.on('readable', () => {
      console.log('readable')
    })
    stream.pipe(file)
    setTimeout(async () => {
      await stream.destroy()
      file.close()
      console.log('finished')
    }, 30000)*/
    await this.connectToVoiceServer()
    await this.getVideo()
    //this.frameCapturerer()
  }

  frameCapturerer() {
    setTimeout(() => {
      this.getRemoteScreenshot()
      this.frameCapturerer()
    }, 500)
  }

  c = 0
  async getRemoteScreenshot() {
    const dataUrl = await this.page.evaluate(async () => {
      const sleep = time => new Promise(resolve => setTimeout(resolve, time))
      await sleep(5000)
      return document.getElementById('main-video').toDataURL()
    })

    this.c++
    const data = Buffer.from(dataUrl.split(',').pop(), 'base64')
    //fs.writeFileSync('image' + this.c + '.png', data);
  }

  async getVideo() {
    await this.page.exposeFunction('emitDataToSTT', audioArray => {
      this.socket.emit('binaryData', audioArray)
    })
    await this.page.exposeFunction('startStream', () => {
      this.socket.emit('startGoogleCloudStream', '')
    })
    await this.page.evaluate(async () => {
      const onError = err => {
        console.log('----err in userMedia----', err)
      }
      const onSuccess = stream => {
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        })
        recorder.onstart = async () => {
          await window.startStream()
        }
        recorder.ondataavailable = async e => {
          console.log('on data available:', e.data.size)
          if (e.data.size > 0) {
            const buffer = await e.data.arrayBuffer()
            const uint8Arr = new Uint8Array(buffer)
            const int16arr = new Int16Array(uint8Arr)
            //const audioArray = Array.from(int16arr)
            const audioSampler = this.downsampleBuffer(int16arr, 44100, 16000)
            await window.emitDataToSTT(audioSampler)
          }
        }
        recorder.onstop = async e => {
          await window.endStream()
        }
        recorder.start(2000)
      }
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then(onSuccess, onError)
      }
    })
  }

  downsampleBuffer = (buffer: any, sampleRate: any, outSampleRate: any) => {
    if (outSampleRate == sampleRate) {
      return buffer
    }
    if (outSampleRate > sampleRate) {
      throw 'downsampling rate should be smaller than original sample rate'
    }
    const sampleRateRatio = sampleRate / outSampleRate
    const newLength = Math.round(buffer.length / sampleRateRatio)
    let result = new Int16Array(newLength)
    let offsetResult = 0
    let offsetBuffer = 0
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
      let accum = 0,
        count = 0
      for (
        let i = offsetBuffer;
        i < nextOffsetBuffer && i < buffer.length;
        i++
      ) {
        accum += buffer[i]
        count++
      }

      result[offsetResult] = Math.min(1, accum / count) * 0x7fff
      offsetResult++
      offsetBuffer = nextOffsetBuffer
    }
    return result.buffer
  }

  async connectToVoiceServer() {
    const socket = io(`https://localhost:65532`, {
      rejectUnauthorized: false,
      secure: true,
    })
    this.socket = socket

    // socket.emit('startGoogleCloudStream', '')
    // console.log('socket:', socket.connected)

    socket.on('connect', () => {
      socket.emit('join', 'connected')
    })
    socket.on('messages', (data: any) => {
      console.log('messages:', data)
    })

    socket.on('speechData', async (data: any) => {
      console.log('---speechData event handler---')

      const dataFinal = undefined || data.results[0].isFinal

      if (dataFinal === true) {
        const finalString = data.results[0].alternatives[0].transcript
        console.log('Speech Recognition:', dataFinal)
        const resp = this.spellHandler(
          finalString,
          'User',
          this.settings.zoom_bot_name ?? 'Agent',
          'zoom',
          this.settings.zoom_invitation_link,
          this.entity,
          []
        )
        //generate voiud and play it back
        //this.playAudio(audio);

        socket.emit('endGoogleCloudStream', '')
        socket.disconnect()

        const socket = io(`https://localhost:65532`, {
          rejectUnauthorized: false,
          secure: true,
        })

        socket.emit('startGoogleCloudStream', '')
      }
    })
  }

  videoCreated = false
  async playVideo(url) {
    await this.page.evaluate(
      async (_url, _videCreated) => {
        let video = undefined
        if (!this.videoCreated)
          video = await document.createElement('video', {})
        else video = await document.getElementById('video-mock')
        video.setAttribute('id', 'video-mock')
        video.setAttribute('src', _url)
        video.setAttribute('crossorigin', 'anonymous')
        video.setAttribute('controls', '')

        video.oncanplay = async () => {
          video.play()
        }

        video.onplay = async () => {
          const stream = video.captureStream()

          navigator.mediaDevices.getUserMedia = () => Promise.resolve(stream)
        }
      },
      url,
      this.videoCreated
    )
    this.videoCreated = true
    await this.delay(10000)
  }

  async clickElementById(elemType, id) {
    await this.clickSelectorId(elemType, id)
  }

  async playAudio(audioUrl) {
    await this.page.evaluate(url => {
      const audio = document.createElement('audio')
      audio.setAttribute('src', url)
      audio.setAttribute('crossorigin', 'anonymous')
      audio.setAttribute('controls', '')
      audio.onplay = function () {
        var stream = audio.captureStream()
        navigator.mediaDevices.getUserMedia = async function () {
          return stream
        }
      }
    }, audioUrl)
  }

  async clickSelectorId(selector, id) {
    console.log(`Clicking for a ${selector} matching ${id}`)

    await this.page.evaluate(
      (selector, id) => {
        const matches = Array.from(document.querySelectorAll(selector))
        const singleMatch = matches.find(button => button.id === id)
        let result
        if (singleMatch && singleMatch.click) {
          console.log('normal click')
          result = singleMatch.click()
        }
        if (singleMatch && !singleMatch.click) {
          console.log('on click')
          result = singleMatch.dispatchEvent(
            new MouseEvent('click', { bubbles: true })
          )
        }
        if (!singleMatch) {
          console.log('event click', matches.length)
          if (matches.length > 0) {
            const m = matches[0]
            result = m.dispatchEvent(new MouseEvent('click', { bubbles: true }))
          }
        }
      },
      selector,
      id
    )
  }

  async clickElementByClass(elemType, classSelector) {
    await this.clickSelectorClassRegex(elemType || 'button', classSelector)
  }

  async clickSelectorClassRegex(selector, classRegex) {
    console.log(`Clicking for a ${selector} matching ${classRegex}`)

    await this.page.evaluate(
      (selector, classRegex) => {
        classRegex = new RegExp(classRegex)
        const buttons = Array.from(document.querySelectorAll(selector))
        const enterButton = buttons.find(button =>
          Array.from(button.classList).some(c => classRegex.test(c))
        )
        if (enterButton) enterButton.click()
      },
      selector,
      classRegex.toString().slice(1, -1)
    )
  }

  async navigate(url, searchParams = undefined) {
    if (!this.browser) {
      await this.init()
    }

    const parsedUrl = new URL(url?.includes('https') ? url : `https://${url}`)
    if (searchParams !== undefined) {
      for (const x in searchParams) {
        parsedUrl.searchParams.set(x, searchParams[x])
      }
    }
    const context = this.browser.defaultBrowserContext()
    context.overridePermissions(parsedUrl.origin, ['microphone', 'camera'])
    console.log('navigating to: ' + parsedUrl)
    await this.page.goto(parsedUrl, { waitUntil: 'domcontentloaded' })
  }

  async delay(timeout) {
    console.log(`Waiting for ${timeout} ms... `)
    await this.waitForTimeout(timeout)
  }

  async waitForTimeout(timeout) {
    return await new Promise(resolve => setTimeout(() => resolve(), timeout))
  }

  async waitForSelector(selector, timeout) {
    return this.page.waitForSelector(selector, { timeout })
  }

  counter = 0
  async catchScreenshot() {
    this.counter++
    console.log('screenshot')
    const path = 'screenshot' + this.counter + '.png'
    await this.page.screenshot({ path })
  }

  async typeMessage(input, message, clean) {
    if (clean)
      await this.page.click(`input[name="${input}"]`, { clickCount: 3 })
    await this.page.type(`input[name=${input}]`, message)
  }
}
