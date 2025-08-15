import { createClient } from '@supabase/supabase-js';

// Get these from your .env file or environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing Supabase connection...');

// Test connection by making a simple query
try {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Successfully connected to Supabase!');
    console.log('Sample data:', data);
  }
} catch (err) {
  console.error('Exception during connection test:', err);
}
