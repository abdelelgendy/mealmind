import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import optimized styles
import './styles/base.css';
import './styles/recipe-styles.css';

// Import components
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <DndProvider backend={HTML5Backend}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </DndProvider>
    </BrowserRouter>
  </React.StrictMode>
);
