import axios from 'axios'

export const getSpell = async (spellId: string) => {
  try {
    const response = await axios.get(`/game/spells/${spellId}`)

    return response.data
  } catch (err) {
    console.log('Error getting spell!')
    console.log('Err', err)
    return {}
  }
}

type RunSpellArguments = {
  spellId: string
  inputs: Record<string, any>
  state?: Record<string, any>
  version?: string
}

export const runSpell = async ({
  spellId,
  version = 'latest',
  inputs,
  state = {},
}: RunSpellArguments) => {
  try {
    const data = {
      inputs,
      state,
    }
    // attempting runSpell with new axios
    const response = await axios.post(`game/chains/${spellId}/${version}`, JSON.stringify(data))

    return response.data
  } catch (err) {
    console.log('Error running spell!')
    console.log('Err', err)
    return {}
  }
}
