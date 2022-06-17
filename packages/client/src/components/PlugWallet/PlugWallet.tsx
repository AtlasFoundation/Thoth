import { useEffect, useState } from 'react'
import './plugWallet.css'

export function PlugWallet({
  onConnect = (arg: string) => {},
  onFail = (arg: string) => {},
}) {
  const [showMenu, setShowMenu] = useState<Boolean>(false)
  const [connected, setConnected] = useState<Boolean>(false)
  const [userPrinciple, setUserPrinciple] = useState<string>('Not connected')
  const [currentBalance, setCurrentBalance] = useState<string>('N/A')
  const [tokenName, setTokenName] = useState<string>('')
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false)

  // handle turning balance loading back off when it is done
  useEffect(() => {
    if (tokenName !== '' && balanceLoading) setBalanceLoading(false)
  }, [tokenName, balanceLoading])

  const grabBalance = async () => {
    setBalanceLoading(true)
    const response = await (window as any).ic.plug.requestBalance()
    setCurrentBalance(response[0].amount.toString())
    setTokenName(response[0].name)
  }

  const plugLogin = async () => {
    // check if (window as any).ic exists, and if (window as any).ic.plug exist

    if (!(window as any).ic || !(window as any).ic.plug) {
      return onFail('Could not connect - Plug is not installed')
    }

    // check if user is logged in
    const hasLoggedIn = await (window as any).ic.plug.isConnected()

    // Set connected state for rest of UI
    setConnected(hasLoggedIn)
    await (window as any).ic.plug.createAgent()

    // get the users principle that they are logged in as
    const userPrincipleResponse = await (
      window as any
    ).ic.plug.agent.getPrincipal()

    console.log('Logged in as: ' + userPrincipleResponse)

    // call onFail callback
    if (!userPrincipleResponse) {
      return onFail('Could not connect - User authentication failed')
    }

    // Set the users principle to component state for use in UI
    setUserPrinciple(userPrincipleResponse.toString())

    //   activateDabFunctions();

    // Process the users wallet balance to show
    await grabBalance()

    // Pass user principle ID out to callback
    onConnect(userPrincipleResponse.toString())
  }

  // Drops the menu
  const toggleMenu = async () => {
    setShowMenu(!showMenu)
  }

  return (
    <>
      <div className="walletContainer">
        <button onClick={toggleMenu} className="plugMenu">
          Plug Menu
          <div
            className={'statusBubble' + (connected ? ' connected' : '')}
          ></div>
        </button>
        <div className={'plugSettings' + (showMenu ? ' showMenu' : '')}>
          <div className="menuHeader">
            <button onClick={plugLogin} disabled={!!connected}>
              {connected ? 'Connected' : 'Connect'}
            </button>
            <h6>Logged In As: {userPrinciple}</h6>
            <div className="balance" id="balance">
              <p>Balance: </p>
              <p style={{ color: 'rgba(0,255,0,0.5' }}>
                {balanceLoading
                  ? 'Please Wait...'
                  : `${currentBalance} ${tokenName}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
