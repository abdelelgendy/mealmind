import { useEffect, useRef, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import { searchRecipes, saveRecipeToCache } from "../lib/recipes";
import { usePlan } from "../plan/PlanContext";
import { useAuth } from "../contexts/AuthContext";
import { saveMealPlan } from "../lib/supabase";

export default function Search() {
  const { setCell } = usePlan(); // we need to update Plan when adding recipe
  const { user } = useAuth(); // Get the current user for Supabase operations
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [maxCals, setMaxCals] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("featured"); // idle | loading | error | success | featured
  const [error, setError] = useState(null);
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  
  // debounce
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Load featured recipes on page load
  useEffect(() => {
    async function loadFeatured() {
      try {
        setStatus("loading");
        const featured = await searchRecipes({
          query: "popular", 
          number: 8
        });
        setFeaturedRecipes(featured);
        setStatus("featured");
      } catch (err) {
        console.error("Failed to load featured recipes:", err);
        // Still show as featured state, but with empty results
        setStatus("featured");
      }
    }
    loadFeatured();
  }, []);

  // abortable fetch when inputs change
  const abortRef = useRef();
  useEffect(() => {
    // avoid empty searches
    if (!debounced && !diet && !maxCals) {
      setResults([]);
      if (featuredRecipes.length) {
        setStatus("featured");
      } else {
        setStatus("idle");
      }
      setError(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    async function run() {
      try {
        setStatus("loading");
        setError(null);
        const data = await searchRecipes({
          query: debounced,
          diet,
          maxCalories: maxCals || undefined,
          number: 24,
          signal: ctrl.signal
        });

        // if maxCals provided, also filter client-side as a safety net
        const filtered = maxCals
          ? data.filter(r => !r.calories || r.calories <= Number(maxCals))
          : data;

        setResults(filtered);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") return;
        setStatus("error");
        setError(err.message || "Search failed");
      }
    }
    run();

    return () => ctrl.abort();
  }, [debounced, diet, maxCals]);

  // Handle quick searches
  const quickSearch = (term, dietType = "") => {
    setQuery(term);
    setDebounced(term);
    if (dietType) {
      setDiet(dietType);
    }
  };

  // Handle adding recipes to plan
  const addToPlan = async (recipe, day, slot) => {
    try {
      // First save the recipe to Supabase cache
      await saveRecipeToCache(recipe);
      
      // If user is logged in, save to their meal plan in Supabase
      if (user) {
        const recipeData = { 
          id: recipe.id, 
          title: recipe.title
        };
        
        await saveMealPlan(user.id, day, slot, recipeData);
        console.log(`Recipe added to ${day} ${slot} for user ${user.id}`);
      }
      
      // Always update the local plan context
      setCell(day, slot, { id: recipe.id, title: recipe.title });
      
      return true;
    } catch (error) {
      console.error("Failed to add recipe to plan:", error);
      // Even if the Supabase operation fails, update the local plan
      // so the UI is responsive
      setCell(day, slot, { id: recipe.id, title: recipe.title, image: recipe.image });
      throw error; // Re-throw the error to be caught by the AddToPlanDialog
    }
  };

  return (
    <section className="container">
      <h1>Search Recipes</h1>

      <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., salmon, high-protein…"
        />
        <button className="btn" onClick={() => setDebounced(query)}>Search</button>
      </form>

      <div className="filters">
        <label>
          <span className="muted">Diet</span>
          <select 
            value={diet} 
            onChange={(e) => {
              const newDiet = e.target.value;
              setDiet(newDiet);
              // Trigger search if we have a query or if a diet is selected
              if (query || newDiet) {
                setDebounced(query); // This will trigger a search with the new diet value
              }
            }}
          >
            <option value="">Any</option>
            <option value="ketogenic">Keto</option>
            <option value="low carb">Low Carb</option>
            <option value="high protein">High Protein</option>
            <option value="low fat">Low Fat</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="paleo">Paleo</option>
            <option value="primal">Primal</option>
            <option value="whole30">Whole30</option>
            <option value="pescetarian">Pescetarian</option>
            <option value="gluten free">Gluten Free</option>
            <option value="dairy free">Dairy Free</option>
          </select>
        </label>
        <label>
          <span className="muted">Max calories</span>
          <input
            type="number"
            min="0"
            placeholder="e.g., 600"
            value={maxCals}
            onChange={(e)=>setMaxCals(e.target.value)}
            onBlur={() => {
              // Trigger search when user finishes typing calories
              if (query || diet || maxCals) {
                setDebounced(query);
              }
            }}
          />
        </label>
      </div>
      
      <div className="quick-searches">
        <p className="muted">Quick Searches:</p>
        <div className="quick-search-buttons">
          <button className="btn-tag" onClick={() => quickSearch("breakfast")}>Breakfast</button>
          <button className="btn-tag" onClick={() => quickSearch("lunch")}>Lunch</button>
          <button className="btn-tag" onClick={() => quickSearch("dinner")}>Dinner</button>
          <button className="btn-tag" onClick={() => quickSearch("chicken", "high protein")}>High Protein Chicken</button>
          <button className="btn-tag" onClick={() => quickSearch("salad", "low carb")}>Low Carb Salad</button>
          <button className="btn-tag" onClick={() => quickSearch("pasta", "vegetarian")}>Vegetarian Pasta</button>
          <button className="btn-tag" onClick={() => quickSearch("fish", "pescetarian")}>Pescetarian Fish</button>
          <button className="btn-tag" onClick={() => quickSearch("snack", "gluten free")}>Gluten-Free Snack</button>
        </div>
      </div>

      {status === "idle" && <p className="muted">Type a query to search recipes.</p>}
      {status === "loading" && <p className="muted">Searching…</p>}
      {status === "error" && <p className="muted" style={{ color: "#b91c1c" }}>{error}</p>}
      {status === "success" && <RecipeGrid recipes={results} onAddToPlan={addToPlan} />}
      {status === "featured" && (
        <>
          <h2 className="section-title">Featured Recipes</h2>
          {featuredRecipes.length > 0 ? (
            <RecipeGrid recipes={featuredRecipes} onAddToPlan={addToPlan} />
          ) : (
            <p className="muted">Try one of the quick searches above to discover recipes.</p>
          )}
        </>
      )}
    </section>
  );
}
