import React, { useState, useEffect, memo } from "react";
import AddToPlanDialog from "./AddToPlanDialog";
import RecipeDetailsDialog from "./RecipeDetailsDialog";
import { useAuth } from "../contexts/AuthContext";
import { addToFavorites, removeFromFavorites } from "../lib/supabase";
import { formatDuration } from "../utils/helpers";

const RecipeCard = memo(function RecipeCard({ recipe, onAddToPlan, favorites = [], onFavoriteToggle }) {
  const { user } = useAuth();
  const [openPlan, setOpenPlan] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if this recipe is in favorites
  useEffect(() => {
    const found = favorites?.some(fav => fav.recipe_id === recipe.id) || false;
    setIsFavorite(found);
  }, [favorites, recipe.id]);

  const handleAddToPlan = () => setOpenPlan(true);

  const handleFavoriteToggle = async () => {
    if (!user || favoriteLoading) return;
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(user.id, recipe.id);
      } else {
        await addToFavorites(user.id, recipe.id, recipe);
      }
      
      if (onFavoriteToggle) {
        onFavoriteToggle(recipe, isFavorite);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const getImageSrc = () => {
    if (imageError) return "/placeholder-recipe.jpg";
    return recipe.image || recipe.image_url || "/placeholder-recipe.jpg";
  };

  const renderBadges = () => (
    <div className="recipe-badges">
      {recipe.vegetarian && <span className="badge badge--vegetarian">🌱 Vegetarian</span>}
      {recipe.vegan && <span className="badge badge--vegan">🌿 Vegan</span>}
      {recipe.glutenFree && <span className="badge badge--gluten-free">🌾 Gluten Free</span>}
      {recipe.dairyFree && <span className="badge badge--dairy-free">🥛 Dairy Free</span>}
    </div>
  );

  const renderStats = () => (
    <div className="recipe-stats">
      {recipe.readyInMinutes && (
        <span className="stat">
          <span className="stat-icon">⏱️</span>
          {formatDuration(recipe.readyInMinutes)}
        </span>
      )}
      {recipe.servings && (
        <span className="stat">
          <span className="stat-icon">👥</span>
          {recipe.servings} servings
        </span>
      )}
      {recipe.healthScore && (
        <span className="stat">
          <span className="stat-icon">❤️</span>
          {recipe.healthScore}% healthy
        </span>
      )}
    </div>
  );

  return (
    <>
      <div className="recipe-card card">
        <div className="recipe-image-container">
          <img
            src={getImageSrc()}
            alt={recipe.title}
            className={`recipe-image ${imageLoaded ? 'loaded' : ''}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          <button
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading || !user}
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favoriteLoading ? '⏳' : (isFavorite ? '❤️' : '🤍')}
          </button>
        </div>

        <div className="recipe-content">
          <h3 className="recipe-title">{recipe.title}</h3>
          
          {renderBadges()}
          {renderStats()}

          <div className="recipe-actions">
            <button
              onClick={() => setOpenDetails(true)}
              className="btn btn--secondary"
            >
              View Details
            </button>
            
            <button
              onClick={handleAddToPlan}
              className="btn"
              disabled={!user}
            >
              Add to Plan
            </button>
          </div>
        </div>
      </div>

      {openPlan && (
        <AddToPlanDialog
          recipe={recipe}
          open={openPlan}
          onClose={() => setOpenPlan(false)}
          onAddToPlan={onAddToPlan}
        />
      )}

      {openDetails && (
        <RecipeDetailsDialog
          recipe={recipe}
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          onAddToPlan={handleAddToPlan}
          favorites={favorites}
          onFavoriteToggle={onFavoriteToggle}
        />
      )}
    </>
  );
});

export default RecipeCard;
