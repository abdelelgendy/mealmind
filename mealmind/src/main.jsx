import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import './styles/user-components.css'
import './styles/plan-styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
