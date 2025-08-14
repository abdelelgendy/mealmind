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
  const [isLoading, setIsLoading] = useState(false);
  
  // We'll move the Supabase loading logic to the Plan component for now

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(plan));
  }, [plan]);

  function setCell(day, slot, recipe) {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: recipe } }));
  }
  function clearCell(day, slot) {
    // Update the local state only
    // Supabase deletion is handled in the Plan component's handleClearCell function
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: null } }));
  }
  
  function clearAll() { 
    // Update the local state only
    // Supabase deletion is handled in the Plan component
    setPlan(emptyPlan()); 
  }

  return (
    <PlanCtx.Provider value={{ plan, setCell, clearCell, clearAll, DAYS, SLOTS, isLoading }}>
      {children}
    </PlanCtx.Provider>
  );
}
