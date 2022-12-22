import './wdyr'
import 'regenerator-runtime/runtime'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
// import { PersistGate } from 'redux-persist/integration/react'

import App from './App'
import AppProviders from './contexts/AppProviders'
import reportWebVitals from './reportWebVitals'
import { store } from './state/store'

const container = document.getElementById('root')
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

ReactDOM.render(<Root />, container)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
