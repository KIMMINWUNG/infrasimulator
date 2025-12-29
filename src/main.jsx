// =================================================================
// FILE: src/main.jsx
// 역할: React 앱의 진입점입니다. (이 파일은 수정할 필요 없습니다)
// =================================================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Tailwind CSS를 불러옵니다.
import '@fortawesome/fontawesome-free/css/all.min.css' // Font Awesome (오프라인용)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)