import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { testSupabaseConnection } from '../lib/testSupabase.js';

const DebugPage = () => {
  const [envStatus, setEnvStatus] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('Testing...');

  useEffect(() => {
    // Check environment variables
    const status = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      VITE_SPOONACULAR_API_KEY: import.meta.env.VITE_SPOONACULAR_API_KEY ? '✅ Set' : '❌ Missing',
      supabaseClient: supabase ? '✅ Created' : '❌ Failed to create'
    };
    setEnvStatus(status);

    // Test connection
    testSupabaseConnection().then(success => {
      setConnectionStatus(success ? '✅ All connections working' : '❌ Connection failed');
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔧 Debug Information</h2>
      
      <h3>Environment Variables</h3>
      <ul>
        {Object.entries(envStatus).map(([key, value]) => (
          <li key={key}><strong>{key}:</strong> {value}</li>
        ))}
      </ul>

      <h3>Connection Status</h3>
      <p>{connectionStatus}</p>

      <h3>Environment Values (First 10 chars)</h3>
      <ul>
        <li><strong>SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL?.substring(0, 20)}...</li>
        <li><strong>SUPABASE_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)}...</li>
        <li><strong>SPOONACULAR_KEY:</strong> {import.meta.env.VITE_SPOONACULAR_API_KEY?.substring(0, 10)}...</li>
      </ul>

      <h3>Console Output</h3>
      <p>Check the browser console (F12) for detailed connection test results.</p>
    </div>
  );
};

export default DebugPage;
