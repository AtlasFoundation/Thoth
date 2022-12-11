import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { useHotkeys } from 'react-hotkeys-hook'

import { usePubSub } from '../../../contexts/PubSubProvider'
import Window from '../../../components/Window/Window'
import css from '../../../screens/Thoth/thoth.module.css'
import { useFeathers } from '@/contexts/FeathersProvider'
import { feathers as feathersFlag } from '@/config'

const Input = props => {
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>
  useHotkeys(
    'return',
    () => {
      if (ref.current !== document.activeElement) return
      props.onSend()
    },
    // Not sure why it says INPUT is not a valid AvailableTag when it clearly is
    { enableOnTags: 'INPUT' as any },
    [props, ref]
  )

  return (
    <div className={css['playtest-input']}>

      <input
        ref={ref}
        type="text"
        value={props.value}
        onChange={props.onChange}
      ></input>
      <button className="small" onClick={props.onSend}>
        Send
      </button>
    </div>
  )
}

const Playtest = ({ tab }) => {
  const scrollbars = useRef<any>()
  const [history, setHistory] = useState([])
  const [value, setValue] = useState('')

  const { publish, subscribe, events } = usePubSub()
  const FeathersContext = useFeathers()
  const client = FeathersContext?.client
  const { $PLAYTEST_INPUT, $PLAYTEST_PRINT } = events

  const printToConsole = useCallback(
    (_, _text) => {
      let text = typeof _text === 'object' ? JSON.stringify(_text) : _text
      const newHistory = [...history, text]
      setHistory(newHistory as [])
    },
    [history]
  )
  useEffect(() => {
    if (!scrollbars.current) return
    scrollbars.current.scrollToBottom()
  }, [history])
  useEffect(() => {
    const unsubscribe = subscribe($PLAYTEST_PRINT(tab.id), printToConsole)

    // return a clean up function
    return unsubscribe as () => void
  }, [subscribe, printToConsole, $PLAYTEST_PRINT])

  const printItem = (text, key) => <li key={key}>{text}</li>

  const onSend = () => {
    const newHistory = [...history, `You: ${value}`]
    setHistory(newHistory as [])
    if (feathersFlag) {
      client.service('spell-runner').create({
        spellId: tab.spellId,
        inputs: {
          Input: value,
        },
      })
    }

    publish($PLAYTEST_INPUT(tab.id), value)
    setValue('')
  }

  const onChange = e => {
    setValue(e.target.value)
  }

  const onClear = () => {
    setHistory([])
  }

  const toolbar = (
    <React.Fragment>
      <form>
        <label htmlFor='api-key'>API Key</label>
        <input type='password' id='api-key' name='api-key' value='api-key' onChange={(e) => localStorage.setItem('openai-api-key', e.target.value)} />
      </form>
      <button className="small" onClick={onClear}>
        Clear
      </button>
    </React.Fragment>
  )

  return (
    <Window toolbar={toolbar}>
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <div className={css['playtest-output']}>
          <Scrollbars ref={ref => (scrollbars.current = ref)}>
            <ul>{history.map(printItem)}</ul>
          </Scrollbars>
        </div>
        <Input onChange={onChange} value={value} onSend={onSend} />
      </div>
    </Window>
  )
}

export default Playtest
