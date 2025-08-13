import RecipeCard from "./RecipeCard";

export default function RecipeGrid({ recipes = [], onAddToPlan }) {
  if (!recipes.length) return <p className="muted">No results yet.</p>;
  return (
    <div className="grid">
      {recipes.map(r => <RecipeCard key={r.id} recipe={r} onAddToPlan={onAddToPlan} />)}
    </div>
  );
}
