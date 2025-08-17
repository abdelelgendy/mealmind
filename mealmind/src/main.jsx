import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import './styles/base.css'
import './styles/user-components.css'
import './styles/plan-styles.css'
import './styles/recipe-styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  </BrowserRouter>
)
