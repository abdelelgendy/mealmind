import { createRoot } from 'react-dom/client';

function SimpleApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>MealMind Test Page</h1>
      <p>If you can see this, React is working correctly!</p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<SimpleApp />);
