import React from 'react';

/**
 * Environment Debug Component
 * Shows current environment status - useful for debugging deployment issues
 * Remove this after fixing the environment variables
 */
const EnvironmentDebug = () => {
  const envStatus = {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    hasSpoonacularKey: !!import.meta.env.VITE_SPOONACULAR_API_KEY,
    supabaseUrlLength: import.meta.env.VITE_SUPABASE_URL?.length || 0,
    supabaseKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#1a1a1a',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
      border: '2px solid #333'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>
        🐛 Environment Debug
      </div>
      
      {Object.entries(envStatus).map(([key, value]) => (
        <div key={key} style={{ margin: '3px 0' }}>
          <span style={{ color: '#888' }}>{key}:</span>{' '}
          <span style={{ 
            color: typeof value === 'boolean' 
              ? (value ? '#4CAF50' : '#f44336') 
              : '#fff' 
          }}>
            {String(value)}
          </span>
        </div>
      ))}
      
      <div style={{ 
        marginTop: '10px', 
        padding: '8px', 
        background: '#333', 
        borderRadius: '4px',
        fontSize: '10px'
      }}>
        <strong>Status:</strong> {envStatus.hasSupabaseUrl && envStatus.hasSupabaseKey 
          ? '✅ Backend Ready' 
          : '❌ Missing Environment Variables'
        }
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '10px', 
        color: '#888',
        textAlign: 'center'
      }}>
        Remove this component after fixing env vars
      </div>
    </div>
  );
};

export default EnvironmentDebug;