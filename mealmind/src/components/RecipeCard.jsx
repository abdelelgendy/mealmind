import { useState } from "react";
import AddToPlanDialog from "./AddToPlanDialog";
import RecipeDetailsDialog from "./RecipeDetailsDialog";

export default function RecipeCard({ recipe }) {
  const [openPlan, setOpenPlan] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  return (
    <article className="card recipe-card">
      <img className="recipe-img" src={recipe.image} alt={recipe.title} />
      <div className="card-body">
        <h3>{recipe.title}</h3>
        {recipe.calories && <p className="muted">{recipe.calories} kcal</p>}
        <div className="card-actions">
          <button className="btn" onClick={() => setOpenPlan(true)}>Add to Plan</button>
          <button className="btn-secondary" onClick={() => setOpenDetails(true)}>Details</button>
        </div>
      </div>

      <AddToPlanDialog open={openPlan} onClose={() => setOpenPlan(false)} recipe={recipe} />
      <RecipeDetailsDialog open={openDetails} onClose={() => setOpenDetails(false)} recipeId={recipe.id} />
    </article>
  );
}
