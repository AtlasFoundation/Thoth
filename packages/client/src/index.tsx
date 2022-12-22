import './wdyr'
import 'regenerator-runtime/runtime'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
// import { PersistGate } from 'redux-persist/integration/react'

import App from './App'
import AppProviders from './contexts/AppProviders'
import reportWebVitals from './reportWebVitals'
import { store } from './state/store'

const container = document.getElementById('root')

// After
// import { createRoot } from 'react-dom/client';
//
// const root = createRoot(container); // createRoot(container!) if you use TypeScript
// root.render(<App tab="home" />);

const root = createRoot(container!) // createRoot(container!) if you use TypeScript

const Root = () => (
  <Router>
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <AppProviders>
        <App />
      </AppProviders>
      {/* </PersistGate> */}
    </Provider>
  </Router>
)

root.render(<Root />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
