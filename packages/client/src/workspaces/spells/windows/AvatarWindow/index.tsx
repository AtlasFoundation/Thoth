import Window from '@components/Window/Window'
import Switch from '@mui/material/Switch'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'

import { useEffect, useState } from 'react'

import SpeechUtils from '../../../../speechUtils'
import { usePubSub } from '@/contexts/PubSubProvider'
import Avatar from './Avatar'
import { CollectionsOutlined } from '@mui/icons-material'

const AvatarWindow = ({ tab }) => {
  const [recording, setRecording] = useState<boolean>(false)
  const [file, setFile] = useState<string | null>(null)

  const { publish, subscribe, events } = usePubSub()
  const { $PLAYTEST_INPUT, $SEND_TO_AVATAR } = events

  const handleAvatarData = (event, data) => {
    // break out if this isnt a url
    console.log({ data })
    console.log({ file })
    if (data === file) return
    console.log('Setting file', data)
    setFile(data)
  }

  useEffect(() => {
    return subscribe($SEND_TO_AVATAR(tab.id), handleAvatarData) as () => void
  }, [])

  const receiveData = data => {
    publish($PLAYTEST_INPUT(tab.id), data)
  }

  useEffect(() => {
    const speechUtils = SpeechUtils.getInstance()
    if (recording) speechUtils.initRecording(receiveData)
    if (!recording) speechUtils.stopRecording()
  }, [recording])

  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecording(event.target.checked)
  }

  const toolbar = (
    <>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={recording} onChange={handleSwitch} />}
          label="Record"
        />
      </FormGroup>
    </>
  )

  return (
    <Window toolbar={toolbar}>
      <Avatar speechUrl={file} />
    </Window>
  )
}
export default AvatarWindow
