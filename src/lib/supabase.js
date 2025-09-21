 import { createClient } from "@supabase/supabase-js";
import config from "../config/environment.js";

// Debug logging for Supabase initialization
console.log('🔧 Supabase Debug:', {
  hasUrl: !!config.supabase.url,
  hasKey: !!config.supabase.anonKey,
  urlLength: config.supabase.url.length,
  keyLength: config.supabase.anonKey.length,
  urlPreview: config.supabase.url.substring(0, 30) + '...',
  keyPreview: config.supabase.anonKey.substring(0, 20) + '...'
});

// Validate URL format before creating client
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Fallback values if environment variables are not loading
const FALLBACK_SUPABASE_URL = 'https://xomllgblqmryqokgjxnr.supabase.co';
const FALLBACK_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbWxsZ2JscW1yeXFva2dqeG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjMwMzksImV4cCI6MjA3MDY5OTAzOX0.m2EiYqXklJyb012_iGjl0g7sJbFhWUOVuKApIm6i2Wk';

// Use environment variables first, fallback to hardcoded values
const supabaseUrl = config.supabase.url || import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseKey = config.supabase.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;

// Ensure we always have valid credentials
let supabaseClient;
try {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase credentials, using fallback values');
  }
  supabaseClient = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  // Create client with fallback values as last resort
  supabaseClient = createClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_KEY);
}

export const supabase = supabaseClient;

// Log initialization status (only in development)
if (config.isDevelopment) {
  if (!supabase) {
    console.warn("Supabase client not initialized:", {
      hasUrl: !!config.supabase.url,
      hasKey: !!config.supabase.anonKey,
      isValidUrl: config.supabase.url ? isValidUrl(config.supabase.url) : false
    });
  } else {
    console.log("Supabase client initialized successfully");
  }
}

export async function testConnection() {
  if (!supabase) {
    console.warn("Supabase client not initialized - missing environment variables");
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('recipes_cache').select('*').limit(1);
    if (error) {
      console.error("Error connecting to Supabase:", error);
      return false;
    }
    console.log("Supabase connection successful:", data);
    return true;
  } catch (err) {
    console.error("Failed to test Supabase connection:", err);
    return false;
  }
}

// Sign up with email and password
export async function signUp(email, password) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client not initialized. Please check your environment variables.' } };
  }
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data: data?.user || null, error };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}

// Log in with email and password
export async function logIn(email, password) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client not initialized. Please check your environment variables.' } };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data: data?.user || null, error };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}

// Log out
export async function logOut() {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user session
export async function getCurrentUser() {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }
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
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }
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

// Favorite recipes functions
export async function getFavorites(userId) {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
  return data;
}

export async function addToFavorites(userId, recipe) {
  if (!supabase) {
    console.warn("Supabase not initialized - cannot add to favorites");
    throw new Error("Database not available");
  }
  
  const { data, error } = await supabase
    .from("favorites")
    .upsert({
      user_id: userId,
      recipe_id: recipe.id,
      title: recipe.title,
      image: recipe.image
    })
    .select();

  if (error) {
    console.error("Error adding to favorites:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function removeFromFavorites(userId, recipeId) {
  if (!supabase) {
    console.warn("Supabase not initialized - cannot remove from favorites");
    throw new Error("Database not available");
  }
  
  const { data, error } = await supabase
    .from("favorites")
    .delete()
    .match({ user_id: userId, recipe_id: recipeId });

  if (error) {
    console.error("Error removing from favorites:", error);
    throw new Error(error.message);
  }
  return data;
}

// Meal tracking functions
export async function getMealTracking(userId) {
  const { data, error } = await supabase
    .from("meal_tracking")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching meal tracking:", error);
    return [];
  }
  return data;
}

export async function trackMeal(userId, day, slot, status) {
  // If status is empty, delete the tracking entry
  if (!status) {
    const { data, error } = await supabase
      .from("meal_tracking")
      .delete()
      .match({ user_id: userId, day, slot });
      
    if (error) {
      console.error("Error removing meal tracking:", error);
      throw new Error(error.message);
    }
    return data;
  }
  
  // Otherwise, create or update the tracking
  const { data, error } = await supabase
    .from("meal_tracking")
    .upsert({
      user_id: userId,
      day,
      slot,
      status, // 'made', 'eaten', etc.
      tracked_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error("Error tracking meal:", error);
    throw new Error(error.message);
  }
  return data;
}
