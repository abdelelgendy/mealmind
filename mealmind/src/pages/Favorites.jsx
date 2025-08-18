import { useState, useEffect } from "react";
import { removeFromFavorites, saveMealPlan, supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { usePlan } from "../plan/PlanContext";
import RecipeCard from "../components/RecipeCard";
import { saveRecipeToCache } from "../lib/recipes";

/**
 * Favorites page component to display user's saved recipes
 */
export default function Favorites() {
  const { user, favorites, setFavorites, loading } = useAuth();
  const { setCell } = usePlan();
  const [error, setError] = useState(null);
  
  // Supabase Realtime subscription for favorites changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('public:favorites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        payload => {
          console.log("Favorite change:", payload);

          if (payload.eventType === "INSERT") {
            setFavorites(prev => [...prev, payload.new]);
          }
          if (payload.eventType === "DELETE") {
            setFavorites(prev => prev.filter(f => f.recipe_id !== payload.old.recipe_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setFavorites]);

  // Handle favorite toggling (removal in this case)
  const handleFavoriteToggle = async (recipe, isFavorite) => {
    if (!isFavorite) {
      // Recipe was unfavorited, remove it from the list
      setFavorites(favorites.filter(fav => fav.recipe_id !== recipe.id));
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
      setCell(day, slot, { id: recipe.id, title: recipe.title });
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="page favorites-page">
        <h1>Favorites</h1>
        <div className="empty-state">
          <p>Please log in to see your favorite recipes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page favorites-page">
      <h1>Your Favorite Recipes</h1>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your favorite recipes...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button className="btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <h2>No favorites yet</h2>
          <p>Browse recipes and click the star icon to save your favorites!</p>
          <a href="/search" className="btn">
            Find Recipes
          </a>
        </div>
      ) : (
        <div className="recipe-grid">
          {favorites.map(favorite => (
            <RecipeCard
              key={favorite.recipe_id}
              recipe={{
                id: favorite.recipe_id,
                title: favorite.title,
                image: favorite.image
              }}
              favorites={favorites}
              onFavoriteToggle={handleFavoriteToggle}
              onAddToPlan={addToPlan}
            />
          ))}
        </div>
      )}
    </div>
  );
}
