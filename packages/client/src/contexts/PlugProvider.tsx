import { useContext, createContext, useState } from 'react'

interface PlugContext {
  userPrinciple: string | null
  setUserPrinciple: (principle: string) => void
  login: (
    onSucces?: (arg?: any) => void,
    onFail?: (arg?: any) => void
  ) => Promise<void>
  connected: boolean
  getUserPrinciple: () => Promise<any>
  getAgent: () => any
}

const Context = createContext<PlugContext>(undefined!)

export const usePlugWallet = () => useContext(Context)

// Might want to namespace these
const PlugProvider = ({ children }) => {
  const [userPrinciple, setUserPrincipleState] = useState<string | null>(null)
  const [connected, setConnected] = useState<boolean>(false)

  const setUserPrinciple = principle => {
    setUserPrincipleState(principle)
  }

  const getUserPrinciple = async () => {
    const userPrincipleResponse = await (
      window as any
    ).ic.plug.agent.getPrincipal()

    return userPrincipleResponse
  }

  const getAgent = () => {
    return (window as any).ic.plug.agent
  }

  const login = async (
    onConnect = (arg?: any) => {},
    onFail = (arg?: any) => {}
  ) => {
    // check if (window as any).ic exists, and if (window as any).ic.plug exist

    if (!(window as any).ic || !(window as any).ic.plug) {
      return await onFail('Could not connect - Plug is not installed')
    }

    // check if user is logged in
    const hasLoggedIn = await (window as any).ic.plug.isConnected()

    // Set connected state for rest of UI
    setConnected(hasLoggedIn)
    await (window as any).ic.plug.createAgent()

    // get the users principle that they are logged in as
    const userPrincipleResponse = await getUserPrinciple()

    console.log('Logged in as: ' + userPrincipleResponse)

    // call onFail callback
    if (!userPrincipleResponse) {
      return await onFail('Could not connect - User authentication failed')
    }

    // Set the users principle to component state for use in UI
    setUserPrinciple(userPrincipleResponse.toString())

    await onConnect(userPrincipleResponse.toString())

    //   activateDabFunctions();
  }

  const publicInterface: PlugContext = {
    userPrinciple,
    setUserPrinciple,
    connected,
    login,
    getUserPrinciple,
    getAgent,
  }

  return <Context.Provider value={publicInterface}>{children}</Context.Provider>
}

export default PlugProvider
