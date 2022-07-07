import axios from 'axios'
import * as fs from 'fs'
import { createWriteStream } from 'fs'

export async function tts_tiktalknet(text: string, voice: string) {
  console.log('making request at:', process.env.TIKTALKNET_URL as string)
  const resp = await axios.get(process.env.TIKTALKNET_URL as string, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    responseType: 'stream',
    params: {
      voice: voice,
      s: text,
    },
  })
  const fileName = makeid(8) + '.wav'
  const outputFile = 'files/' + fileName
  const writer = createWriteStream(outputFile)
  resp.data.pipe(writer)
  let error: any = null
  writer.on('error', err => {
    error = err
    writer.close()
  })
  writer.on('close', () => {
    if (!error) {
    }
  })

  return outputFile
}

function makeid(length: number) {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
