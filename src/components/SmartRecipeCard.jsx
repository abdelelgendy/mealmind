import { useState, useEffect } from "react";
import AddToPlanDialog from "./AddToPlanDialog";
import RecipeDetailsDialog from "./RecipeDetailsDialog";
import IngredientsSubstitutions from "./IngredientsSubstitutions";
import { useAuth } from "../contexts/AuthContext";
import { addToFavorites, removeFromFavorites } from "../lib/supabase";

export default function SmartRecipeCard({ recipe, onAddToPlan, favorites = [], onFavoriteToggle, showSubstitutions = false }) {
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
      
      // Notify parent component
      if (onFavoriteToggle) {
        onFavoriteToggle(recipe, !isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Show user-friendly error message
      if (error.message === "Database not available") {
        alert("Favorites feature requires database connection. Please check your settings.");
      } else {
        alert("Failed to update favorites. Please try again.");
      }
    } finally {
      setFavoriteLoading(false);
    }
  };
  
  // Determine styling based on pantry compatibility
  const getPantryCompatibilityClass = () => {
    if (!recipe.pantryMatchPercentage && recipe.pantryMatchPercentage !== 0) {
      return "";
    }
    
    if (recipe.pantryCompatible) {
      return "pantry-full";
    } else if (recipe.pantryMatchPercentage >= 50) {
      return "pantry-partial";
    } else {
      return "pantry-missing";
    }
  };
  
  // Get calorie badge class
  const getCalorieBadgeClass = () => {
    if (!recipe.withinCalorieTarget && recipe.calorieTargetDiff !== undefined) {
      return "calorie-exceeded";
    }
    return "";
  };

  return (
    <article className={`card recipe-card ${getPantryCompatibilityClass()}`}>
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
        
        {/* Calorie information with badge if needed */}
        {recipe.calories && (
          <p className={`calories ${getCalorieBadgeClass()}`}>
            {recipe.calories} kcal
            {!recipe.withinCalorieTarget && recipe.calorieTargetDiff !== undefined && recipe.calorieTargetDiff > 0 && (
              <span className="calorie-diff">(+{Math.round(recipe.calorieTargetDiff)})</span>
            )}
          </p>
        )}
        
        {/* Compatibility badges */}
        <div className="compatibility-badges">
          {recipe.pantryCompatible && (
            <span className="badge pantry-badge" title="You have all the ingredients!">
              ✅ Can make now!
            </span>
          )}
          
          {!recipe.pantryCompatible && recipe.pantryMatchPercentage !== undefined && recipe.missingIngredients && (
            <span className="badge missing-badge" title="Missing some ingredients">
              ⚠️ Missing {recipe.missingIngredients.length} ingredients ({100 - recipe.pantryMatchPercentage}%)
            </span>
          )}
          
          {recipe.containsAllergens && (
            <span className="badge allergen-badge" title="Contains allergens from your preferences">
              ⚠️ Contains allergens
            </span>
          )}
          
          {!recipe.matchesUserDiet && (
            <span className="badge diet-badge" title="Doesn't match your diet preference">
              ⚠️ Outside diet
            </span>
          )}
        </div>
        
        <div className="card-actions">
          <button className="btn" onClick={handleAddToPlan}>Add to Plan</button>
          <button className="btn-secondary" onClick={() => setOpenDetails(true)}>Details</button>
        </div>
        
        {/* Show ingredient substitutions if requested */}
        {showSubstitutions && recipe.ingredients && recipe.ingredients.length > 0 && (
          <IngredientsSubstitutions ingredients={recipe.ingredients} />
        )}
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
