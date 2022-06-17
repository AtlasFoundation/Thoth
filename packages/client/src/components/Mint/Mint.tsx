import './dabStuff.css'
import dip721v2_idl from '@psychedelic/dab-js/dist/idls/dip_721_v2.did'
import { useSnackbar } from 'notistack'

export function Mint({ mintJsonData }) {
  const cipherCanister = '6hgw2-nyaaa-aaaai-abkqq-cai'
  const whitelist = [cipherCanister]
  const { enqueueSnackbar } = useSnackbar()

  const checkIndex = async () => {
    const canisterId = cipherCanister
    await (window as any).ic.plug.createAgent({ whitelist })
    const plugActor = await (window as any).ic.plug.createActor({
      canisterId,
      interfaceFactory: dip721v2_idl,
    })
    let tokenIndex = await plugActor.totalSupply()
    tokenIndex = Number(await tokenIndex.toString().slice(0, 1))
    return tokenIndex + 1
  }

  const mintNFT = async () => {
    var canisterId = cipherCanister
    const principal = await (window as any).ic.plug.agent.getPrincipal()
    const tokenIndex = await checkIndex()
    const whitelist = [canisterId]
    await (window as any).ic.plug.createAgent({ whitelist })
    const plugActor = await (window as any).ic.plug.createActor({
      canisterId,
      interfaceFactory: dip721v2_idl,
    })
    const properties = [
      [
        'location',
        {
          TextContent:
            'https://f2cug-hyaaa-aaaah-abkdq-cai.raw.ic0.app/0/preview.jpg',
        },
      ],
      [
        'json',
        {
          TextContent: JSON.stringify(mintJsonData),
        },
      ],
    ]

    try {
      const mintResult = await plugActor.mint(principal, tokenIndex, properties)
      console.log(mintResult)
      enqueueSnackbar('Spell minted succesffuly!', { variant: 'success' })
    } catch (err) {
      enqueueSnackbar('Error minting spell', { variant: 'error' })
      console.log(err)
    }
  }

  return (
    <>
      <div className="buttonContainer">
        <button id="mintNFT" onClick={mintNFT} className="mintButton">
          Mint
        </button>
      </div>
    </>
  )
}
