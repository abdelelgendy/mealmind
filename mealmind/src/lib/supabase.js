import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function testConnection() {
  const { data, error } = await supabase.from('recipes_cache').select('*').limit(1);
  if (error) {
    console.error("Error connecting to Supabase:", error);
    return false;
  }
  console.log("Supabase connection successful:", data);
  return true;
}
