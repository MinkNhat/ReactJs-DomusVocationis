import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App';
import { Provider } from 'react-redux'
import { store } from '@/redux/store';
import { ConfigProvider } from 'antd';
import vi_VN from 'antd/locale/vi_VN'
import styles from '@/styles/app.module.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={vi_VN}>
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
)
