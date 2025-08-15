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
  try {
    console.log(`Starting updateProfile for user ${userId} with:`, profile);
    
    // Use upsert instead of checking existence first - more atomic
    const { data, error } = await supabase
      .from("profiles")
      .upsert([{ id: userId, ...profile }], { 
        onConflict: 'id',
        returning: 'representation' 
      })
      .select();
    
    if (error) {
      console.error("Error in profile upsert operation:", error);
      throw new Error(`Supabase upsert error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.warn("No data returned from upsert operation");
      
      // Double-check if the profile exists now (as a fallback)
      const { data: checkData, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (checkError) {
        console.error("Error in fallback profile check:", checkError);
        throw new Error("Failed to confirm profile update");
      }
      
      if (checkData) {
        console.log("Profile found in fallback check:", checkData);
        return [checkData]; // Return in same format as upsert
      } else {
        throw new Error("Could not find or create profile");
      }
    }
    
    console.log("Profile successfully updated/created:", data);
    return data;
  } catch (error) {
    console.error("Exception in updateProfile:", error.message);
    throw error;
  }
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
    .upsert([{ 
      user_id: userId, 
      day, 
      slot, 
      recipe_id: recipe.id,
      title: recipe.title
    }])
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

// Delete all meal plans for a user
export async function deleteAllMealPlans(userId) {
  const { data, error } = await supabase
    .from("meal_plans")
    .delete()
    .match({ user_id: userId });

  if (error) {
    console.error("Error deleting all meal plans:", error);
    throw new Error(error.message);
  }
  return data;
}
