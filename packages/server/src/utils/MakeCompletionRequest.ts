process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import axios from 'axios'

// TODO: Refactor and remove this, replace with Thoth completion node

export async function MakeCompletionRequest(
  data: any,
  speaker: any,
  agent: any,
  type: any,
  engine: any
) {
  return await makeOpenAIGPT3Request(data, speaker, agent, type, engine)
}
const useDebug = false
async function makeOpenAIGPT3Request(
  data: any,
  speaker: any,
  agent: any,
  type: any,
  engine: any
) {
  if (useDebug) return { success: true, choice: { text: 'Default response' } }
  const API_KEY = process.env.OPENAI_API_KEY
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + API_KEY,
  }
  try {
    const gptEngine = engine ?? 'davinci'
    const resp = await axios.post(
      `https://api.openai.com/v1/engines/${gptEngine}/completions`,
      data,
      { headers: headers }
    )

    if (resp.data.choices && resp.data.choices.length > 0) {
      const choice = resp.data.choices[0]
      return { success: true, choice }
    }
  } catch (err) {
    console.error(err)
    return { success: false }
  }
}

export async function makeCompletion(
  engine: string,
  data: {
    prompt: string,
    temperature: number,
    max_tokens: number,
    top_p: number,
    frequency_penalty: number,
    presence_penalty: number,
    stop: string[],
  }
): Promise<any> {
  const API_KEY = process.env.OPENAI_API_KEY

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + API_KEY,
  }

  const _data: any = {}
  _data.prompt = data.prompt
  if (data.temperature && data.temperature !== undefined) {
    _data.temperature = data.temperature
  }
  if (data.max_tokens && data.max_tokens !== undefined) {
    _data.max_tokens = data.max_tokens
  }
  if (data.top_p && data.top_p !== undefined) {
    _data.top_p = data.top_p
  }
  if (data.frequency_penalty && data.frequency_penalty !== undefined) {
    _data.frequency_penalty = data.frequency_penalty
  }
  if (data.presence_penalty && data.presence_penalty !== undefined) {
    _data.presence_penalty = data.presence_penalty
  }
  _data.stop = data.stop

  try {
    const gptEngine = engine ?? 'text-davinci-002'
    console.log("MAKING REQUEST TO", `https://api.openai.com/v1/engines/${gptEngine}/completions`)
    console.log('BODY', _data)

    const resp = await axios.post(
      `https://api.openai.com/v1/engines/${gptEngine}/completions`,
      _data,
      { headers: headers }
    )

    if (resp.data.choices && resp.data.choices.length > 0) {
      const choice = resp.data.choices[0]
      return { success: true, choice }
    }
  } catch (err) {
    console.log("ERROR")
    console.error(err)
    return { success: false }
  }
}
