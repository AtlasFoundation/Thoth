import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import ThothPageLayout from './components/ThothPageLayout/ThothPageLayout'
import HomeScreen from './screens/HomeScreen/HomeScreen'
import Admin from './screens/Admin/routes'
import Thoth from './screens/Thoth/Thoth'

import 'flexlayout-react/style/dark.css'
import './design-globals/design-globals.css'
import './App.css'

import MainLayout from './components/MainLayout/MainLayout'

//These need to be imported last to override styles.

function App() {
  return (
    <Routes>
        <Route element={<MainLayout />}>
          <Route element={<ThothPageLayout />}>
            <Route path="/home/*" element={<HomeScreen />} />
            <Route path="/" element={<Thoth />} />
            <Route path="/thoth/*" element={<Admin />} />
            <Route path="/:spellName" element={<Thoth />} />
          </Route>
      </Route>
    </Routes>
  )
}

export default App
