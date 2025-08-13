import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { removeRecipeFromCache } from "../lib/recipes";

const KEY = "mealmind_plan_v1";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["breakfast", "lunch", "dinner"];

function emptyPlan() {
  return DAYS.reduce((acc, d) => {
    acc[d] = SLOTS.reduce((m, s) => (m[s] = null, m), {});
    return acc;
  }, {});
}

const PlanCtx = createContext(null);
export const usePlan = () => useContext(PlanCtx);

export function PlanProvider({ children }) {
  const initial = useMemo(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : emptyPlan();
    } catch {
      return emptyPlan();
    }
  }, []);
  const [plan, setPlan] = useState(initial);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(plan));
  }, [plan]);

  function setCell(day, slot, recipe) {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: recipe } }));
  }
  function clearCell(day, slot) {
    // Get the current recipe in this cell
    const recipeToRemove = plan[day][slot];
    
    // If there's a recipe with an id, remove it from Supabase
    if (recipeToRemove && recipeToRemove.id) {
      removeRecipeFromCache(recipeToRemove.id).catch(err => 
        console.error(`Error removing recipe ${recipeToRemove.id} from cache:`, err)
      );
    }
    
    // Update the local state
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: null } }));
  }
  function clearAll() { 
    // Get all recipes with IDs that are currently in the plan
    const recipesToRemove = [];
    DAYS.forEach(day => {
      SLOTS.forEach(slot => {
        const recipe = plan[day][slot];
        if (recipe && recipe.id) {
          recipesToRemove.push(recipe.id);
        }
      });
    });
    
    // Remove all recipes from Supabase
    recipesToRemove.forEach(id => {
      removeRecipeFromCache(id).catch(err => 
        console.error(`Error removing recipe ${id} from cache:`, err)
      );
    });
    
    // Update the local state
    setPlan(emptyPlan()); 
  }

  return (
    <PlanCtx.Provider value={{ plan, setCell, clearCell, clearAll, DAYS, SLOTS }}>
      {children}
    </PlanCtx.Provider>
  );
}
