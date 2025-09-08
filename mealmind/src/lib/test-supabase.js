import { createClient } from "@supabase/supabase-js";
import { testConfig } from "../config/test-config.js";

// Test Supabase client with hardcoded values
console.log('🧪 Creating test Supabase client with hardcoded values...');

export const testSupabase = createClient(
  testConfig.supabase.url, 
  testConfig.supabase.anonKey
);

console.log('✅ Test Supabase client created successfully');

// Test the connection immediately
export const testDirectConnection = async () => {
  console.log('🔍 Testing direct Supabase connection...');
  
  try {
    const { data, error } = await testSupabase.auth.getSession();
    
    if (error) {
      console.error('❌ Direct connection failed:', error);
      return false;
    }
    
    console.log('✅ Direct connection successful');
    
    // Test database access
    const { data: tableData, error: tableError } = await testSupabase
      .from('recipes_cache')
      .select('count(*)')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Database access failed:', tableError);
      return false;
    }
    
    console.log('✅ Database access successful');
    return true;
    
  } catch (err) {
    console.error('❌ Direct connection error:', err);
    return false;
  }
};

// Run test immediately
testDirectConnection();
