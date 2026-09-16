import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { runSelfCheck } from './engine/self_check'

if (import.meta.env.DEV) {
  runSelfCheck()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
