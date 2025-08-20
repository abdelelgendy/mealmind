import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePlan } from "../plan/PlanContext";
import RecipeCard from "../components/RecipeCard";
import { PageLoading, EmptyState } from "../components/Loading";
import { saveMealPlan, supabase } from "../lib/supabase";
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
  
  // Get recent favorites (last 3)
  const recentFavorites = favorites?.slice(-3) || [];
  
  // Supabase Realtime subscription for favorites changes
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase.channel('public:dashboard_favorites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        payload => {
          console.log("Dashboard: Favorite change:", payload);

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
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user, setFavorites]);

  const handleAddToPlan = async (recipe, day, slot) => {
    try {
      // Save recipe to cache first
      await saveRecipeToCache(recipe);
      
      // Add to local state
      setCell(day, slot, recipe);
      
      // Save to database if user is logged in
      if (user) {
        await saveMealPlan(user.id, day, slot, recipe);
      }
    } catch (error) {
      console.error("Error adding recipe to plan:", error);
      alert("Failed to add recipe to meal plan");
    }
  };

  // Get username for personalization
  const username = profile?.username || user?.email?.split('@')[0] || "there";

  if (loading) {
    return <PageLoading message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard fade-in">
      {/* Welcome Section */}
      <section className="dashboard__welcome">
        <div className="dashboard__welcome-content">
          <h1 className="dashboard__title">
            Welcome back{user ? `, ${username}` : ''}! 👋
          </h1>
          <p className="dashboard__subtitle text-secondary">
            Ready to plan some delicious meals? Let's make cooking easier and more enjoyable.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="dashboard__stats">
        <div className="grid grid--responsive">
          <div className="card dashboard__stat-card">
            <div className="card__body flex flex--between">
              <div>
                <h3 className="dashboard__stat-title">Meals Planned</h3>
                <p className="dashboard__stat-number">{mealCount}</p>
                <p className="dashboard__stat-description text-muted">
                  {mealCount === 0 ? 'Start planning your week!' : 'Keep up the good work!'}
                </p>
              </div>
              <div className="dashboard__stat-icon">📅</div>
            </div>
            <div className="card__footer">
              <Link to="/plan" className="btn btn--outline btn--sm btn--full">
                View Meal Plan
              </Link>
            </div>
          </div>

          <div className="card dashboard__stat-card">
            <div className="card__body flex flex--between">
              <div>
                <h3 className="dashboard__stat-title">Pantry Items</h3>
                <p className="dashboard__stat-number">{pantryCount}</p>
                <p className="dashboard__stat-description text-muted">
                  {pantryCount === 0 ? 'Add items to get started' : 'Items ready to cook with'}
                </p>
              </div>
              <div className="dashboard__stat-icon">🥫</div>
            </div>
            <div className="card__footer">
              <Link to="/pantry" className="btn btn--outline btn--sm btn--full">
                Manage Pantry
              </Link>
            </div>
          </div>

          <div className="card dashboard__stat-card">
            <div className="card__body flex flex--between">
              <div>
                <h3 className="dashboard__stat-title">Favorite Recipes</h3>
                <p className="dashboard__stat-number">{favoritesCount}</p>
                <p className="dashboard__stat-description text-muted">
                  {favoritesCount === 0 ? 'Save recipes you love' : 'Recipes you love'}
                </p>
              </div>
              <div className="dashboard__stat-icon">❤️</div>
            </div>
            <div className="card__footer">
              <Link to="/search" className="btn btn--outline btn--sm btn--full">
                Find Recipes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard__actions">
        <h2 className="dashboard__section-title">Quick Actions</h2>
        <div className="dashboard__action-grid grid grid--4">
          <Link to="/search" className="dashboard__action-card card card--interactive">
            <div className="card__body text-center">
              <div className="dashboard__action-icon">🔍</div>
              <h3 className="dashboard__action-title">Find Recipes</h3>
              <p className="dashboard__action-description text-muted">
                Discover new recipes based on your preferences
              </p>
            </div>
          </Link>

          <Link to="/plan" className="dashboard__action-card card card--interactive">
            <div className="card__body text-center">
              <div className="dashboard__action-icon">📋</div>
              <h3 className="dashboard__action-title">Plan Meals</h3>
              <p className="dashboard__action-description text-muted">
                Organize your weekly meal schedule
              </p>
            </div>
          </Link>

          <Link to="/pantry" className="dashboard__action-card card card--interactive">
            <div className="card__body text-center">
              <div className="dashboard__action-icon">🏪</div>
              <h3 className="dashboard__action-title">Update Pantry</h3>
              <p className="dashboard__action-description text-muted">
                Keep track of your ingredients
              </p>
            </div>
          </Link>

          <Link to="/preferences" className="dashboard__action-card card card--interactive">
            <div className="card__body text-center">
              <div className="dashboard__action-icon">⚙️</div>
              <h3 className="dashboard__action-title">Preferences</h3>
              <p className="dashboard__action-description text-muted">
                Customize your dietary preferences
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Favorites */}
      {recentFavorites.length > 0 && (
        <section className="dashboard__favorites">
          <div className="flex flex--between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="dashboard__section-title">Recent Favorites</h2>
            <Link to="/search?tab=favorites" className="btn btn--ghost btn--sm">
              View All →
            </Link>
          </div>
          
          <div className="recipes-grid">
            {recentFavorites.map(favorite => (
              <RecipeCard
                key={favorite.recipe_id}
                recipe={favorite.recipe_data}
                onAddToPlan={handleAddToPlan}
                favorites={favorites}
                onFavoriteToggle={(recipe, isFavorite) => {
                  if (!isFavorite) {
                    setFavorites(prev => prev.filter(f => f.recipe_id !== recipe.id));
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Tips & Getting Started */}
      <section className="dashboard__tips">
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">💡 Tips for Better Meal Planning</h2>
          </div>
          <div className="card__body">
            <div className="dashboard__tips-grid grid grid--2">
              <div className="dashboard__tip">
                <h4 className="dashboard__tip-title">🥗 Start with Ingredients</h4>
                <p className="dashboard__tip-description">
                  Add items to your pantry first, then find recipes that use what you already have.
                </p>
              </div>
              
              <div className="dashboard__tip">
                <h4 className="dashboard__tip-title">📅 Plan Ahead</h4>
                <p className="dashboard__tip-description">
                  Dedicate 10 minutes on Sunday to plan your meals for the week. Your future self will thank you!
                </p>
              </div>
              
              <div className="dashboard__tip">
                <h4 className="dashboard__tip-title">❤️ Save Favorites</h4>
                <p className="dashboard__tip-description">
                  Heart recipes you love to build your personal cookbook for quick access later.
                </p>
              </div>
              
              <div className="dashboard__tip">
                <h4 className="dashboard__tip-title">🎯 Set Preferences</h4>
                <p className="dashboard__tip-description">
                  Update your dietary preferences to get personalized recipe recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
