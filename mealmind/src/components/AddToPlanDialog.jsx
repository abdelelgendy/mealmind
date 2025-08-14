import { useState } from "react";
import Modal from "./Modal";
import { usePlan } from "../plan/PlanContext";
import { saveRecipeToCache } from "../lib/recipes";

export default function AddToPlanDialog({ open, onClose, recipe, onAddToPlan }) {
  const { DAYS, SLOTS, setCell } = usePlan();
  const [day, setDay] = useState(DAYS[0]);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [isAdding, setIsAdding] = useState(false);

  async function add() {
    if (!recipe) return;
    setIsAdding(true);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error("Add to plan operation timed out");
      setIsAdding(false);
      alert("Operation timed out. Please try again.");
    }, 10000); // 10 seconds timeout
    
    try {
      // First save to Supabase if we have a custom handler
      if (onAddToPlan) {
        await onAddToPlan(recipe, day, slot);
      } else {
        // Or just add to the plan directly
        // Attempt to save to Supabase first if it has complete recipe data
        if (recipe.ingredients || recipe.instructions) {
          await saveRecipeToCache(recipe);
        }
        setCell(day, slot, { id: recipe.id || recipe.title, title: recipe.title });
      }
      onClose?.();
    } catch (error) {
      console.error("Error adding recipe to plan:", error);
      alert(`Failed to add recipe to plan: ${error.message || "Unknown error"}. Please try again.`);
    } finally {
      clearTimeout(timeoutId);
      setIsAdding(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3>Add to plan</h3>
      <p className="muted">{recipe?.title}</p>
      <div className="row" style={{ marginTop: ".75rem" }}>
        <select value={day} onChange={e=>setDay(e.target.value)} disabled={isAdding}>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={slot} onChange={e=>setSlot(e.target.value)} disabled={isAdding}>
          {SLOTS.map(s => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
        <button className="btn" onClick={add} disabled={isAdding}>
          {isAdding ? "Adding..." : "Add"}
        </button>
        <button className="btn-secondary" onClick={onClose} disabled={isAdding}>Cancel</button>
      </div>
    </Modal>
  );
}

function cap(s){ return s[0].toUpperCase()+s.slice(1); }
