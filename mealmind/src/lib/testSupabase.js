import { supabase, testConnection } from './supabase.js';

console.log("Testing Supabase connection...");
testConnection()
  .then(isConnected => {
    console.log(`Connection test result: ${isConnected ? "SUCCESS" : "FAILED"}`);
  })
  .catch(error => {
    console.error("Connection test error:", error);
  });

// Also test if the profiles table exists
supabase
  .from('profiles')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error("Error accessing profiles table:", error);
    } else {
      console.log("Profiles table accessible:", data);
    }
  });
