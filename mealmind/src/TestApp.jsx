import React from 'react';

function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'lightblue', 
      color: 'black',
      minHeight: '100vh',
      fontSize: '18px'
    }}>
      <h1>🚀 MealMind Test Mode</h1>
      <p>✅ React is working!</p>
      <p>✅ JavaScript is working!</p>
      <p>✅ CSS is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', background: 'white', border: '2px solid green' }}>
        If you can see this green-bordered box, everything is rendering correctly.
      </div>
    </div>
  );
}

export default TestApp;
