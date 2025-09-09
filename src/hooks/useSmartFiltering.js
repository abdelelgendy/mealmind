import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

// Smart filtering hook for recipe compatibility with user's pantry and preferences
export function useSmartFiltering(recipes, options = {}) {
  const { user, pantry = [], profile } = useAuth();
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Options with defaults
  const {
    enablePantryFiltering = true,
    enableDietaryFiltering = true,
    enableCalorieFiltering = true
  } = options;

  useEffect(() => {
    if (!recipes || recipes.length === 0) {
      setFilteredRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const enhancedRecipes = recipes.map(recipe => {
      // Start with the original recipe
      const enhancedRecipe = { ...recipe };
      
      // Default compatibility flags
      enhancedRecipe.pantryCompatible = false;
      enhancedRecipe.missingIngredients = [];
      enhancedRecipe.matchesUserDiet = true;
      enhancedRecipe.containsAllergens = false;
      enhancedRecipe.withinCalorieTarget = true;

      // Process pantry compatibility if enabled and we have pantry items (user or demo data)
      if (enablePantryFiltering && pantry && pantry.length > 0) {
        // Skip if recipe has no ingredients
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
          enhancedRecipe.pantryCompatible = false;
          enhancedRecipe.missingIngredients = [];
        } else {
          // Convert pantry items to lowercase for case-insensitive matching
          const pantryItems = pantry.map(item => item.name.toLowerCase());
          
          // Check each recipe ingredient against the pantry
          const missing = [];
          let matchCount = 0;
          
          recipe.ingredients.forEach(ingredient => {
            // Clean up ingredient name for better matching
            const ingredientName = ingredient.name.toLowerCase();
            
            // Check if any pantry item is part of this ingredient
            const hasIngredient = pantryItems.some(item => 
              ingredientName.includes(item) || item.includes(ingredientName)
            );
            
            if (hasIngredient) {
              matchCount++;
            } else {
              missing.push(ingredient.name);
            }
          });
          
          // Calculate pantry compatibility
          enhancedRecipe.pantryCompatible = missing.length === 0;
          enhancedRecipe.missingIngredients = missing;
          enhancedRecipe.pantryMatchPercentage = recipe.ingredients.length > 0 
            ? Math.round((matchCount / recipe.ingredients.length) * 100) 
            : 0;
        }
      }
      
      // Process dietary preferences if enabled and we have preferences (user or demo data)
      if (enableDietaryFiltering && profile && profile.preferences) {
        const preferences = profile.preferences;
        
        // Diet compatibility (vegetarian, vegan, gluten-free, etc)
        if (preferences.diet) {
          const userDiet = preferences.diet.toLowerCase();
          const recipeDiets = recipe.diets ? recipe.diets.map(d => d.toLowerCase()) : [];
          enhancedRecipe.matchesUserDiet = recipeDiets.includes(userDiet);
        }
        
        // Allergen check
        if (preferences.allergies) {
          const allergens = preferences.allergies.split(',').map(a => a.trim().toLowerCase());
          
          if (allergens.length > 0 && recipe.ingredients) {
            const hasAllergen = recipe.ingredients.some(ingredient => {
              const ingredientName = ingredient.name.toLowerCase();
              return allergens.some(allergen => ingredientName.includes(allergen));
            });
            
            enhancedRecipe.containsAllergens = hasAllergen;
          }
        }
      }
      
      // Process calorie targets if enabled and we have calorie preferences (user or demo data)
      if (enableCalorieFiltering && profile && profile.preferences) {
        const { calories } = profile.preferences;
        
        if (calories && recipe.calories) {
          // Allow 10% margin above target calories
          const calorieTarget = Number(calories);
          enhancedRecipe.withinCalorieTarget = recipe.calories <= (calorieTarget * 1.1);
          enhancedRecipe.calorieTargetDiff = recipe.calories - calorieTarget;
        }
      }
      
      return enhancedRecipe;
    });
    
    setFilteredRecipes(enhancedRecipes);
    setLoading(false);
  }, [recipes, pantry, profile, enablePantryFiltering, enableDietaryFiltering, enableCalorieFiltering]);

  return { filteredRecipes, loading };
}
