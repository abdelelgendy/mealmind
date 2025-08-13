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

// Sign up with email and password
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

// Log in with email and password
export async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// Log out
export async function logOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user session
export function getCurrentUser() {
  return supabase.auth.getUser().then(({ data }) => data.user);
}
