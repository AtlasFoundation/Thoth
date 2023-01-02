import axios from 'axios'

export const getSpell = async (spellId: string) => {
  try {
    const response = await axios.get(`/spells/${spellId}`)

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
}

export const runSpell = async ({
  spellId,
  inputs,
  state = {},
}: RunSpellArguments) => {
  try {
    console.log('****** runSpell, inputs are', inputs)
    const data = {
      inputs,
      state,
    }
    const response = await axios({
      url: `spells/${spellId}`,
      data: JSON.stringify(data),
    })

    return response.data
  } catch (err) {
    console.log('Error running spell!')
    console.log('Err', err)
    return {}
  }
}
