import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AtbaProvider } from './context/AtbaContext'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <AtbaProvider>
      <AuthProvider>
       <App />
      </AuthProvider>
      </AtbaProvider>
      </BrowserRouter>
      </React.StrictMode>
)
