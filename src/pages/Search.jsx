import { useEffect, useRef, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import SmartRecipeGrid from "../components/SmartRecipeGrid";
import RecipeQuickSelect from "../components/RecipeQuickSelect";
import { searchRecipes, saveRecipeToCache, getRecipeById } from "../lib/recipes";
import { usePlan } from "../plan/PlanContext";
import { useAuth } from "../contexts/AuthContext";
import { saveMealPlan } from "../lib/supabase";
import { useSmartFiltering } from "../hooks/useSmartFiltering";

export default function Search() {
  const { setCell } = usePlan();
  const { user, profile, favorites, setFavorites, pantry } = useAuth();
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [maxCals, setMaxCals] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("featured");
  const [error, setError] = useState(null);
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [usePreferences, setUsePreferences] = useState(true);
  const [enableSmartFiltering, setEnableSmartFiltering] = useState(true);
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  
  const [filterOptions, setFilterOptions] = useState({
    enablePantryFiltering: true,
    enableDietaryFiltering: true,
    enableCalorieFiltering: true
  });
  
  // Debounce query changes
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 400);
    return () => clearTimeout(t);
  }, [query]);
  
  // Trigger search when diet or maxCals change
  const [searchTrigger, setSearchTrigger] = useState(0);
  useEffect(() => {
    setSearchTrigger(prev => prev + 1);
  }, [diet, maxCals]);

  // Load featured recipes and apply user preferences
  useEffect(() => {
    async function loadData() {
      try {
        setStatus("loading");
        
        const featured = await searchRecipes({
          query: "popular", 
          number: 8
        });
        setFeaturedRecipes(featured);
        
        // Apply user preferences if available
        if (profile?.preferences && usePreferences) {
          const { diet: userDiet, calories } = profile.preferences;
          if (userDiet) setDiet(userDiet);
          if (calories) setMaxCals(calories);
        }
        
        setStatus("featured");
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setStatus("featured");
      }
    }
    loadData();
  }, [user, profile, usePreferences]);

  // Search functionality with abort controller
  const abortRef = useRef();
  useEffect(() => {
    if (!debounced && !diet && !maxCals) {
      setResults([]);
      setStatus(featuredRecipes.length ? "featured" : "idle");
      setError(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    async function performSearch() {
      try {
        setStatus("loading");
        setError(null);

        const params = {
          query: debounced || undefined,
          diet: diet || undefined,
          maxCalories: maxCals ? parseInt(maxCals) : undefined,
          addRecipeNutrition: maxCals ? true : undefined,
          number: 20
        };

        const searchResults = await searchRecipes(params);
        
        if (ctrl.signal.aborted) return;

        if (Array.isArray(searchResults) && searchResults.length > 0) {
          setResults(searchResults);
          setStatus("success");
        } else {
          setResults([]);
          setStatus("error");
          setError("No recipes found matching your criteria");
        }
      } catch (err) {
        if (ctrl.signal.aborted) return;
        console.error("Search error:", err);
        setStatus("error");
        setError(err.message || "Failed to search recipes");
        setResults([]);
      }
    }

    performSearch();
    return () => ctrl.abort();
  }, [debounced, diet, maxCals, searchTrigger, featuredRecipes.length]);

  // Smart filtering hook
  const {
    filteredResults,
    filterStats,
    isFiltering,
    applyFilters,
    resetFilters,
    updateFilterOptions
  } = useSmartFiltering({
    recipes: results,
    userPantry: pantry || [],
    userProfile: profile,
    enabled: enableSmartFiltering && status === "success",
    filterOptions
  });

  // Recipe actions
  const handleAddToPlan = async (recipe, dayIndex, slotIndex) => {
    try {
      await saveRecipeToCache(recipe);
      setCell(dayIndex, slotIndex, recipe);
      
      if (user) {
        const planData = { dayIndex, slotIndex, recipe };
        await saveMealPlan(user.id, planData);
      }
    } catch (error) {
      console.error("Failed to add recipe to plan:", error);
    }
  };

  const handleFavoriteToggle = async (recipe, isFavorite) => {
    try {
      const updatedFavorites = isFavorite
        ? favorites.filter(fav => fav.recipe_id !== recipe.id)
        : [...favorites, { recipe_id: recipe.id, recipe_data: recipe }];
      
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const currentRecipes = enableSmartFiltering && status === "success" 
    ? (Array.isArray(filteredResults) ? filteredResults : [])
    : (status === "success" ? results : featuredRecipes);

  const currentStatus = enableSmartFiltering && status === "success" && isFiltering
    ? "loading" : status;

  return (
    <div className="page">
      <div className="container">
        <div className="search-header">
          <h1>Search Recipes</h1>
          
          <div className="search-controls grid grid-3 gap-md">
            <input
              type="text"
              placeholder="Search recipes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input"
            />
            
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="input select"
            >
              <option value="">Any Diet</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten Free</option>
              <option value="ketogenic">Keto</option>
              <option value="paleo">Paleo</option>
            </select>
            
            <input
              type="number"
              placeholder="Max calories"
              value={maxCals}
              onChange={(e) => setMaxCals(e.target.value)}
              className="input"
              min="0"
              max="2000"
            />
          </div>

          <div className="search-options flex gap-md">
            <label className="flex items-center gap-sm">
              <input
                type="checkbox"
                checked={usePreferences}
                onChange={(e) => setUsePreferences(e.target.checked)}
              />
              Use my preferences
            </label>
            
            <label className="flex items-center gap-sm">
              <input
                type="checkbox"
                checked={enableSmartFiltering}
                onChange={(e) => setEnableSmartFiltering(e.target.checked)}
              />
              Smart filtering
            </label>
            
            <label className="flex items-center gap-sm">
              <input
                type="checkbox"
                checked={showSubstitutions}
                onChange={(e) => setShowSubstitutions(e.target.checked)}
              />
              Show substitutions
            </label>
          </div>

          {enableSmartFiltering && status === "success" && (
            <div className="smart-filter-controls">
              <h3>Smart Filtering Options</h3>
              <div className="filter-options flex gap-md">
                <label className="flex items-center gap-sm">
                  <input
                    type="checkbox"
                    checked={filterOptions.enablePantryFiltering}
                    onChange={(e) => updateFilterOptions({
                      ...filterOptions,
                      enablePantryFiltering: e.target.checked
                    })}
                  />
                  Pantry-based filtering
                </label>
                
                <label className="flex items-center gap-sm">
                  <input
                    type="checkbox"
                    checked={filterOptions.enableDietaryFiltering}
                    onChange={(e) => updateFilterOptions({
                      ...filterOptions,
                      enableDietaryFiltering: e.target.checked
                    })}
                  />
                  Dietary filtering
                </label>
                
                <label className="flex items-center gap-sm">
                  <input
                    type="checkbox"
                    checked={filterOptions.enableCalorieFiltering}
                    onChange={(e) => updateFilterOptions({
                      ...filterOptions,
                      enableCalorieFiltering: e.target.checked
                    })}
                  />
                  Calorie filtering
                </label>
              </div>
              
              {filterStats && (
                <div className="filter-stats">
                  <p>Showing {filterStats.filtered} of {filterStats.total} recipes</p>
                  {filterStats.filtered < filterStats.total && (
                    <button onClick={resetFilters} className="btn btn--secondary">
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <RecipeQuickSelect onQuickSelect={setQuery} />

        <div className="search-results">
          {currentStatus === "loading" && (
            <div className="loading-container flex justify-center">
              <div className="loading-spinner"></div>
            </div>
          )}

          {currentStatus === "error" && (
            <div className="error-container">
              <p>{error}</p>
              <button className="btn" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {currentStatus === "featured" && (
            <div>
              <h2>Featured Recipes</h2>
              {enableSmartFiltering ? (
                <SmartRecipeGrid
                  recipes={currentRecipes}
                  onAddToPlan={handleAddToPlan}
                  favorites={favorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  showSubstitutions={showSubstitutions}
                />
              ) : (
                <RecipeGrid
                  recipes={currentRecipes}
                  onAddToPlan={handleAddToPlan}
                  favorites={favorites}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              )}
            </div>
          )}

          {currentStatus === "success" && (
            <div>
              <h2>Search Results ({currentRecipes.length})</h2>
              {enableSmartFiltering ? (
                <SmartRecipeGrid
                  recipes={currentRecipes}
                  onAddToPlan={handleAddToPlan}
                  favorites={favorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  showSubstitutions={showSubstitutions}
                />
              ) : (
                <RecipeGrid
                  recipes={currentRecipes}
                  onAddToPlan={handleAddToPlan}
                  favorites={favorites}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
