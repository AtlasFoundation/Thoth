import { useState, useEffect } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import { useSelector } from 'react-redux'

import css from './editorwindow.module.css'

import WindowToolbar from '../../../common/Window/WindowToolbar'
import { SimpleAccordion } from '../../../common/Accordion'
import Input from '../../../common/Input/Input'
import Panel from '../../../common/Panel/Panel'
import Icon from '../../../common/Icon/Icon'
import { useModal } from '../../../../contexts/ModalProvider'

import {
  useGetVersionsQuery,
  selectSpellById,
  useDeploySpellMutation,
} from '../../../../state/spells'

const DeploymentView = ({ open, setOpen, spellId }) => {
  const [list, setList] = useState([])
  const { openModal, closeModal } = useModal()

  const [deploySpell] = useDeploySpellMutation()
  const spell = useSelector(state => selectSpellById(state, spellId))
  const { data: deployements, isLoading } = useGetVersionsQuery(spell?.name)

  const deploy = message => {
    deploySpell({ spellId: spell.name, message })
  }

  const addVersionToList = message => {
    const version = {
      version: '0.0.' + list.length + 1,
      message,
    }

    setList([...list, version])
  }

  return (
    <div className={`${css['deploy-shield']} ${css[!open && 'inactive']}`}>
      <div className={`${css['deploy-window']} ${css[!open && 'inactive']}`}>
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
              Deployments
            </div>
            <button
              onClick={() => {
                setOpen(false)
              }}
            >
              Cancel
            </button>
            <button
              className="primary"
              onClick={() => {
                openModal({
                  modal: 'deployModal',
                  title: 'Deploy',
                  options: {
                    // todo find better way to get next version here
                    version: '0.0.' + (deployements.length + 1),
                  },
                  onClose: notes => {
                    closeModal()
                    deploy(notes)
                  },
                })
              }}
            >
              Deploy new
            </button>
          </WindowToolbar>
        </div>
        <Scrollbars>
          {isLoading || deployements.length === 0 ? (
            <p className={css['message']}>
              No previous deployments. <br /> Press "Deploy new" to create a new
              deployment.
            </p>
          ) : (
            <>
              {deployements.map(deploy => {
                return (
                  <SimpleAccordion
                    key={deploy.version}
                    heading={deploy.version}
                    defaultExpanded={true}
                  >
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
                          value={deploy.url}
                          readOnly
                        />
                        <button>copy</button>
                      </div>
                      <p> Change notes </p>
                      <Panel
                        style={{
                          sbackgroundColor: 'var(--dark-1)',
                          border: '1px solid var(--dark-3)',
                        }}
                      >
                        {deploy.message}
                      </Panel>
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

export default DeploymentView
