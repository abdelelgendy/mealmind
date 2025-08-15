import { useEffect, useState } from "react";
import Modal from "./Modal";
import { getCachedRecipeById, getRecipeById, saveRecipeToCache } from "../lib/recipes";
import { useAuth } from "../contexts/AuthContext";
import AddToPlanDialog from "./AddToPlanDialog";

export default function RecipeDetailsDialog({ open, onClose, recipeId }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // cache | api
  const { user } = useAuth();

  useEffect(() => {
    if (!open || !recipeId) return;
    
    const ctrl = new AbortController();
    let isActive = true;
    
    async function load() {
      setStatus("loading");
      setError(null);
      
      try {
        console.log(`Loading recipe details for ID: ${recipeId}`);
        
        // First, try fetching from cache
        let cached = await getCachedRecipeById(recipeId);
        if (cached && isActive) {
          console.log('Recipe found in cache:', cached);
          setData(cached);
          setStatus("success");
          setSource("cache");
          return;
        }
        
        console.log('Recipe not in cache, fetching from API');

        // If not found in cache, fetch from Spoonacular and save it to cache
        const r = await getRecipeById(recipeId, { signal: ctrl.signal });
        if (isActive) {
          setData(r);
          setStatus("success");
          setSource("api");
          console.log('Recipe loaded from API:', r);
          
          // Save it to Supabase cache
          try {
            console.log('Caching recipe data');
            await saveRecipeToCache(r);
          } catch (cacheError) {
            console.error('Failed to cache recipe:', cacheError);
            // Don't fail the UI if caching fails
          }
        }
      } catch (e) {
        if (e.name === "AbortError") {
          console.log("Recipe fetch aborted");
          return;
        }
        
        if (isActive) {
          console.error('Error loading recipe:', e);
          setStatus("error");
          setError(e.message || "Failed to load recipe details");
        }
      }
    }
    
    load();
    
    return () => { 
      isActive = false; 
      ctrl.abort();
    };
  }, [open, recipeId]);

  const [openAddToPlanDialog, setOpenAddToPlanDialog] = useState(false);
  
  return (
    <>
      <Modal open={open} onClose={onClose}>
        {status === "loading" && <Skeleton />}
        
        {status === "error" && (
          <div className="error-container">
            <h3>Couldn't load recipe</h3>
            <p className="muted" style={{ color: "#b91c1c" }}>{error}</p>
            <div className="editor-actions">
              <button className="btn" onClick={() => window.location.reload()}>Retry</button>
              <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
        
        {status === "success" && data && (
          <div className="recipe-details">
            <div className="details-head">
              <img src={data.image} alt={data.title} className="details-img" />
              <div>
                <h2>{data.title}</h2>
                <div className="recipe-meta">
                  {data.calories && (
                    <span className="recipe-meta-item">
                      {Math.round(data.calories)} kcal
                    </span>
                  )}
                  
                  {data.servings && (
                    <span className="recipe-meta-item">
                      {data.servings} {data.servings === 1 ? 'serving' : 'servings'}
                    </span>
                  )}
                  
                  {data.readyInMinutes && (
                    <span className="recipe-meta-item">
                      {data.readyInMinutes} min total
                    </span>
                  )}
                  
                  {data.prepTime && (
                    <span className="recipe-meta-item">
                      {data.prepTime} min prep
                    </span>
                  )}
                  
                  {data.cookTime && (
                    <span className="recipe-meta-item">
                      {data.cookTime} min cooking
                    </span>
                  )}
                  
                  {source && <span className="data-source">{source === "cache" ? "(loaded from cache)" : "(freshly loaded)"}</span>}
                </div>
                
                {data.sourceName && (
                  <div className="recipe-source">
                    Source: {data.sourceUrl ? 
                      <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">{data.sourceName}</a> : 
                      data.sourceName}
                  </div>
                )}
                
                {/* Tags section */}
                <div className="recipe-tags">
                  {data.dishTypes && data.dishTypes.length > 0 && (
                    <div className="tag-group">
                      {data.dishTypes.map((type, i) => (
                        <span key={i} className="recipe-tag dish-tag">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {data.diets && data.diets.length > 0 && (
                    <div className="tag-group">
                      {data.diets.map((diet, i) => (
                        <span key={i} className="recipe-tag diet-tag">
                          {diet}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="details-body">
              <section className="ingredients-section">
                <h3>Ingredients</h3>
                {data.ingredients && data.ingredients.length > 0 ? (
                  <ul className="ingredients">
                    {data.ingredients.map((ing, i) => (
                      <li key={i}>
                        <span>{ing.name}</span>
                        <span className="muted">{ing.amount} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No ingredients available for this recipe.</p>
                )}
              </section>

              {data.instructions && data.instructions.length > 0 && (
                <section className="instructions-section">
                  <h3>Instructions</h3>
                  <ol className="steps">
                    {data.instructions.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </section>
              )}
              
              {/* Nutrition Facts Section - if available */}
              {data.nutrients && data.nutrients.length > 0 && (
                <section className="nutrition-section">
                  <h3>Nutrition Facts</h3>
                  <div className="nutrition-grid">
                    {data.nutrients.map((nutrient, i) => (
                      <div key={i} className="nutrient-item">
                        <span className="nutrient-name">{nutrient.name}</span>
                        <span className="nutrient-value">{nutrient.amount} {nutrient.unit}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="editor-actions">
              <button 
                className="btn" 
                onClick={() => {
                  setOpenAddToPlanDialog(true);
                }}
              >
                Add to Plan
              </button>
              <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Add to Plan Dialog */}
      {data && (
        <AddToPlanDialog
          open={openAddToPlanDialog}
          onClose={() => setOpenAddToPlanDialog(false)}
          recipe={data}
          onAddToPlan={(recipe, day, slot) => {
            setOpenAddToPlanDialog(false);
            onClose(); // Close the details dialog after adding
          }}
        />
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div className="recipe-details">
      <div className="details-head">
        <div className="details-img skeleton" />
        <div>
          <div className="skeleton line" style={{ width: "240px", height: "24px" }} />
          <div className="skeleton-meta">
            <div className="skeleton line" style={{ width: "60px" }} />
            <div className="skeleton line" style={{ width: "80px" }} />
            <div className="skeleton line" style={{ width: "70px" }} />
          </div>
          <div className="skeleton line" style={{ width: "180px", marginTop: ".8rem" }} />
          
          {/* Tags skeleton */}
          <div className="skeleton-tags">
            <div className="skeleton tag" style={{ width: "70px" }} />
            <div className="skeleton tag" style={{ width: "90px" }} />
            <div className="skeleton tag" style={{ width: "60px" }} />
          </div>
        </div>
      </div>
      
      <div className="details-body">
        {/* Ingredients section skeleton */}
        <section>
          <div className="skeleton line" style={{ width: "120px", height: "20px", marginBottom: "10px" }} />
          
          <div className="ingredients-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="ingredient-skeleton-row">
                <div className="skeleton line" style={{ width: "60%" }} />
                <div className="skeleton line" style={{ width: "30%" }} />
              </div>
            ))}
          </div>
        </section>
        
        {/* Instructions section skeleton */}
        <section>
          <div className="skeleton line" style={{ width: "120px", height: "20px", marginBottom: "10px", marginTop: "15px" }} />
          
          <div className="steps-skeleton">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="step-skeleton-row" style={{ marginLeft: "20px" }}>
                <div className="skeleton line" style={{ width: `${85 - i * 5}%` }} />
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Buttons skeleton */}
      <div className="editor-actions" style={{ marginTop: "15px" }}>
        <div className="skeleton" style={{ width: "80px", height: "32px", borderRadius: "4px" }} />
        <div className="skeleton" style={{ width: "80px", height: "32px", borderRadius: "4px" }} />
      </div>
    </div>
  );
}
