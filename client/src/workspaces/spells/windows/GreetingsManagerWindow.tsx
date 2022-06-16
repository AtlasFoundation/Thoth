import axios from "axios";
import { useEffect, useState } from "react";
import Greeting from "./Greeting";

const GreetingsManagerWindow = () => {
  const [greetings, setGreetings] = useState(null)

  const getGreetings = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_ROOT_URL}/greetings`)
    setGreetings(res.data)
  }

  const createNew = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_ROOT_URL}/greetings`, {
        client: '',
        channelId: '',
        message: ''
      })
      await getGreetings()
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    (async () => {
      await getGreetings()
    })()
  }, [])
  
  return (
    <div className="agent-editor">
      {greetings && (greetings as any).map((greeting: any, idx) => 
        <Greeting
          key={idx}
          greeting={greeting}
          updateCallback={() => getGreetings()}
        />
      )}
      <div className="entBtns">
        <button onClick={createNew}>Create New</button>
      </div>
    </div>
  )
}

export default GreetingsManagerWindow