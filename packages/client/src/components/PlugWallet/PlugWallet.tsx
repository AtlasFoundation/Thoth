import { useRef, useState } from 'react'
import './plugWallet.css'

export function PlugWallet({
  onConnect = (arg: string) => {},
  onFail = (arg: string) => {},
}) {
  // Code Goes Here

  let currentBalance = 'N/A'
  let tokenName = ''
  const dropdownModal = useRef<any>(null)
  const balanceModal = useRef<any>(null)

  const [connected, setConnected] = useState<Boolean>(false)
  const [userPrinciple, setUserPrinciple] = useState<string>('Not connected')

  const grabBalance = async () => {
    balanceModal.current!.innerHTML = 'Please Wait...'
    const res = await (window as any).ic.plug.requestBalance()
    currentBalance = res[0].amount
    tokenName = res[0].name
    balanceModal.current!.innerHTML = currentBalance + ' ' + tokenName
  }

  const plugLogin = async () => {
    // check if (window as any).ic exists, and if (window as any).ic.plug exist

    if (!(window as any).ic || !(window as any).ic.plug) {
      return onFail('Could not connect - Plug is not installed')
    }

    const hasLoggedIn = await (window as any).ic.plug.isConnected()
    setConnected(hasLoggedIn)
    await (window as any).ic.plug.createAgent()
    const userPrincipleResponse = await (
      window as any
    ).ic.plug.agent.getPrincipal()

    console.log('Logged in as: ' + userPrincipleResponse)

    if (!userPrincipleResponse) {
      return onFail('Could not connect - User authentication failedx')
    }

    console.log(userPrincipleResponse)

    setUserPrinciple(userPrincipleResponse.toString())

    //   activateDabFunctions();
    await grabBalance()
    onConnect(userPrincipleResponse)
  }
  const dropTheMenu = async () => {
    dropdownModal.current!.classList.toggle('showMenu')
  }
  //   const activateDabFunctions = async() => {
  //     DabStuff.methods?.activateDab();
  //   }
  window.onclick = function (event) {
    // TODO FIX THIS!!!!
    event.preventDefault()
    let dropdown = document.getElementById('plugSettings')!
    if (!event.target!.matches('.plugMenu')) {
      if (dropdown.classList.contains('showMenu')) {
        dropdown.classList.remove('showMenu')
      }
    }
  }
  // HTML(UI) returns stay inside of the export function

  return (
    <>
      <div className="walletContainer">
        <button onClick={dropTheMenu} id="plugMenu" className="plugMenu">
          Plug Menu
          <div
            className={'statusBubble' + (connected ? ' connected' : '')}
            id="statusBubble"
          ></div>
        </button>
        <div className="plugSettings" id="plugSettings" ref={dropdownModal}>
          <div className="menuHeader" id="menuHeader">
            <button onClick={plugLogin} id="connect" disabled={!!connected}>
              {connected ? 'Connected' : 'Connect'}
            </button>
            <h6>Logged In As: {userPrinciple}</h6>
            <div className="balance" id="balance">
              <p>Balance: </p>
              <p ref={balanceModal} style={{ color: 'rgba(0,255,0,0.5' }}>
                {currentBalance} {tokenName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
