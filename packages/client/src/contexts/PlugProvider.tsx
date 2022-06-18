import { useContext, createContext, useState } from 'react'
import { Principal } from '@dfinity/principal'

interface PlugContext {
  userPrincipal: string | null
  setUserPrincipal: (principal: string) => void
  login: (
    onSucces?: (arg?: any) => void,
    onFail?: (arg?: any) => void
  ) => Promise<void>
  connected: boolean
  getUserPrincipal: () => Promise<any>
  getAgent: () => any
}

const Context = createContext<PlugContext>(undefined!)

export const usePlugWallet = () => useContext(Context)

// Might want to namespace these
const PlugProvider = ({ children }) => {
  const [userPrincipal, setUserPrincipalState] = useState<string | null>(null)
  const [connected, setConnected] = useState<boolean>(false)

  const setUserPrincipal = principal => {
    setUserPrincipalState(principal)
  }

  const getUserPrincipal = async () => {
    if (!userPrincipal) return null
    const principal = Principal.fromText(userPrincipal)
    return principal
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

    // get the users principal that they are logged in as
    const userPrincipalResponse = await (
      window as any
    ).ic.plug.agent.getPrincipal()

    console.log('Logged in as: ' + userPrincipalResponse)

    // call onFail callback
    if (!userPrincipalResponse) {
      return await onFail('Could not connect - User authentication failed')
    }

    // Set the users principal to component state for use in UI
    setUserPrincipal(userPrincipalResponse.toString())

    console.log('user principal set', userPrincipalResponse.toString())

    await onConnect(userPrincipalResponse.toString())

    //   activateDabFunctions();
  }

  const publicInterface: PlugContext = {
    userPrincipal,
    setUserPrincipal,
    connected,
    login,
    getUserPrincipal,
    getAgent,
  }

  return <Context.Provider value={publicInterface}>{children}</Context.Provider>
}

export default PlugProvider
