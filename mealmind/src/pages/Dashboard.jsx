import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePlan } from "../plan/PlanContext";
import RecipeCard from "../components/RecipeCard";
import { saveMealPlan } from "../lib/supabase";
import { saveRecipeToCache } from "../lib/recipes";

export default function Dashboard() {
  const { user, profile, pantry, mealPlan, loading, favorites, setFavorites } = useAuth();
  const { DAYS, setCell } = usePlan();
  
  // Count meals planned for the week
  const mealCount = mealPlan?.length || 0;
  
  // Count pantry items
  const pantryCount = pantry?.length || 0;
  
  // Count favorites
  const favoritesCount = favorites?.length || 0;
  
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
  
  // Get username for personalization
  const username = profile?.username || user?.email?.split('@')[0] || "there";

  if (loading) {
    return (
      <section className="container">
        <h1>Loading your dashboard...</h1>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="dashboard-welcome">
        <h1>Welcome{user ? `, ${username}` : ""}!</h1>
        {user ? (
          <p>Manage your meal planning journey from here.</p>
        ) : (
          <p>
            <Link to="/signup">Sign up</Link> or <Link to="/login">log in</Link> to save your meal plans and pantry items.
          </p>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Meal Plan</h2>
          <p>You have {mealCount} meals planned for this week.</p>
          <Link to="/plan" className="btn">View Meal Plan</Link>
        </div>
        
        <div className="dashboard-card">
          <h2>Pantry</h2>
          <p>You have {pantryCount} items in your pantry.</p>
          <Link to="/pantry" className="btn">Manage Pantry</Link>
        </div>
        
        <div className="dashboard-card">
          <h2>Recipe Search</h2>
          <p>Find new recipes to add to your meal plan.</p>
          <Link to="/search" className="btn">Search Recipes</Link>
        </div>
        
        {user && (
          <div className="dashboard-card">
            <h2>Profile</h2>
            <p>Update your profile information.</p>
            <Link to="/profile" className="btn">Edit Profile</Link>
          </div>
        )}
      </div>
      
      {/* Favorite Recipes Section */}
      {user && favorites && favorites.length > 0 && (
        <div className="favorite-recipes-section">
          <div className="section-header">
            <h3>Your Favorite Recipes</h3>
            <Link to="/favorites" className="btn-link">See All ({favoritesCount})</Link>
          </div>
          
          <div className="favorite-recipes-grid">
            {favorites.slice(0, 4).map(favorite => (
              <RecipeCard
                key={favorite.recipe_id}
                recipe={{
                  id: favorite.recipe_id,
                  title: favorite.title,
                  image: favorite.image
                }}
                favorites={favorites}
                onFavoriteToggle={(recipe, isFavorite) => {
                  // Update local state to stay in sync
                  if (!isFavorite) {
                    setFavorites(prev => prev.filter(f => f.recipe_id !== recipe.id));
                  }
                }}
                onAddToPlan={addToPlan}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Quick start tips */}
      <div className="tips-section">
        <h3>Quick Tips</h3>
        <ul className="tips-list">
          <li>Add ingredients to your <Link to="/pantry">pantry</Link> to keep track of what you have on hand.</li>
          <li>Plan your meals for the week in the <Link to="/plan">meal plan</Link> section.</li>
          <li><Link to="/search">Search for recipes</Link> based on your pantry ingredients or preferences.</li>
          <li>Save your favorite recipes by clicking the heart icon, and find them in your <Link to="/favorites">favorites</Link>.</li>
        </ul>
      </div>
    </section>
  );
}
