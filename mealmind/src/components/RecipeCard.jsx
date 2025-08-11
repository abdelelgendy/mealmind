export default function RecipeCard({ recipe }) {
  return (
    <article className="card recipe-card">
      <img className="recipe-img" src={recipe.image} alt={recipe.title} />
      <div className="card-body">
        <h3>{recipe.title}</h3>
        {recipe.calories && <p className="muted">{recipe.calories} kcal</p>}
        <div className="card-actions">
          <button className="btn">Add to Plan</button>
          <button className="btn-secondary">Details</button>
        </div>
      </div>
    </article>
  );
}
