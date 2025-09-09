export default function IngredientsSubstitutions({ ingredients }) {
  const getSubstitution = (ingredient) => {
    // This is a simplified substitution logic
    // In a real app, you might use an API or a more comprehensive database
    const name = ingredient.name.toLowerCase();
    
    // Common substitutions
    const substitutions = {
      "butter": ["margarine", "olive oil", "coconut oil"],
      "milk": ["almond milk", "oat milk", "soy milk"],
      "egg": ["flax egg (1 tbsp ground flaxseed + 3 tbsp water)", "applesauce", "mashed banana"],
      "flour": ["almond flour", "coconut flour", "gluten-free flour blend"],
      "sugar": ["honey", "maple syrup", "stevia"],
      "sour cream": ["greek yogurt", "coconut cream"],
      "cream cheese": ["tofu cream cheese", "cashew cream cheese"],
      "heavy cream": ["coconut cream", "cashew cream"],
      "beef": ["plant-based ground beef", "lentils", "mushrooms"],
      "chicken": ["tofu", "tempeh", "jackfruit"],
      "white rice": ["brown rice", "quinoa", "cauliflower rice"],
      "pasta": ["zucchini noodles", "chickpea pasta", "whole grain pasta"],
      "breadcrumbs": ["crushed crackers", "oats", "almond meal"],
      "mayonnaise": ["greek yogurt", "avocado", "hummus"],
      "cheese": ["nutritional yeast", "vegan cheese"],
      "worcestershire sauce": ["soy sauce + vinegar", "coconut aminos"],
      "wine": ["broth", "grape juice", "apple cider vinegar"],
      "lemon juice": ["lime juice", "vinegar"],
      "corn starch": ["arrowroot powder", "potato starch"],
      "tomato": ["red bell pepper", "pumpkin puree"]
    };
    
    // Check if we have a substitution for this ingredient
    for (const [key, subs] of Object.entries(substitutions)) {
      if (name.includes(key)) {
        return {
          original: key,
          substitutes: subs
        };
      }
    }
    
    return null;
  };
  
  // Filter out ingredients with no substitutions
  const substitutions = ingredients
    .map(ingredient => ({
      ingredient: ingredient.name,
      sub: getSubstitution(ingredient)
    }))
    .filter(item => item.sub !== null);
    
  if (substitutions.length === 0) {
    return null;
  }
  
  return (
    <div className="ingredient-substitutions">
      <h4>Possible Substitutions:</h4>
      <ul className="substitutions-list">
        {substitutions.map((sub, index) => (
          <li key={index}>
            <strong>{sub.sub.original}</strong>: {sub.sub.substitutes.join(", ")}
          </li>
        ))}
      </ul>
      <p className="text-sm muted">Note: Substitutions may affect the final taste and texture.</p>
    </div>
  );
}
