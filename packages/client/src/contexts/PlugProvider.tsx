import { useContext, createContext } from 'react'

interface PlugContext {}

const Context = createContext<PlugContext>(undefined!)

export const usePlugWallet = () => useContext(Context)

export const docMap = new Map()

// Might want to namespace these
const PlugProvider = ({ children }) => {
  const publicInterface: PlugContext = {}

  return <Context.Provider value={publicInterface}>{children}</Context.Provider>
}

export default PlugProvider
