import { supabase } from "./supabase";

const API = 'https://api.spoonacular.com';

const KEY = import.meta.env.VITE_SPOONACULAR_KEY || import.meta.env.VITE_SPOONACULAR_API_KEY;

// simple in-memory cache to avoid duplicate calls during the session
const memory = new Map();

function qs(params) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') u.set(k, v);
  });
  return u.toString();
}

export async function searchRecipes({ query, maxCalories, diet, number = 20, signal }) {
  if (!KEY) {
    console.warn("Spoonacular API key not found - returning mock data");
    return getMockRecipes();
  }
  
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
}

export async function getRecipeById(id, { signal } = {}) {
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
    throw error;
  }
  return normalized;
}

export async function saveRecipeToCache(recipe) {
  if (!recipe || !recipe.id) {
    console.error("Invalid recipe data for caching:", recipe);
    throw new Error("Invalid recipe data for caching");
  }
  
  try {
    console.log(`Caching recipe ${recipe.id}: ${recipe.title}`);
    
    // Prepare full recipe data for caching
    const recipeData = {
      recipe_id: recipe.id,
      title: recipe.title || "Untitled Recipe",
      image: recipe.image || null,
      calories: recipe.calories || null,
      servings: recipe.servings || 1,
      ready_in_minutes: recipe.readyInMinutes || null,
      prep_time: recipe.prepTime || null,
      cook_time: recipe.cookTime || null,
      source_url: recipe.sourceUrl || null,
      source_name: recipe.sourceName || null,
      dish_types: recipe.dishTypes || [],
      diets: recipe.diets || [],
      nutrients: recipe.nutrients || [],
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      cached_at: new Date().toISOString()
    };
    
    // Check if recipe is already in cache
    const { data: existingData, error: existingError } = await supabase
      .from("recipes_cache")
      .select("recipe_id, cached_at")
      .eq("recipe_id", recipe.id)
      .maybeSingle();
    
    if (existingData) {
      console.log(`Recipe ${recipe.id} already in cache, updating with new data`);
      // Update existing recipe if it's older than 7 days
      const cachedAt = new Date(existingData.cached_at);
      const now = new Date();
      const diffDays = Math.floor((now - cachedAt) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        console.log(`Recipe was cached less than 7 days ago (${diffDays} days), not updating`);
        return [existingData];
      }
    }
    
    // Proceed with upsert
    const { data, error } = await supabase
      .from("recipes_cache")
      .upsert([recipeData], {
        onConflict: 'recipe_id',
        returning: 'representation'
      })
      .select();

    if (error) {
      console.error("Error in saveRecipeToCache Supabase operation:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.warn("No data returned from saveRecipeToCache operation");
      
      // Double-check if the recipe exists in cache (as a fallback)
      const { data: checkData, error: checkError } = await supabase
        .from("recipes_cache")
        .select("*")
        .eq("recipe_id", recipe.id)
        .single();
        
      if (checkError) {
        console.error("Error in fallback recipe cache check:", checkError);
        throw new Error("Failed to confirm recipe cache");
      }
      
      if (checkData) {
        console.log("Recipe found in cache in fallback check:", checkData);
        return [checkData]; // Return in same format as upsert
      } else {
        throw new Error("Could not cache recipe");
      }
    }
    
    console.log(`Recipe ${recipe.id} successfully cached`);
    return data;
  } catch (error) {
    console.error("Exception in saveRecipeToCache:", error.message);
    throw error;
  }
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
        instructions: data.instructions || [],
        cachedAt: data.cached_at
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

// Mock data for development when API keys are not available
function getMockRecipes() {
  return [
    {
      id: 1,
      title: "Mock Grilled Chicken",
      image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400",
      calories: 350,
      readyInMinutes: 25,
      ingredients: [
        { name: "chicken breast", amount: 1, unit: "piece" },
        { name: "olive oil", amount: 2, unit: "tbsp" },
        { name: "salt", amount: 1, unit: "tsp" }
      ]
    },
    {
      id: 2,
      title: "Mock Vegetable Salad",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400",
      calories: 180,
      readyInMinutes: 10,
      ingredients: [
        { name: "lettuce", amount: 2, unit: "cups" },
        { name: "tomatoes", amount: 1, unit: "cup" },
        { name: "cucumber", amount: 1, unit: "medium" }
      ]
    }
  ];
}
