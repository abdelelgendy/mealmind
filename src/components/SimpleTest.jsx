import React from 'react';

export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', color: '#333' }}>
      <h1>Test Component</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  );
}
