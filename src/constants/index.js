/* =============================================================================
   Application Constants
   ============================================================================= */

// Demo data for development and testing
export const DEMO_PANTRY_DATA = [
  { name: "chicken breast", category: "protein", quantity: "2 lbs" },
  { name: "olive oil", category: "oils", quantity: "1 bottle" },
  { name: "salt", category: "seasonings", quantity: "1 container" },
  { name: "black pepper", category: "seasonings", quantity: "1 container" },
  { name: "garlic", category: "vegetables", quantity: "1 bulb" },
  { name: "onion", category: "vegetables", quantity: "3 pieces" },
  { name: "tomatoes", category: "vegetables", quantity: "5 pieces" },
  { name: "lettuce", category: "vegetables", quantity: "2 heads" },
  { name: "cucumber", category: "vegetables", quantity: "2 pieces" },
  { name: "carrots", category: "vegetables", quantity: "1 bag" },
  { name: "rice", category: "grains", quantity: "2 lbs" },
  { name: "pasta", category: "grains", quantity: "1 box" },
  { name: "bread", category: "grains", quantity: "1 loaf" },
  { name: "milk", category: "dairy", quantity: "1 gallon" },
  { name: "eggs", category: "protein", quantity: "1 dozen" },
  { name: "cheese", category: "dairy", quantity: "1 block" },
  { name: "butter", category: "dairy", quantity: "1 stick" },
  { name: "flour", category: "baking", quantity: "5 lbs" },
  { name: "sugar", category: "baking", quantity: "2 lbs" },
  { name: "baking powder", category: "baking", quantity: "1 container" }
];

export const DEMO_PROFILE = {
  preferences: {
    diet: "vegetarian",
    calories: 2000,
    allergies: "nuts, shellfish",
    maxCookTime: 30,
    mealSize: "medium"
  }
};

// Food categories for organization
export const FOOD_CATEGORIES = {
  PROTEIN: 'protein',
  VEGETABLES: 'vegetables',
  GRAINS: 'grains',
  DAIRY: 'dairy',
  OILS: 'oils',
  SEASONINGS: 'seasonings',
  BAKING: 'baking',
  FRUITS: 'fruits',
  HERBS: 'herbs'
};

// Diet types for preferences
export const DIET_TYPES = [
  'none',
  'vegetarian',
  'vegan',
  'gluten-free',
  'keto',
  'paleo',
  'mediterranean',
  'low-carb',
  'dairy-free'
];

// Common allergens
export const COMMON_ALLERGENS = [
  'nuts',
  'shellfish',
  'dairy',
  'eggs',
  'soy',
  'wheat',
  'fish',
  'sesame'
];

// Application routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  RECIPES: '/recipes',
  MEAL_PLAN: '/meal-plan',
  PANTRY: '/pantry',
  PREFERENCES: '/preferences',
  LOGIN: '/login',
  SIGNUP: '/signup'
};

// UI Constants
export const UI_CONSTANTS = {
  MAX_RECIPE_CARDS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  LOADING_MIN_DURATION: 500
};

// API Configuration
export const API_CONFIG = {
  SPOONACULAR_BASE_URL: 'https://api.spoonacular.com/recipes',
  DEFAULT_RECIPE_LIMIT: 12,
  CACHE_DURATION: 1000 * 60 * 5 // 5 minutes
};
