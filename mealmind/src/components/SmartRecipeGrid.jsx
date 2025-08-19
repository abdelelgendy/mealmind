import SmartRecipeCard from "./SmartRecipeCard";

export default function SmartRecipeGrid({ 
  recipes = [], 
  onAddToPlan,
  favorites = [],
  onFavoriteToggle,
  showSubstitutions = false
}) {
  if (!recipes.length) return <p className="muted">No results yet.</p>;
  
  // Sort recipes by pantry compatibility (fully compatible first, then by % match)
  const sortedRecipes = [...recipes].sort((a, b) => {
    // First prioritize recipes with no allergens
    if (a.containsAllergens && !b.containsAllergens) return 1;
    if (!a.containsAllergens && b.containsAllergens) return -1;
    
    // Then prioritize recipes that match user diet
    if (!a.matchesUserDiet && b.matchesUserDiet) return 1;
    if (a.matchesUserDiet && !b.matchesUserDiet) return -1;
    
    // Then prioritize recipes that can be fully made with pantry
    if (a.pantryCompatible && !b.pantryCompatible) return -1;
    if (!a.pantryCompatible && b.pantryCompatible) return 1;
    
    // If both are partially compatible or both incompatible, sort by match percentage
    if (a.pantryMatchPercentage !== undefined && b.pantryMatchPercentage !== undefined) {
      return b.pantryMatchPercentage - a.pantryMatchPercentage;
    }
    
    // Default to original order
    return 0;
  });
  
  return (
    <div className="grid">
      {sortedRecipes.map(r => (
        <SmartRecipeCard 
          key={r.id} 
          recipe={r} 
          onAddToPlan={onAddToPlan}
          favorites={favorites}
          onFavoriteToggle={onFavoriteToggle}
          showSubstitutions={showSubstitutions}
        />
      ))}
    </div>
  );
}
