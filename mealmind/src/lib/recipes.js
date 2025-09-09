import { supabase } from "./supabase";
import config from "../config/environment.js";
import { MOCK_RECIPES, searchMockRecipes, simulateApiCall } from "./mockData.js";

const API = 'https://api.spoonacular.com';
const KEY = config.spoonacular.apiKey;

// simple in-memory cache to avoid duplicate calls during the session
const memory = new Map();

// Network status detection
function isOnline() {
  return navigator.onLine;
}

function qs(params) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') u.set(k, v);
  });
  return u.toString();
}

// Fallback to mock data when offline or API unavailable
async function getMockRecipes(query = '', filters = {}) {
  console.log('🔄 Using offline mode - returning mock recipes');
  const mockResults = searchMockRecipes(query, filters);
  return simulateApiCall({
    results: mockResults,
    totalResults: mockResults.length
  });
}

// Get mock recipe details for offline mode
async function getMockRecipeDetails(id) {
  console.log(`🔄 Using offline mode - returning mock recipe details for ID: ${id}`);
  const recipe = MOCK_RECIPES.find(r => r.id === parseInt(id));
  if (!recipe) {
    throw new Error(`Recipe with ID ${id} not found in mock data`);
  }
  return simulateApiCall(recipe);
}

export async function searchRecipes({ query, maxCalories, diet, number = 20, signal }) {
  // Check if offline or no API key available
  if (!isOnline() || !KEY || KEY === '') {
    console.warn("Offline or no API key - returning mock data");
    return getMockRecipes(query, { maxCals: maxCalories, diet });
  }
  
  try {
    const params = {
      apiKey: KEY,
      query,
      number,
      addRecipeInformation: true, // includes image, summary, etc.
      instructionsRequired: true
    };
    if (diet) params.diet = diet;                      // "ketogenic","vegan","vegetarian","paleo","pescetarian","gluten free","high protein","low carb","low fat","primal","whole30","dairy free"
    if (maxCalories) params.maxCalories = maxCalories;  // spoonacular supports this on complex endpoints; for search we'll filter client-side too

    const url = `${API}/recipes/complexSearch?${qs(params)}`;

    if (memory.has(url)) return memory.get(url);

    const res = await fetch(url, { signal });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Search failed (${res.status}): ${text}`);
    }
    const data = await res.json();

    // normalize minimal fields for our UI
    const results = (data.results || []).map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      calories: r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || null
    }));

    memory.set(url, results);
    return results;
  } catch (error) {
    console.warn("Search failed, falling back to mock data:", error.message);
    return getMockRecipes(query, { maxCals: maxCalories, diet });
  }
}

export async function getRecipeById(id, { signal } = {}) {
  // Check if offline or no API key available
  if (!isOnline() || !KEY || KEY === '') {
    console.warn("Offline or no API key - returning mock recipe details");
    return getMockRecipeDetails(id);
  }
  
  const url = `${API}/recipes/${id}/information?${qs({ apiKey: KEY, includeNutrition: true })}`;
  if (memory.has(url)) return memory.get(url);
  
  try {
    console.log(`Fetching recipe details for ID: ${id}`);
    const res = await fetch(url, { signal });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Recipe ${id} failed: ${res.status} - ${errorText || 'No error details'}`);
    }
    
    const r = await res.json();
    console.log(`Recipe ${id} fetched successfully`);
    
    // Extract key nutrients we want to display
    const importantNutrients = ['Calories', 'Protein', 'Carbohydrates', 'Fat', 'Fiber', 'Sugar', 'Sodium'];
    const nutrients = r.nutrition?.nutrients
      ?.filter(n => importantNutrients.includes(n.name))
      .map(n => ({
        name: n.name,
        amount: Math.round(n.amount * 10) / 10, // Round to 1 decimal place
        unit: n.unit
      })) || [];
    
    // If there are other nutrients of interest, include them too
    const additionalNutrients = r.nutrition?.nutrients
      ?.filter(n => !importantNutrients.includes(n.name) && 
                    ['Iron', 'Calcium', 'Vitamin C', 'Vitamin A', 'Vitamin D'].includes(n.name))
      .map(n => ({
        name: n.name,
        amount: Math.round(n.amount * 10) / 10,
        unit: n.unit
      })) || [];
    
    if (additionalNutrients.length > 0) {
      nutrients.push(...additionalNutrients);
    }
    
    const normalized = {
      id: r.id,
      title: r.title,
      image: r.image,
      calories: r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || null,
      servings: r.servings || 1,
      readyInMinutes: r.readyInMinutes || null,
      prepTime: r.preparationMinutes || null,
      cookTime: r.cookingMinutes || null,
      sourceUrl: r.sourceUrl || null,
      sourceName: r.sourceName || null,
      dishTypes: r.dishTypes || [],
      diets: r.diets || [],
      nutrients: nutrients,
      ingredients: (r.extendedIngredients || []).map(i => ({
        name: i.name,
        amount: i.amount,
        unit: i.unit,
        originalString: i.original || null
      })),
      instructions: r.analyzedInstructions?.[0]?.steps?.map(s => s.step) || []
    };
    
    memory.set(url, normalized);
    return normalized;
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    console.warn("Returning mock recipe details due to error");
    return getMockRecipeDetails(id);
  }
}

export async function saveRecipeToCache(recipe) {
  // Temporarily disable caching due to schema issues
  console.log(`Skipping cache for recipe ${recipe.id}: ${recipe.title} (schema issues)`);
  return Promise.resolve([{ recipe_id: recipe.id, title: recipe.title }]);
}

export async function getCachedRecipeById(id) {
  if (!id) {
    console.error("No recipe ID provided for getCachedRecipeById");
    return null;
  }
  
  try {
    console.log(`Fetching cached recipe ${id}`);
    
    const { data, error } = await supabase
      .from("recipes_cache")
      .select("*")
      .eq("recipe_id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // This is "no rows returned" error, which is expected when a recipe isn't in cache
        console.log(`Recipe ${id} not found in cache`);
        return null;
      }
      console.error("Error in getCachedRecipeById Supabase operation:", error);
      throw new Error(`Database query error: ${error.message}`);
    }
    
    if (data) {
      console.log(`Recipe ${id} found in cache`);
      
      // Transform from database format to normalized format if needed
      const normalized = {
        id: data.recipe_id,
        title: data.title,
        image: data.image,
        calories: data.calories,
        servings: data.servings || 1,
        readyInMinutes: data.ready_in_minutes,
        prepTime: data.prep_time,
        cookTime: data.cook_time,
        sourceUrl: data.source_url,
        sourceName: data.source_name,
        dishTypes: data.dish_types || [],
        diets: data.diets || [],
        nutrients: data.nutrients || [],
        ingredients: data.ingredients || [],
        instructions: data.instructions || []
      };
      
      return normalized;
    }
    
    return null;
  } catch (error) {
    console.error("Exception in getCachedRecipeById:", error.message);
    return null;
  }
}

export async function testInsert() {
  const { data, error } = await supabase
    .from("recipes_cache")
    .insert([
      {
        recipe_id: "test-recipe-1",
        title: "Test Recipe",
        image: "https://via.placeholder.com/150",
        calories: 500,
        ingredients: JSON.stringify([{ name: "Chicken", amount: 200, unit: "g" }]),
        instructions: JSON.stringify(["Cook chicken", "Serve with rice"])
      }
    ]);
  if (error) {
    console.error("Error inserting test recipe:", error);
  } else {
    console.log("Inserted test recipe:", data);
  }
}

export async function removeRecipeFromCache(recipeId) {
  if (!recipeId || !supabase) return null;
  
  const { data, error } = await supabase
    .from("recipes_cache")
    .delete()
    .eq("recipe_id", recipeId);
    
  if (error) {
    console.error("Error removing recipe from cache:", error);
    return null;
  }
  
  return data;
}
