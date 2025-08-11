import { useState } from "react";
import AddToPlanDialog from "./AddToPlanDialog";

export default function RecipeCard({ recipe }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="card recipe-card">
      <img className="recipe-img" src={recipe.image} alt={recipe.title} />
      <div className="card-body">
        <h3>{recipe.title}</h3>
        {recipe.calories && <p className="muted">{recipe.calories} kcal</p>}
        <div className="card-actions">
          <button className="btn" onClick={() => setOpen(true)}>Add to Plan</button>
          <button className="btn-secondary">Details</button>
        </div>
      </div>

      <AddToPlanDialog
        open={open}
        onClose={() => setOpen(false)}
        recipe={recipe}
      />
    </article>
  );
}
