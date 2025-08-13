import { useState } from "react";
import AddToPlanDialog from "./AddToPlanDialog";
import RecipeDetailsDialog from "./RecipeDetailsDialog";

export default function RecipeCard({ recipe, onAddToPlan }) {
  const [openPlan, setOpenPlan] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  // Handle add to plan button click
  const handleAddToPlan = () => {
    // Always show the dialog for choosing when/where to add the recipe
    setOpenPlan(true);
  };

  return (
    <article className="card recipe-card">
      <img className="recipe-img" src={recipe.image} alt={recipe.title} />
      <div className="card-body">
        <h3>{recipe.title}</h3>
        {recipe.calories && <p className="muted">{recipe.calories} kcal</p>}
        <div className="card-actions">
          <button className="btn" onClick={handleAddToPlan}>Add to Plan</button>
          <button className="btn-secondary" onClick={() => setOpenDetails(true)}>Details</button>
        </div>
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
