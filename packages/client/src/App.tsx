import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import ThothPageWrapper from './components/ThothPage/ThothPageWrapper'
import HomeScreen from './screens/HomeScreen/HomeScreen'
import Admin from './screens/Admin/routes'
import Thoth from './screens/Thoth/Thoth'

import 'flexlayout-react/style/dark.css'
import './design-globals/design-globals.css'
import './App.css'
import { activeTabSelector, selectAllTabs } from './state/tabs'
import { useSelector } from 'react-redux'
import { RootState } from './state/store'

//These need to be imported last to override styles.

function App() {
  // Use our routes
  const tabs = useSelector((state: RootState) => selectAllTabs(state.tabs))
  const activeTab = useSelector(activeTabSelector)

  return (
    <ThothPageWrapper tabs={tabs} activeTab={activeTab}>
      <Routes>
        <Route path="/" element={<Thoth />} />
        <Route path="/thoth/:spellName" element={<Thoth />} />
        <Route path="/home/*" element={<HomeScreen />} />
        <Route
          path="admin/*"
          element={
            <React.Suspense fallback={<>...</>}>
              <Admin />
            </React.Suspense>
          }
        />
      </Routes>
    </ThothPageWrapper>
  )
}

export default App
