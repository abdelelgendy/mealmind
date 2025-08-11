import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: null } }));
  }
  function clearAll() { setPlan(emptyPlan()); }

  return (
    <PlanCtx.Provider value={{ plan, setCell, clearCell, clearAll, DAYS, SLOTS }}>
      {children}
    </PlanCtx.Provider>
  );
}
