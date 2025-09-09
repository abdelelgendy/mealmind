import { supabase } from './supabase.js';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  
  // Check if supabase client exists
  if (!supabase) {
    console.error('❌ Supabase client is null - check your environment variables');
    return false;
  }
  
  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Supabase session error:', sessionError);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Check if we can query the database (test with recipes_cache table)
    console.log('🗄️ Testing database access...');
    const { data: tableData, error: tableError } = await supabase
      .from('recipes_cache')
      .select('count(*)')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Database access error:', tableError);
      console.log('💡 This might mean:');
      console.log('   - Tables don\'t exist in your Supabase project');
      console.log('   - Row Level Security (RLS) policies are blocking access');
      console.log('   - Wrong database URL or key');
      return false;
    }
    
    console.log('✅ Database access successful');
    
    // Test 3: Test Spoonacular API
    console.log('🍳 Testing Spoonacular API...');
    const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Spoonacular API key missing');
      return false;
    }
    
    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=chicken&number=1&apiKey=${apiKey}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Spoonacular API: Invalid API key');
        } else if (response.status === 402) {
          console.error('❌ Spoonacular API: Daily quota exceeded');
        } else {
          console.error(`❌ Spoonacular API error: ${response.status}`);
        }
        return false;
      }
      
      const data = await response.json();
      console.log('✅ Spoonacular API access successful');
      console.log(`📊 Found ${data.totalResults} recipes`);
      
    } catch (apiError) {
      console.error('❌ Spoonacular API network error:', apiError);
      return false;
    }
    
    console.log('🎉 All connections successful!');
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected error during connection test:', err);
    return false;
  }
};

// Run test immediately when imported in development
if (import.meta.env.DEV) {
  testSupabaseConnection();
}