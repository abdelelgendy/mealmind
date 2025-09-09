/**
 * Mock data for offline demonstration and fallback scenarios
 * This ensures the app remains functional even without API access
 */

export const MOCK_RECIPES = [
  {
    id: 1001,
    title: "Grilled Chicken with Vegetables",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop",
    readyInMinutes: 25,
    servings: 4,
    calories: 320,
    summary: "A healthy and delicious grilled chicken dish with fresh seasonal vegetables. Perfect for a high-protein, low-carb meal.",
    extendedIngredients: [
      { name: "chicken breast", amount: 4, unit: "pieces" },
      { name: "bell peppers", amount: 2, unit: "pieces" },
      { name: "zucchini", amount: 1, unit: "large" },
      { name: "olive oil", amount: 2, unit: "tbsp" },
      { name: "garlic", amount: 3, unit: "cloves" }
    ],
    dishTypes: ["lunch", "dinner"],
    diets: ["high protein", "keto friendly"],
    occasions: ["weeknight dinner"]
  },
  {
    id: 1002,
    title: "Quinoa Buddha Bowl",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop",
    readyInMinutes: 30,
    servings: 2,
    calories: 450,
    summary: "A nutritious and colorful buddha bowl packed with quinoa, fresh vegetables, and a tahini dressing.",
    extendedIngredients: [
      { name: "quinoa", amount: 1, unit: "cup" },
      { name: "chickpeas", amount: 1, unit: "can" },
      { name: "spinach", amount: 2, unit: "cups" },
      { name: "cherry tomatoes", amount: 1, unit: "cup" },
      { name: "avocado", amount: 1, unit: "piece" },
      { name: "tahini", amount: 2, unit: "tbsp" }
    ],
    dishTypes: ["lunch", "dinner"],
    diets: ["vegetarian", "vegan", "gluten free"],
    occasions: ["healthy meal", "meal prep"]
  },
  {
    id: 1003,
    title: "Salmon with Lemon Herbs",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
    readyInMinutes: 20,
    servings: 2,
    calories: 380,
    summary: "Fresh Atlantic salmon fillet with aromatic herbs and bright lemon flavors. Rich in omega-3 fatty acids.",
    extendedIngredients: [
      { name: "salmon fillet", amount: 2, unit: "pieces" },
      { name: "lemon", amount: 1, unit: "piece" },
      { name: "fresh dill", amount: 2, unit: "tbsp" },
      { name: "olive oil", amount: 1, unit: "tbsp" },
      { name: "garlic", amount: 2, unit: "cloves" }
    ],
    dishTypes: ["lunch", "dinner"],
    diets: ["high protein", "keto friendly", "pescatarian"],
    occasions: ["date night", "healthy dinner"]
  },
  {
    id: 1004,
    title: "Vegetable Stir Fry",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
    readyInMinutes: 15,
    servings: 3,
    calories: 250,
    summary: "Quick and easy vegetable stir fry with a savory soy-ginger sauce. Perfect for busy weeknights.",
    extendedIngredients: [
      { name: "broccoli", amount: 2, unit: "cups" },
      { name: "carrots", amount: 2, unit: "medium" },
      { name: "snap peas", amount: 1, unit: "cup" },
      { name: "soy sauce", amount: 3, unit: "tbsp" },
      { name: "ginger", amount: 1, unit: "inch piece" },
      { name: "sesame oil", amount: 1, unit: "tbsp" }
    ],
    dishTypes: ["lunch", "dinner", "side dish"],
    diets: ["vegetarian", "vegan"],
    occasions: ["quick meal", "weeknight dinner"]
  },
  {
    id: 1005,
    title: "Greek Yogurt Parfait",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop",
    readyInMinutes: 5,
    servings: 1,
    calories: 280,
    summary: "Creamy Greek yogurt layered with fresh berries and crunchy granola. A perfect healthy breakfast or snack.",
    extendedIngredients: [
      { name: "Greek yogurt", amount: 1, unit: "cup" },
      { name: "mixed berries", amount: 0.5, unit: "cup" },
      { name: "granola", amount: 0.25, unit: "cup" },
      { name: "honey", amount: 1, unit: "tbsp" },
      { name: "almonds", amount: 2, unit: "tbsp" }
    ],
    dishTypes: ["breakfast", "snack"],
    diets: ["vegetarian", "high protein"],
    occasions: ["breakfast", "healthy snack"]
  },
  {
    id: 1006,
    title: "Mushroom Risotto",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&h=200&fit=crop",
    readyInMinutes: 35,
    servings: 4,
    calories: 420,
    summary: "Creamy and comforting mushroom risotto made with arborio rice and a mix of wild mushrooms.",
    extendedIngredients: [
      { name: "arborio rice", amount: 1.5, unit: "cups" },
      { name: "mixed mushrooms", amount: 8, unit: "oz" },
      { name: "vegetable broth", amount: 4, unit: "cups" },
      { name: "parmesan cheese", amount: 0.5, unit: "cup" },
      { name: "white wine", amount: 0.5, unit: "cup" },
      { name: "onion", amount: 1, unit: "medium" }
    ],
    dishTypes: ["lunch", "dinner"],
    diets: ["vegetarian"],
    occasions: ["comfort food", "special dinner"]
  }
];

export const MOCK_PANTRY_ITEMS = [
  { id: 'p1', name: 'Chicken Breast', category: 'protein', emoji: '🐔', quantity: 2, unit: 'lbs' },
  { id: 'p2', name: 'Salmon Fillet', category: 'protein', emoji: '🐟', quantity: 4, unit: 'pieces' },
  { id: 'p3', name: 'Greek Yogurt', category: 'dairy', emoji: '🥛', quantity: 1, unit: 'container' },
  { id: 'p4', name: 'Quinoa', category: 'grains', emoji: '🌾', quantity: 1, unit: 'bag' },
  { id: 'p5', name: 'Avocado', category: 'produce', emoji: '🥑', quantity: 3, unit: 'pieces' },
  { id: 'p6', name: 'Spinach', category: 'produce', emoji: '🥬', quantity: 1, unit: 'bag' },
  { id: 'p7', name: 'Bell Peppers', category: 'produce', emoji: '🫑', quantity: 4, unit: 'pieces' },
  { id: 'p8', name: 'Olive Oil', category: 'pantry', emoji: '🫒', quantity: 1, unit: 'bottle' },
  { id: 'p9', name: 'Garlic', category: 'produce', emoji: '🧄', quantity: 1, unit: 'bulb' },
  { id: 'p10', name: 'Mixed Berries', category: 'produce', emoji: '🫐', quantity: 2, unit: 'cups' }
];

export const MOCK_USER_PROFILE = {
  id: 'demo_user',
  email: 'demo@mealmind.com',
  preferences: {
    calories: 2000,
    diet: 'high-protein',
    allergies: 'peanuts',
    mealSize: 'medium',
    maxCookTime: 45
  }
};

export const DEMO_MEAL_PLAN = {
  monday: {
    breakfast: { id: 1005, title: "Greek Yogurt Parfait" },
    lunch: { id: 1002, title: "Quinoa Buddha Bowl" },
    dinner: { id: 1001, title: "Grilled Chicken with Vegetables" }
  },
  tuesday: {
    breakfast: { id: 1005, title: "Greek Yogurt Parfait" },
    lunch: { id: 1004, title: "Vegetable Stir Fry" },
    dinner: { id: 1003, title: "Salmon with Lemon Herbs" }
  },
  wednesday: {
    breakfast: null,
    lunch: { id: 1002, title: "Quinoa Buddha Bowl" },
    dinner: { id: 1006, title: "Mushroom Risotto" }
  },
  thursday: {
    breakfast: { id: 1005, title: "Greek Yogurt Parfait" },
    lunch: null,
    dinner: { id: 1001, title: "Grilled Chicken with Vegetables" }
  },
  friday: {
    breakfast: null,
    lunch: { id: 1004, title: "Vegetable Stir Fry" },
    dinner: { id: 1003, title: "Salmon with Lemon Herbs" }
  },
  saturday: {
    breakfast: { id: 1005, title: "Greek Yogurt Parfait" },
    lunch: { id: 1002, title: "Quinoa Buddha Bowl" },
    dinner: { id: 1006, title: "Mushroom Risotto" }
  },
  sunday: {
    breakfast: null,
    lunch: { id: 1004, title: "Vegetable Stir Fry" },
    dinner: { id: 1001, title: "Grilled Chicken with Vegetables" }
  }
};

/**
 * Simulate API delays for realistic demo experience
 */
export const simulateApiCall = (data, delay = 800) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * Filter mock recipes based on search query
 */
export const searchMockRecipes = (query, filters = {}) => {
  if (!query && !Object.keys(filters).length) return MOCK_RECIPES;
  
  return MOCK_RECIPES.filter(recipe => {
    const matchesQuery = !query || 
      recipe.title.toLowerCase().includes(query.toLowerCase()) ||
      recipe.summary.toLowerCase().includes(query.toLowerCase()) ||
      recipe.extendedIngredients.some(ing => 
        ing.name.toLowerCase().includes(query.toLowerCase())
      ) ||
      recipe.diets.some(diet => 
        diet.toLowerCase().includes(query.toLowerCase())
      );

    const matchesDiet = !filters.diet || 
      recipe.diets.some(diet => 
        diet.toLowerCase().includes(filters.diet.toLowerCase())
      );

    const matchesMaxCalories = !filters.maxCals || 
      recipe.calories <= parseInt(filters.maxCals);

    return matchesQuery && matchesDiet && matchesMaxCalories;
  });
};
