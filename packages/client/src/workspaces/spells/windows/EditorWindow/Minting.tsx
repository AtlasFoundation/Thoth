import { useEffect, useState } from 'react'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { getAllUserNFTs } from '@psychedelic/dab-js'
import { HttpAgent } from '@dfinity/agent'
import { useSnackbar } from 'notistack'

import css from './editorwindow.module.css'

import WindowToolbar from '@components/Window/WindowToolbar'
import { useAuth } from '@/contexts/AuthProvider'
import { useGetSpellQuery } from '@/state/api/spells'
import { SimpleAccordion } from '@components/Accordion'
import Input from '@components/Input/Input'
// import Panel from '@components/Panel/Panel'
// import { useModal } from '@/contexts/ModalProvider'

// import { useEditor } from '@/workspaces/contexts/EditorProvider'
import { Mint } from '../../../../components/Mint/Mint'
import { usePlugWallet } from '@/contexts/PlugProvider'

const MintingView = ({ open, setOpen, spellId, close }) => {
  const [nfts, setNfts] = useState<any>(null)
  const { getUserPrincipal, connected, userPrincipal } = usePlugWallet()
  const { enqueueSnackbar } = useSnackbar()
  // const { serialize } = useEditor()

  const { user } = useAuth()
  const { data: spell } = useGetSpellQuery(
    {
      spellId: spellId,
      userId: user?.id as string,
    },
    {
      skip: !spellId,
    }
  )

  const buildUrl = url => {
    return `https://urltorunspellnft.com`
  }

  // @ts-ignore
  const getNFTCollections = async () => {
    const host = 'https://ic0.app'
    const agent = new HttpAgent({ host })
    const principal = await getUserPrincipal()
    const collections = await getAllUserNFTs({
      agent,
      user: principal,
    })

    return collections
  }

  const copy = url => {
    const el = document.createElement('textarea')
    el.value = url
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    enqueueSnackbar('Url copied')
  }

  useEffect(() => {
    console.log('userPrincipal', userPrincipal)
    if (!connected || !userPrincipal) return
    ;(async () => {
      try {
        const nftCollections = await getNFTCollections()

        const tokens = nftCollections.filter(c => c.name === 'Cipher')[0].tokens

        const spellNfts = tokens.map(t => ({
          spell: JSON.parse(t.metadata.json.value.TextContent),
          url: t.url,
        }))

        setNfts(spellNfts)
      } catch (err) {
        console.log('error getting nft collections')
      }
    })()
  }, [connected, userPrincipal])

  // const { openModal, closeModal } = useModal()
  // const { enqueueSnackbar } = useSnackbar()

  return (
    <div className={`${css['deploy-shield']} ${css[!open ? 'inactive' : '']}`}>
      <div
        className={`${css['deploy-window']} ${css[!open ? 'inactive' : '']}`}
      >
        <div
          style={{
            backgroundColor: 'var(--dark-3)',
            padding: 'var(--c1)',
            paddingBottom: 0,
            borderBottom: '1px solid var(--dark-2)',
          }}
        >
          <WindowToolbar>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              NFTs
            </div>
            <Mint data={spell} />
            <button
              onClick={() => {
                setOpen(false)
              }}
            >
              Cancel
            </button>
          </WindowToolbar>
        </div>
        <Scrollbars>
          {!nfts || nfts.length === 0 ? (
            <p className={css['message']}>
              You have no NFTs in your wallet. <br /> Press "Mint" to mint your
              current spwell into an NFT.
            </p>
          ) : (
            <>
              {nfts.map((nft, i) => {
                return (
                  <SimpleAccordion
                    key={nft.spell.name + i}
                    heading={`${nft.spell.name}`}
                    defaultExpanded={true}
                  >
                    <button
                      className={css['load-button'] + ' extra-small'}
                      onClick={() => {
                        // loadVersion(deploy.version)
                      }}
                    >
                      Load
                    </button>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}
                    >
                      <p> Endpoint URL </p>
                      <div
                        style={{
                          display: 'flex',
                          flex: 1,
                          gap: 'var(--c1)',
                          width: '100%',
                        }}
                      >
                        <Input
                          style={{ flex: 1 }}
                          value={buildUrl(nft.url)}
                          readOnly
                        />
                        <button onClick={() => copy(buildUrl(nft.url))}>
                          copy
                        </button>
                      </div>
                    </div>
                  </SimpleAccordion>
                )
              })}
            </>
          )}
        </Scrollbars>
      </div>
    </div>
  )
}

export default MintingView
