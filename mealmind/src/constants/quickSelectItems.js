// Quick select pantry items organized by category for easy adding
export const QUICK_SELECT_PANTRY_ITEMS = {
  "Protein": [
    { name: "chicken breast", quantity: 1, unit: "lb", emoji: "🐔" },
    { name: "ground beef", quantity: 1, unit: "lb", emoji: "🥩" },
    { name: "salmon fillet", quantity: 2, unit: "pcs", emoji: "🐟" },
    { name: "eggs", quantity: 12, unit: "pcs", emoji: "🥚" },
    { name: "tofu", quantity: 1, unit: "block", emoji: "🟧" },
    { name: "turkey breast", quantity: 1, unit: "lb", emoji: "🦃" },
    { name: "shrimp", quantity: 1, unit: "lb", emoji: "🦐" },
    { name: "ground turkey", quantity: 1, unit: "lb", emoji: "🦃" }
  ],
  "Vegetables": [
    { name: "onion", quantity: 3, unit: "pcs", emoji: "🧅" },
    { name: "garlic", quantity: 1, unit: "bulb", emoji: "🧄" },
    { name: "tomatoes", quantity: 4, unit: "pcs", emoji: "🍅" },
    { name: "carrots", quantity: 1, unit: "bag", emoji: "🥕" },
    { name: "bell peppers", quantity: 3, unit: "pcs", emoji: "🌶️" },
    { name: "broccoli", quantity: 2, unit: "heads", emoji: "🥦" },
    { name: "spinach", quantity: 1, unit: "bag", emoji: "🥬" },
    { name: "potatoes", quantity: 5, unit: "pcs", emoji: "🥔" },
    { name: "cucumber", quantity: 2, unit: "pcs", emoji: "🥒" },
    { name: "lettuce", quantity: 1, unit: "head", emoji: "🥬" },
    { name: "mushrooms", quantity: 8, unit: "oz", emoji: "🍄" },
    { name: "zucchini", quantity: 2, unit: "pcs", emoji: "🥒" }
  ],
  "Fruits": [
    { name: "bananas", quantity: 6, unit: "pcs", emoji: "🍌" },
    { name: "apples", quantity: 4, unit: "pcs", emoji: "🍎" },
    { name: "lemons", quantity: 3, unit: "pcs", emoji: "🍋" },
    { name: "oranges", quantity: 4, unit: "pcs", emoji: "🍊" },
    { name: "avocados", quantity: 2, unit: "pcs", emoji: "🥑" },
    { name: "berries", quantity: 1, unit: "cup", emoji: "🫐" },
    { name: "grapes", quantity: 1, unit: "bunch", emoji: "🍇" },
    { name: "lime", quantity: 2, unit: "pcs", emoji: "🍋" }
  ],
  "Grains": [
    { name: "white rice", quantity: 2, unit: "lbs", emoji: "🍚" },
    { name: "brown rice", quantity: 2, unit: "lbs", emoji: "🍚" },
    { name: "pasta", quantity: 1, unit: "box", emoji: "🍝" },
    { name: "bread", quantity: 1, unit: "loaf", emoji: "🍞" },
    { name: "quinoa", quantity: 1, unit: "bag", emoji: "🌾" },
    { name: "oats", quantity: 1, unit: "container", emoji: "🥣" },
    { name: "flour", quantity: 5, unit: "lbs", emoji: "🌾" },
    { name: "couscous", quantity: 1, unit: "box", emoji: "🌾" }
  ],
  "Dairy": [
    { name: "milk", quantity: 1, unit: "gallon", emoji: "🥛" },
    { name: "cheese", quantity: 8, unit: "oz", emoji: "🧀" },
    { name: "butter", quantity: 1, unit: "stick", emoji: "🧈" },
    { name: "yogurt", quantity: 1, unit: "container", emoji: "🥛" },
    { name: "cream cheese", quantity: 8, unit: "oz", emoji: "🧀" },
    { name: "sour cream", quantity: 1, unit: "container", emoji: "🥛" },
    { name: "heavy cream", quantity: 1, unit: "pint", emoji: "🥛" },
    { name: "parmesan", quantity: 1, unit: "wedge", emoji: "🧀" }
  ],
  "Pantry Staples": [
    { name: "olive oil", quantity: 1, unit: "bottle", emoji: "🍶" },
    { name: "vegetable oil", quantity: 1, unit: "bottle", emoji: "🍶" },
    { name: "salt", quantity: 1, unit: "container", emoji: "🧂" },
    { name: "black pepper", quantity: 1, unit: "container", emoji: "⚫" },
    { name: "sugar", quantity: 2, unit: "lbs", emoji: "🍯" },
    { name: "baking powder", quantity: 1, unit: "container", emoji: "🥄" },
    { name: "vanilla extract", quantity: 1, unit: "bottle", emoji: "🍶" },
    { name: "soy sauce", quantity: 1, unit: "bottle", emoji: "🍶" },
    { name: "honey", quantity: 1, unit: "jar", emoji: "🍯" },
    { name: "vinegar", quantity: 1, unit: "bottle", emoji: "🍶" }
  ],
  "Herbs & Spices": [
    { name: "basil", quantity: 1, unit: "bunch", emoji: "🌿" },
    { name: "oregano", quantity: 1, unit: "container", emoji: "🌿" },
    { name: "thyme", quantity: 1, unit: "container", emoji: "🌿" },
    { name: "rosemary", quantity: 1, unit: "bunch", emoji: "🌿" },
    { name: "paprika", quantity: 1, unit: "container", emoji: "🌶️" },
    { name: "cumin", quantity: 1, unit: "container", emoji: "🌶️" },
    { name: "chili powder", quantity: 1, unit: "container", emoji: "🌶️" },
    { name: "garlic powder", quantity: 1, unit: "container", emoji: "🧄" },
    { name: "onion powder", quantity: 1, unit: "container", emoji: "🧅" },
    { name: "italian seasoning", quantity: 1, unit: "container", emoji: "🌿" }
  ]
};

// Most commonly used items for quick access
export const MOST_COMMON_PANTRY_ITEMS = [
  { name: "onion", quantity: 3, unit: "pcs", emoji: "🧅", category: "Vegetables" },
  { name: "garlic", quantity: 1, unit: "bulb", emoji: "🧄", category: "Vegetables" },
  { name: "tomatoes", quantity: 4, unit: "pcs", emoji: "🍅", category: "Vegetables" },
  { name: "chicken breast", quantity: 1, unit: "lb", emoji: "🐔", category: "Protein" },
  { name: "eggs", quantity: 12, unit: "pcs", emoji: "🥚", category: "Protein" },
  { name: "olive oil", quantity: 1, unit: "bottle", emoji: "🍶", category: "Pantry Staples" },
  { name: "salt", quantity: 1, unit: "container", emoji: "🧂", category: "Pantry Staples" },
  { name: "black pepper", quantity: 1, unit: "container", emoji: "⚫", category: "Pantry Staples" },
  { name: "milk", quantity: 1, unit: "gallon", emoji: "🥛", category: "Dairy" },
  { name: "cheese", quantity: 8, unit: "oz", emoji: "🧀", category: "Dairy" },
  { name: "pasta", quantity: 1, unit: "box", emoji: "🍝", category: "Grains" },
  { name: "rice", quantity: 2, unit: "lbs", emoji: "🍚", category: "Grains" }
];

// Quick select search options for recipes
export const RECIPE_QUICK_SELECT_OPTIONS = {
  "Popular Searches": [
    { query: "chicken", emoji: "🐔", description: "Chicken recipes" },
    { query: "pasta", emoji: "🍝", description: "Pasta dishes" },
    { query: "salad", emoji: "🥗", description: "Fresh salads" },
    { query: "soup", emoji: "🍲", description: "Comforting soups" },
    { query: "pizza", emoji: "🍕", description: "Pizza recipes" },
    { query: "stir fry", emoji: "🥘", description: "Quick stir-fries" },
    { query: "sandwich", emoji: "🥪", description: "Sandwiches & wraps" },
    { query: "breakfast", emoji: "🍳", description: "Breakfast ideas" }
  ],
  "Meal Types": [
    { query: "quick dinner", emoji: "⚡", description: "30-minute meals" },
    { query: "healthy lunch", emoji: "🥙", description: "Nutritious lunches" },
    { query: "easy breakfast", emoji: "🌅", description: "Morning favorites" },
    { query: "snacks", emoji: "🍿", description: "Healthy snacks" },
    { query: "dessert", emoji: "🍰", description: "Sweet treats" },
    { query: "appetizer", emoji: "🍤", description: "Party starters" },
    { query: "one pot", emoji: "🍲", description: "One-pot wonders" },
    { query: "meal prep", emoji: "📦", description: "Prep-friendly meals" }
  ],
  "Cuisines": [
    { query: "italian", emoji: "🇮🇹", description: "Italian classics" },
    { query: "mexican", emoji: "🌮", description: "Mexican flavors" },
    { query: "asian", emoji: "🥢", description: "Asian cuisine" },
    { query: "mediterranean", emoji: "🫒", description: "Mediterranean diet" },
    { query: "indian", emoji: "🍛", description: "Indian spices" },
    { query: "thai", emoji: "🌶️", description: "Thai favorites" },
    { query: "greek", emoji: "🥙", description: "Greek dishes" },
    { query: "american", emoji: "🇺🇸", description: "American comfort food" }
  ],
  "Dietary Preferences": [
    { query: "vegetarian", emoji: "🥕", description: "Vegetarian recipes" },
    { query: "vegan", emoji: "🌱", description: "Plant-based meals" },
    { query: "gluten free", emoji: "🌾", description: "Gluten-free options" },
    { query: "keto", emoji: "🥑", description: "Keto-friendly" },
    { query: "low carb", emoji: "🥩", description: "Low-carb meals" },
    { query: "high protein", emoji: "💪", description: "Protein-packed" },
    { query: "dairy free", emoji: "🥥", description: "Dairy-free recipes" },
    { query: "paleo", emoji: "🦴", description: "Paleo diet" }
  ]
};
