import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import App from './App.tsx'
import './index.css'

const theme = {
  token: {
    colorPrimary: '#0a0d54',
    colorBgBase: '#dde4eb',
    borderRadius: 4,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#0a0d54',
      bodyBg: '#dde4eb',
    },
    Menu: {
      darkItemBg: '#0a0d54',
      darkItemSelectedBg: '#15195c',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={theme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
