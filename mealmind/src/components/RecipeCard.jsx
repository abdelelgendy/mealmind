import React, { useState, useEffect, memo } from "react";
import AddToPlanDialog from "./AddToPlanDialog";
import RecipeDetailsDialog from "./RecipeDetailsDialog";
import { useAuth } from "../contexts/AuthContext";
import { addToFavorites, removeFromFavorites } from "../lib/supabase";
import { formatDuration } from "../utils/helpers";

function RecipeCard({ recipe, onAddToPlan, favorites = [], onFavoriteToggle }) {
  const { user } = useAuth();
  const [openPlan, setOpenPlan] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addingToPlan, setAddingToPlan] = useState(false);

  // Check if this recipe is in favorites
  useEffect(() => {
    if (favorites && favorites.length) {
      const found = favorites.some(fav => fav.recipe_id === recipe.id);
      setIsFavorite(found);
    }
  }, [favorites, recipe.id]);

  // Handle add to plan button click
  const handleAddToPlan = () => {
    setAddingToPlan(true);
    setOpenPlan(true);
    // Reset loading state when dialog closes
    setTimeout(() => setAddingToPlan(false), 300);
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
      
      setIsFavorite(!isFavorite);
      
      if (onFavoriteToggle) {
        onFavoriteToggle(recipe, !isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorites");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  return (
    <>
      <article className="recipe-card card card--interactive fade-in">
        <div className="recipe-card__image-container">
          {!imageLoaded && !imageError && (
            <div className="recipe-card__image-skeleton skeleton"></div>
          )}
          
          {imageError ? (
            <div className="recipe-card__image-placeholder">
              <span className="recipe-card__image-icon">🍽️</span>
              <span className="text-sm text-muted">No image available</span>
            </div>
          ) : (
            <img
              src={recipe.image || '/placeholder-recipe.jpg'}
              alt={recipe.title}
              className={`recipe-card__image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
          
          <button
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            className={`recipe-card__favorite-btn ${isFavorite ? 'active' : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favoriteLoading ? (
              <div className="loading-spinner loading-spinner--sm"></div>
            ) : (
              <span className="recipe-card__favorite-icon">
                {isFavorite ? '❤️' : '🤍'}
              </span>
            )}
          </button>
        </div>

        <div className="card__body">
          <h3 className="recipe-card__title card__title">{recipe.title}</h3>
          
          <div className="recipe-card__meta">
            {recipe.readyInMinutes && (
              <span className="recipe-card__time badge badge--primary">
                ⏱️ {formatDuration(recipe.readyInMinutes)}
              </span>
            )}
            
            {recipe.servings && (
              <span className="recipe-card__servings badge badge--info">
                👥 {recipe.servings} servings
              </span>
            )}
            
            {recipe.healthScore && (
              <span className="recipe-card__health badge badge--success">
                💚 {recipe.healthScore}% healthy
              </span>
            )}
          </div>

          {recipe.summary && (
            <p className="recipe-card__summary card__description">
              {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 120)}...
            </p>
          )}
        </div>

        <div className="card__footer">
          <div className="recipe-card__actions">
            <button
              onClick={() => setOpenDetails(true)}
              className="btn btn--outline btn--sm"
            >
              View Details
            </button>
            
            <button
              onClick={handleAddToPlan}
              className={`btn btn--primary btn--sm ${addingToPlan ? 'btn--loading' : ''}`}
              disabled={addingToPlan}
            >
              {addingToPlan ? '' : 'Add to Plan'}
            </button>
          </div>
        </div>
      </article>

      {openPlan && (
        <AddToPlanDialog
          open={openPlan}
          recipe={recipe}
          onClose={() => setOpenPlan(false)}
          onAddToPlan={onAddToPlan}
        />
      )}

      {openDetails && (
        <RecipeDetailsDialog
          open={openDetails}
          recipe={recipe}
          onClose={() => setOpenDetails(false)}
          onAddToPlan={handleAddToPlan}
          recipeId={recipe.id}
        />
      )}
    </>
  );
}

export default memo(RecipeCard);
