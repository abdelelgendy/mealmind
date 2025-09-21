/**
 * Environment configuration with validation
 * This file validates environment variables and provides safe defaults
 */

// Debug logging for environment variables (including build time)
console.log('🔍 Environment Debug:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***PRESENT***' : 'MISSING',
  VITE_SPOONACULAR_API_KEY: import.meta.env.VITE_SPOONACULAR_API_KEY ? '***PRESENT***' : 'MISSING',
  VITE_SPOONACULAR_RAW: import.meta.env.VITE_SPOONACULAR_API_KEY, // Show actual value for debugging
  VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
  ALL_ENV_VARS: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

// Build-time environment check
if (import.meta.env.PROD) {
  console.warn('🚀 PRODUCTION BUILD - Environment check:', {
    supabaseConfigured: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
  });
}

const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  spoonacular: {
    apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY || '',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validation function with better error handling
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SPOONACULAR_API_KEY'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('Environment Variables Status:', {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
      VITE_SPOONACULAR_API_KEY: import.meta.env.VITE_SPOONACULAR_API_KEY ? '✓ Set' : '✗ Missing'
    });
  }
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    return false;
  }
  
  return true;
};

// Safe config export that doesn't expose actual values in logs
export const getConfig = () => {
  const isValid = validateEnvironment();
  
  return {
    ...config,
    isValid,
    // Only show if variables are present, not their values
    hasSupabaseConfig: !!(config.supabase.url && config.supabase.anonKey),
    hasSpoonacularConfig: !!config.spoonacular.apiKey,
  };
};

export default config;
