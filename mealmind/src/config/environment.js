/**
 * Environment configuration with validation
 * This file validates environment variables and provides safe defaults
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SPOONACULAR_API_KEY'
];

const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  spoonacular: {
    apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY,
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validation function
export const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
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
