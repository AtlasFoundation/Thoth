import * as React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './components/RequireAuth/RequireAuth'
import ThothPageLayout from './components/ThothPageLayout/ThothPageLayout'
import HomeScreen from './screens/HomeScreen/HomeScreen'
import Admin from './screens/Admin/routes'
import Thoth from './screens/Thoth/Thoth'
import { useAuth } from './contexts/AuthProvider'

import 'flexlayout-react/style/dark.css'
import './design-globals/design-globals.css'
import './App.css'
import { selectAllTabs } from './state/tabs'
import { useSelector } from 'react-redux'
import { RootState } from './state/store'
import MainLayout from './components/MainLayout/MainLayout'
import EventManager from './screens/EventManager'

//These need to be imported last to override styles.

function App() {
  // Use our routes
  const tabs = useSelector((state: RootState) => selectAllTabs(state.tabs))
  const { user } = useAuth()

  const redirect = () => {
    if (user && tabs.length > 0) {
      return <Navigate to="/thoth" />
    }

    return user ? <Navigate to="/home" /> : <Navigate to="/login" />
  }

  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route element={<ThothPageLayout />}>
            <Route path="/thoth" element={<Thoth />} />
            <Route path="/thoth/:spellName" element={<Thoth />} />
            <Route path="/home/*" element={<HomeScreen />} />
          </Route>

          <Route path="/eventManager" element={<EventManager />} />

          <Route
            path="admin/*"
            element={
              <React.Suspense fallback={<>...</>}>
                <Admin />
              </React.Suspense>
            }
          />
          <Route path="/" element={redirect()} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
