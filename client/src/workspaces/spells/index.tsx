import { useEffect, useRef, useState } from 'react'

import { useEditor } from '@/workspaces/contexts/EditorProvider'
import { Layout } from '@/workspaces/contexts/LayoutProvider'
import { useLazyGetSpellQuery, useSaveDiffMutation } from '@/state/api/spells'
import { debounce } from '@/utils/debounce'
import { useSnackbar } from 'notistack'
import EditorWindow from './windows/EditorWindow/'
import EventHandler from '@/screens/Thoth/components/EventHandler'
import Inspector from './windows/InspectorWindow'
import Playtest from './windows/PlaytestWindow'
import StateManager from '@/workspaces/spells/windows/StateManagerWindow'
import TextEditor from './windows/TextEditorWindow'
import DebugConsole from './windows/DebugConsole'
import { Spell } from '@latitudegames/thoth-core/types'
import { usePubSub } from '@/contexts/PubSubProvider'
import { useSharedb } from '@/contexts/SharedbProvider'
import { sharedb } from '@/config'
import { ThothComponent } from '@latitudegames/thoth-core/src/thoth-component'
import { useAuth } from '@/contexts/AuthProvider'
import { CalendarApp } from '@/screens/Calendar/Calendar'
import { diff } from '@/utils/json0'
import EntityManagerWindow from './windows/EntityManagerWindow'
import EventManagerWindow from './windows/EventManager'
import SearchCorpus from './windows/SearchCorpusWindow'
import VideoTranscription from './windows/VideoTranscription'
import MessageReactionEditor from './windows/MessageReactionEditor'
import WysiwygEditor from './windows/WysiwygEditor'

const Workspace = ({ tab, tabs, pubSub }) => {
  const spellRef = useRef<Spell>()
  const { events, publish } = usePubSub()
  const { getSpellDoc } = useSharedb()
  const { user } = useAuth()
  const [loadSpell, { data: spellData }] = useLazyGetSpellQuery()
  const { editor } = useEditor()
  const [saveDiff] = useSaveDiffMutation()

  const [docLoaded, setDocLoaded] = useState<boolean>(false)

  const { enqueueSnackbar } = useSnackbar()

  // Set up autosave for the workspaces
  useEffect(() => {
    if (!editor?.on) return

    const unsubscribe = editor.on(
      // Comment events:  commentremoved commentcreated addcomment removecomment editcomment connectionpath
      'save nodecreated noderemoved connectioncreated connectionremoved nodetranslated',
      debounce(async data => {
        if (tab.type === 'spell' && spellRef.current) {
          const jsonDiff = diff(spellRef.current?.graph, editor.toJSON())
          console.log('Saving diff', jsonDiff)
          if (jsonDiff == [] || !jsonDiff) return

          const response = await saveDiff({
            name: spellRef.current.name,
            diff: jsonDiff,
          })
          loadSpell({
            spellId: tab.spellId,
            userId: user?.id as string,
          })

          if ('error' in response) {
            enqueueSnackbar('Error saving spell', {
              variant: 'error',
            })
          }
          // publish(events.$SAVE_SPELL_DIFF(tab.id), { graph: serialize() })
        }
      }, 1000)
    )

    return unsubscribe as () => void
  }, [editor])

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
          chain: editor.toJSON(),
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
      console.log('UPDATED GRAPH', spellData.graph)
      editor.loadGraph(doc.data.graph, true)
    })

    setDocLoaded(true)
  }, [spellData, editor])

  useEffect(() => {
    if (!tab || !tab.spellId) return
    loadSpell({
      spellId: tab.spellId,
      userId: user?.id as string,
    })
  }, [tab])

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
        case 'wysiwygEditor':
          return <WysiwygEditor {...props} />
        case 'editorWindow':
          return <EditorWindow {...props} />
        case 'debugConsole':
          return <DebugConsole {...props} />
        case 'searchCorpus':
          return <SearchCorpus />
        case 'entityManager':
          return <EntityManagerWindow />
        case 'eventManager':
          return <EventManagerWindow />
        case 'videoTranscription':
          return <VideoTranscription />
        case 'calendarTab':
          return <CalendarApp />
        case 'messageReactionEditor':
          return <MessageReactionEditor />
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
