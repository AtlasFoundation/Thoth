import axios from "axios"
import { useSnackbar } from "notistack"
import { useState } from "react"

const Greeting = ({ greeting, updateCallback }) => {
  const [data, setData] = useState(greeting)
  const { enqueueSnackbar } = useSnackbar()
  const handleChange = (key: string, value: string) => {
    setData({
      ...data,
      [key]: value
    })
  }

  const updateGreeting = async () => {
    const { id, ...reqBody } = data
    try {
      await axios.put(`${process.env.REACT_APP_API_ROOT_URL}/greetings/${id}`, { ...reqBody })
      enqueueSnackbar('Greeting with id: ' + id + ' updated successfully', {
        variant: 'success',
      })
      updateCallback()
    } catch (e) {
      enqueueSnackbar('Server Error updating entity with id: ' + id, {
        variant: 'error',
      })
    }
  }

  const removeGreeting = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_ROOT_URL}/greetings/${data.id}`)
      enqueueSnackbar('Greeting with id: ' + data.id + ' deleted successfully', {
        variant: 'success',
      })
      updateCallback()
    } catch (e) {
      enqueueSnackbar('Server Error deleting entity with id: ' + data.id, {
        variant: 'error',
      })
    }
  }

  return (
    <div>
      <div className="form-item agent-select">
        <span className="form-item-label">Client</span>
        <select 
          name="client" 
          id="client"
          value={data.client}
          onChange={(e) => handleChange('client', e.target.value)}
        >
          <option value="discord">Discord</option>
          <option value="slack">Slack</option>
        </select>
      </div>

      <div className="form-item">
        <span className="form-item-label">Channel ID</span>
        <input 
          type="text"
          value={data.channelId}
          onChange={(e) => handleChange('channelId', e.target.value)}
        />
      </div>
      
      <div className="form-item">
        <span className="form-item-label">Message</span>
        <textarea
          className="form-text-area" 
          rows={1}
          value={data.message}
          onChange={(e) => handleChange('message', e.target.value)}
        />
      </div>

      <div className="form-item entBtns">
        <button onClick={updateGreeting} style={{ marginRight: '10px' }}>
          Update
        </button>
        <button onClick={removeGreeting} style={{ marginRight: '10px' }}>
          Delete
        </button>
      </div>
    </div>
  )
}

export default Greeting