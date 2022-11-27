import { thothApiRootUrl } from '@/config'
import { getAuthHeader } from '../../contexts/AuthProvider'

export const getModels = async () => {
  try {
    const response = await fetch(thothApiRootUrl + '/text/models', {
      method: 'GET',
      headers: {
        ...(await getAuthHeader()),
      },
    })
    const result = await response.json()
    return result
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('fetch error', err)
  }
}

type CompletionBody = {
  prompt: string,
  modelName: string,
  temperature: number,
  maxTokens: number,
  topP: number,
  frequencyPenalty: number,
  presencePenalty: number,
  stop: string[]
}

export const completion = async (body: CompletionBody) => {
  try {
    const response = await fetch(thothApiRootUrl + '/text/completions_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeader()),
      },
      body: JSON.stringify({ ...body, prompt: body.prompt }),
    })
    const result = await response.json()
    return result.completions[0].text
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('fetch error', err)
  }
}
