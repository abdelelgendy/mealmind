import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import App from './App.jsx'
import { PlanProvider } from "./plan/PlanContext.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <PlanProvider>
      <App />
    </PlanProvider>
  </BrowserRouter>,
)
