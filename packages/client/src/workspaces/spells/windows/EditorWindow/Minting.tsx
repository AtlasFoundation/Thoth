import { useEffect, useState } from 'react'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { getAllUserNFTs } from '@psychedelic/dab-js'
// import { useSnackbar } from 'notistack'

import css from './editorwindow.module.css'

import WindowToolbar from '@components/Window/WindowToolbar'
import { useAuth } from '@/contexts/AuthProvider'
import { useGetSpellQuery } from '@/state/api/spells'
// import { SimpleAccordion } from '@components/Accordion'
// import Input from '@components/Input/Input'
// import Panel from '@components/Panel/Panel'
// import { useModal } from '@/contexts/ModalProvider'

// import { useEditor } from '@/workspaces/contexts/EditorProvider'
import { Mint } from '../../../../components/Mint/Mint'
import { usePlugWallet } from '@/contexts/PlugProvider'

const MintingView = ({ open, setOpen, spellId, close }) => {
  const [loadingNfts] = useState(false)
  const [nfts] = useState([])
  const { getUserPrinciple, getAgent, connected } = usePlugWallet()
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

  const getNFTCollections = async () => {
    const principle = await getUserPrinciple()
    const collections = await getAllUserNFTs({
      agent: getAgent(),
      user: principle,
    })

    return collections
  }

  useEffect(() => {
    if (!connected) return

    ;(async () => {
      const nftCollections = await getNFTCollections()

      console.log('COLLECTIONS', nftCollections)
    })()
  }, [connected])

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
          {!loadingNfts || !nfts || nfts.length === 0 ? (
            <p className={css['message']}>
              You have no NFTs in your wallet. <br /> Press "Mint" to mint your
              current spwell into an NFT.
            </p>
          ) : (
            <>
              {nfts.map(nft => {
                return (
                  <div></div>
                  // <SimpleAccordion
                  //   key={deploy.version}
                  //   heading={`${deploy.version}${
                  //     deploy.versionName ? ' - ' + deploy.versionName : ''
                  //   }`}
                  //   defaultExpanded={true}
                  // >
                  //   <button
                  //     className={css['load-button'] + ' extra-small'}
                  //     onClick={() => {
                  //       loadVersion(deploy.version)
                  //     }}
                  //   >
                  //     Load
                  //   </button>
                  //   <div
                  //     style={{
                  //       display: 'flex',
                  //       flexDirection: 'column',
                  //       flex: 1,
                  //     }}
                  //   >
                  //     <p> Endpoint URL </p>
                  //     <div
                  //       style={{
                  //         display: 'flex',
                  //         flex: 1,
                  //         gap: 'var(--c1)',
                  //         width: '100%',
                  //       }}
                  //     >
                  //       <Input
                  //         style={{ flex: 1 }}
                  //         value={buildUrl(deploy.version)}
                  //         readOnly
                  //       />
                  //       <button onClick={() => copy(buildUrl(deploy.version))}>
                  //         copy
                  //       </button>
                  //     </div>
                  //     <p> Change notes </p>
                  //     <Panel
                  //       style={{
                  //         sbackgroundColor: 'var(--dark-1)',
                  //         border: '1px solid var(--dark-3)',
                  //       }}
                  //     >
                  //       {deploy.message}
                  //     </Panel>
                  //   </div>
                  // </SimpleAccordion>
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
