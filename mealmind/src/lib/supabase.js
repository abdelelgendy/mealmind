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
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error("Unexpected error in getCurrentUser:", error);
    return null;
  }
}

// Fetch user profile
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

// Update user profile
export async function updateProfile(userId, profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert([{ ...profile, id: userId }])
    .select();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }
  return data;
}

// Fetch pantry items for a user
export async function getPantry(userId) {
  const { data, error } = await supabase
    .from("pantry")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching pantry:", error);
    return [];
  }
  return data;
}

// Add/update pantry items for a user
export async function savePantry(userId, items) {
  const { data, error } = await supabase
    .from("pantry")
    .upsert(items.map(item => ({ ...item, user_id: userId })))
    .select();

  if (error) {
    console.error("Error saving pantry items:", error);
    return [];
  }
  return data;
}

// Fetch meal plan for a user
export async function getMealPlan(userId) {
  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching meal plan:", error);
    return [];
  }
  return data;
}

// Add/update a meal plan for a user
export async function saveMealPlan(userId, day, slot, recipe) {
  const { data, error } = await supabase
    .from("meal_plans")
    .upsert([{ user_id: userId, day, slot, ...recipe }])
    .select();

  if (error) {
    console.error("Error saving meal plan:", error);
    throw new Error(error.message);  // Throw an error to propagate
  }
  return data;
}

// Delete a meal plan entry for a user
export async function deleteMealPlan(userId, day, slot) {
  const { data, error } = await supabase
    .from("meal_plans")
    .delete()
    .match({ user_id: userId, day, slot });

  if (error) {
    console.error("Error deleting meal plan:", error);
    throw new Error(error.message);
  }
  return data;
}
