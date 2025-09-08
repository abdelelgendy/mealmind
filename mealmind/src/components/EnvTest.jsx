import React from 'react';

const EnvTest = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SPOONACULAR_API_KEY: import.meta.env.VITE_SPOONACULAR_API_KEY,
    DEV: import.meta.env.DEV,
    MODE: import.meta.env.MODE
  };

  console.log('Raw Environment Variables:', envVars);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Environment Variables Raw Test</h2>
      
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '10px' }}>
          <strong>{key}:</strong> 
          <span style={{ marginLeft: '10px', color: value ? 'green' : 'red' }}>
            {value ? `✅ "${value.substring(0, 20)}..."` : '❌ undefined'}
          </span>
        </div>
      ))}
      
      <h3>Full Values (check console for complete output)</h3>
      <p>Check the browser console (F12) for complete environment variable values.</p>
    </div>
  );
};

export default EnvTest;
