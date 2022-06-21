import './wdyr'
import 'regenerator-runtime/runtime'
import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
// import { PersistGate } from 'redux-persist/integration/react'

import App from './App'
import AppProviders from './contexts/AppProviders'
import reportWebVitals from './reportWebVitals'
import { store } from './state/store'
import { createRoot } from 'react-dom/client'

const element = document.getElementById('root')

if (element) {
  const root = createRoot(element)

  root.render(
    <Router>
      <Provider store={store}>
        {/* <PersistGate loading={null} persistor={persistor}> */}
        <AppProviders>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </AppProviders>
        {/* </PersistGate> */}
      </Provider>
    </Router>
  )

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals()
}
