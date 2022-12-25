import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useEditor } from '@/workspaces/contexts/EditorProvider'
import { Layout } from '@/workspaces/contexts/LayoutProvider'
import { useLazyGetSpellQuery } from '@/state/api/spells'
import EventHandler from '@/screens/Thoth/components/EventHandler'
import { debounce } from '@/utils/debounce'

import EditorWindow from './windows/EditorWindow/'
import Inspector from './windows/InspectorWindow'
import Playtest from './windows/PlaytestWindow'
import AvatarWindow from './windows/AvatarWindow'
import StateManager from '@/workspaces/spells/windows/StateManagerWindow'

import TextEditor from './windows/TextEditorWindow'
import DebugConsole from './windows/DebugConsole'

import { Spell } from '@thothai/thoth-core/types'
import { usePubSub } from '@/contexts/PubSubProvider'
import { useSharedb } from '@/contexts/SharedbProvider'
import { sharedb } from '@/config'
import { ThothComponent } from '@thothai/thoth-core/types'
import EventManagerWindow from './windows/EventManager'
import { RootState } from '@/state/store'
import { useFeathers } from '@/contexts/FeathersProvider'
import { feathers as feathersFlag } from '@/config'
import EntityManagerWindow from '../agents/windows/EntityManagerWindow'

const Workspace = ({ tab, tabs, pubSub }) => {
  const spellRef = useRef<Spell>()
  const { events, publish } = usePubSub()
  const { getSpellDoc } = useSharedb()
  const [loadSpell, { data: spellData }] = useLazyGetSpellQuery()
  const { editor, serialize, setDirtyGraph } = useEditor()
  const FeathersContext = useFeathers()
  const client = FeathersContext?.client
  const preferences = useSelector((state: RootState) => state.preferences)

  const [docLoaded, setDocLoaded] = useState<boolean>(false)

  // Set up autosave for the workspaces
  useEffect(() => {
    if (!editor?.on) return
    const unsubscribe = editor.on(
      // Comment events:  commentremoved commentcreated addcomment removecomment editcomment connectionpath
      'save nodecreated noderemoved connectioncreated connectionremoved nodetranslated',
      debounce(async data => {
        if (tab.type === 'spell' && spellRef.current) {
          // old code, left just in case but to be removed when everything is working well
          // const jsonDiff = diff(spellRef.current?.graph, editor.toJSON())
          // if (!jsonDiff) return

          // const response = await saveDiff({
          //   name: spellRef.current.name,
          //   diff: jsonDiff,
          // })
          // loadSpell({
          //   spellId: tab.spellId,
          // })

          // if ('error' in response) {
          //   enqueueSnackbar('Error saving spell', {
          //     variant: 'error',
          //   })
          // }
          setDirtyGraph(true)
          publish(events.$SAVE_SPELL_DIFF(tab.id), { graph: serialize() })
        }
      }, 2000)
    )

    return unsubscribe as () => void
  }, [editor, preferences.autoSave])

  useEffect(() => {
    if (!editor?.on) return

    const unsubscribe = editor.on(
      'nodecreated noderemoved',
      (node: ThothComponent<unknown>) => {
        if (!spellRef.current) return
        if (node.category !== 'I/O') return
        // TODO we can probably send this update to a spell namespace for this spell.
        // then spells can subscribe to only their dependency updates.
        const event = events.$SUBSPELL_UPDATED(spellRef.current.name)
        const spell = {
          ...spellRef.current,
          graph: editor.toJSON(),
        }
        publish(event, spell)
      }
    ) as Function

    return unsubscribe as () => void
  }, [editor])

  useEffect(() => {
    if (!spellData) return
    spellRef.current = spellData
  }, [spellData])

  useEffect(() => {
    if (!spellData || !sharedb || docLoaded || !editor) return

    const doc = getSpellDoc(spellData as Spell)

    if (!doc) return

    doc.on('op batch', (op, origin) => {
      if (origin) return
      editor.loadGraph(doc.data.graph, true)
    })

    setDocLoaded(true)
  }, [spellData, editor])

  useEffect(() => {
    if (!tab || !tab.spellId) return
    loadSpell({
      spellId: tab.spellId,
    })
  }, [tab])

  useEffect(() => {
    if (!client || !feathersFlag) return
    ;(async () => {
      if (!client || !tab || !tab.spellId) return
      await client.service('spell-runner').get(tab.spellId)
    })()
  }, [client, feathersFlag])

  const factory = tab => {
    return node => {
      const props = {
        tab,
        node,
      }
      const component = node.getComponent()
      switch (component) {
        case 'stateManager':
          return <StateManager {...props} />
        case 'playtest':
          return <Playtest {...props} />
        case 'inspector':
          return <Inspector {...props} />
        case 'textEditor':
          return <TextEditor {...props} />
        case 'editorWindow':
          return <EditorWindow {...props} />
        case 'debugConsole':
          return <DebugConsole {...props} />
        case 'eventManager':
          return <EventManagerWindow {...props} />
        case 'entityManager':
          return <EntityManagerWindow />
        case 'avatar':
          return <AvatarWindow {...props} />
        default:
          return <p></p>
      }
    }
  }

  return (
    <>
      <EventHandler tab={tab} pubSub={pubSub} />
      <Layout json={tab.layoutJson} factory={factory(tab)} tab={tab} />
    </>
  )
}

const Wrapped = props => {
  return <Workspace {...props} />
}

export default Wrapped
