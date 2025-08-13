import { useEffect, useState } from "react";
import Modal from "./Modal";
import { getCachedRecipeById, getRecipeById, saveRecipeToCache } from "../lib/recipes";

export default function RecipeDetailsDialog({ open, onClose, recipeId }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !recipeId) return;
    let isActive = true;
    
    async function load() {
      setStatus("loading");
      setError(null);
      
      try {
        // First, try fetching from cache
        let cached = await getCachedRecipeById(recipeId);
        if (cached && isActive) {
          setData(cached);
          setStatus("success");
          return;
        }

        // If not found in cache, fetch from Spoonacular and save it to cache
        const r = await getRecipeById(recipeId);
        if (isActive) {
          setData(r);
          setStatus("success");
          // Save it to Supabase cache
          await saveRecipeToCache(r);
        }
      } catch (e) {
        if (isActive) {
          setStatus("error");
          setError(e.message || "Failed to load recipe");
        }
      }
    }
    load();
    
    return () => { isActive = false; };
  }, [open, recipeId]);

  return (
    <Modal open={open} onClose={onClose}>
      {status === "loading" && <Skeleton />}
      {status === "error" && (
        <div>
          <h3>Couldn't load recipe</h3>
          <p className="muted" style={{ color: "#b91c1c" }}>{error}</p>
        </div>
      )}
      {status === "success" && data && (
        <div className="recipe-details">
          <div className="details-head">
            <img src={data.image} alt={data.title} className="details-img" />
            <div>
              <h2>{data.title}</h2>
              {data.calories && <p className="muted">{Math.round(data.calories)} kcal</p>}
            </div>
          </div>

          <div className="details-body">
            <section>
              <h3>Ingredients</h3>
              <ul className="ingredients">
                {data.ingredients.map((ing, i) => (
                  <li key={i}>
                    <span>{ing.name}</span>
                    <span className="muted">{ing.amount} {ing.unit}</span>
                  </li>
                ))}
              </ul>
            </section>

            {data.instructions.length > 0 && (
              <section>
                <h3>Steps</h3>
                <ol className="steps">
                  {data.instructions.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </section>
            )}
          </div>

          <div className="editor-actions">
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Skeleton() {
  return (
    <div className="recipe-details">
      <div className="details-head">
        <div className="details-img skeleton" />
        <div>
          <div className="skeleton line" style={{ width: "240px" }} />
          <div className="skeleton line" style={{ width: "120px", marginTop: ".5rem" }} />
        </div>
      </div>
      <div className="details-body">
        <div className="skeleton line" style={{ width: "80%" }} />
        <div className="skeleton line" style={{ width: "60%" }} />
        <div className="skeleton line" style={{ width: "70%" }} />
      </div>
    </div>
  );
}
