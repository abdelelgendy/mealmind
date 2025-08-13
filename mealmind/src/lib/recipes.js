import { supabase } from "./supabase";

const API = 'https://api.spoonacular.com';

const KEY = import.meta.env.VITE_SPOONACULAR_KEY;

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
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Recipe ${id} failed: ${res.status}`);
  const r = await res.json();
  const normalized = {
    id: r.id,
    title: r.title,
    image: r.image,
    calories: r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || null,
    ingredients: (r.extendedIngredients || []).map(i => ({
      name: i.name,
      amount: i.amount,
      unit: i.unit
    })),
    instructions: r.analyzedInstructions?.[0]?.steps?.map(s => s.step) || []
  };
  memory.set(url, normalized);
  return normalized;
}

export async function saveRecipeToCache(recipe) {
  const { data, error } = await supabase
    .from("recipes_cache")
    .upsert([{ recipe_id: recipe.id, title: recipe.title, image: recipe.image, calories: recipe.calories, ingredients: recipe.ingredients, instructions: recipe.instructions }])
    .select();

  if (error) {
    console.error("Error saving recipe:", error);
    return null;
  }
  return data;
}

export async function getCachedRecipeById(id) {
  const { data, error } = await supabase
    .from("recipes_cache")
    .select("*")
    .eq("recipe_id", id)
    .single();

  if (error) {
    console.error("Error fetching cached recipe:", error);
    return null;
  }
  return data;
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
  if (!recipeId) return null;
  
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
