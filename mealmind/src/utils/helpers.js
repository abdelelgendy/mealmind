/* =============================================================================
   Utility Functions
   ============================================================================= */

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Format time duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format ingredient list for display
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {string} Formatted ingredient string
 */
export const formatIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) return '';
  return ingredients
    .map(ingredient => ingredient.name || ingredient)
    .join(', ');
};

/**
 * Check if an array contains any of the specified allergens
 * @param {Array} ingredients - Array of ingredients
 * @param {Array} allergens - Array of allergens to check
 * @returns {boolean} True if allergens found
 */
export const containsAllergens = (ingredients, allergens) => {
  if (!Array.isArray(ingredients) || !Array.isArray(allergens)) return false;
  const ingredientNames = ingredients.map(ing => 
    (ing.name || ing).toLowerCase()
  );
  return allergens.some(allergen => 
    ingredientNames.some(name => name.includes(allergen.toLowerCase()))
  );
};

/**
 * Filter recipes based on dietary preferences
 * @param {Array} recipes - Array of recipe objects
 * @param {Object} preferences - User preferences object
 * @returns {Array} Filtered recipes
 */
export const filterRecipesByPreferences = (recipes, preferences) => {
  if (!Array.isArray(recipes) || !preferences) return recipes;
  
  return recipes.filter(recipe => {
    // Check diet restrictions
    if (preferences.diet && preferences.diet !== 'none') {
      const dietTags = recipe.diets || [];
      const isDietCompliant = dietTags.includes(preferences.diet);
      if (!isDietCompliant) return false;
    }
    
    // Check allergens
    if (preferences.allergies) {
      const allergenList = preferences.allergies.split(',').map(a => a.trim());
      const hasAllergens = containsAllergens(
        recipe.extendedIngredients || recipe.ingredients || [],
        allergenList
      );
      if (hasAllergens) return false;
    }
    
    // Check cooking time
    if (preferences.maxCookTime && recipe.readyInMinutes) {
      if (recipe.readyInMinutes > preferences.maxCookTime) return false;
    }
    
    return true;
  });
};

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

/**
 * Format number for display (e.g., 1000 -> 1K)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Create a delay promise for testing/loading states
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
