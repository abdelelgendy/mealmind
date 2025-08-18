import { useState, useEffect } from "react";
import AddToPlanDialog from "./AddToPlanDialog";
import RecipeDetailsDialog from "./RecipeDetailsDialog";
import { useAuth } from "../contexts/AuthContext";
import { addToFavorites, removeFromFavorites } from "../lib/supabase";

export default function RecipeCard({ recipe, onAddToPlan, favorites = [], onFavoriteToggle }) {
  const { user } = useAuth();
  const [openPlan, setOpenPlan] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Check if this recipe is in favorites
  useEffect(() => {
    if (favorites && favorites.length) {
      const found = favorites.some(fav => fav.recipe_id === recipe.id);
      setIsFavorite(found);
    }
  }, [favorites, recipe.id]);

  // Handle add to plan button click
  const handleAddToPlan = () => {
    // Always show the dialog for choosing when/where to add the recipe
    setOpenPlan(true);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user) {
      alert("Please log in to save favorites");
      return;
    }
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(user.id, recipe.id);
      } else {
        await addToFavorites(user.id, recipe);
      }
      
      // Toggle local state
      setIsFavorite(!isFavorite);
      
      // Notify parent component if provided
      if (onFavoriteToggle) {
        onFavoriteToggle(recipe, !isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <article className="card recipe-card">
      <img className="recipe-img" src={recipe.image} alt={recipe.title} />
      <div className="favorite-btn-container">
        <button 
          className={`favorite-btn ${isFavorite ? 'favorite-active' : ''}`} 
          onClick={handleFavoriteToggle}
          disabled={favoriteLoading}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {favoriteLoading ? '•' : isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="card-body">
        <h3>{recipe.title}</h3>
        {recipe.calories && <p className="muted">{recipe.calories} kcal</p>}
        <div className="card-actions">
          <button className="btn" onClick={handleAddToPlan}>Add to Plan</button>
          <button className="btn-secondary" onClick={() => setOpenDetails(true)}>Details</button>
        </div>
      </div>

      <AddToPlanDialog 
        open={openPlan} 
        onClose={() => setOpenPlan(false)} 
        recipe={recipe}
        onAddToPlan={onAddToPlan} />
      <RecipeDetailsDialog open={openDetails} onClose={() => setOpenDetails(false)} recipeId={recipe.id} />
    </article>
  );
}
