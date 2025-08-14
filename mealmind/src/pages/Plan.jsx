import { useState } from "react";
import { usePlan } from "../plan/PlanContext";
import { useAuth } from "../contexts/AuthContext";
import { saveMealPlan } from "../lib/supabase";

export default function Plan() {
  const { plan, setCell, clearCell, clearAll, DAYS, SLOTS } = usePlan();
  const { user } = useAuth();
  const [editing, setEditing] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  function startEdit(day, slot) {
    setEditing({ day, slot });
    setText(plan[day][slot]?.title ?? "");
  }
  
  async function saveEdit() {
    if (!editing) return;
    const { day, slot } = editing;
    const title = text.trim();
    
    setLoading(true);  // Set loading true when starting the process
    
    try {
      if (title) {
        const newRecipe = { 
          title, 
          id: crypto.randomUUID?.() || Math.random().toString(36).slice(2)
        };
        
        // If the user is logged in, save to Supabase first
        if (user) {
          await saveMealPlan(user.id, day, slot, newRecipe);
          console.log(`Recipe ${title} saved to ${day} ${slot} for user ${user.id}`);
        }
        
        // Update local state
        setCell(day, slot, newRecipe);
      } else {
        setCell(day, slot, null);
      }
      
      setEditing(null);
      setText("");
    } catch (error) {
      console.error("Error saving meal plan:", error);
      alert("Error saving the meal plan. Please try again.");
    } finally {
      setLoading(false);  // Stop loading when done
    }
  }

  async function handleClearCell(day, slot) {
    try {
      // If user is logged in, delete from Supabase first
      if (user) {
        const { deleteMealPlan } = await import('../lib/supabase');
        await deleteMealPlan(user.id, day, slot);
        console.log(`Recipe removed from ${day} ${slot} for user ${user.id}`);
      }
      
      // Then update local state
      clearCell(day, slot);
      
      if (editing?.day === day && editing?.slot === slot) {
        setEditing(null);
        setText("");
      }
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      alert("Error removing the recipe from your plan. Please try again.");
    }
  }

  return (
    <section className="container">
      <div className="plan-header">
        <h1>Weekly Meal Plan</h1>
        <div className="plan-actions">
          <button className="btn-secondary" onClick={async () => {
            try {
              if (user) {
                const { deleteAllMealPlans } = await import('../lib/supabase');
                await deleteAllMealPlans(user.id);
                console.log(`All recipes cleared for user ${user.id}`);
              }
              clearAll();
            } catch (error) {
              console.error("Error clearing meal plan:", error);
              alert("Error clearing your meal plan. Please try again.");
            }
          }}>Clear week</button>
        </div>
      </div>

      <div className="plan-grid">
        <div className="plan-corner" />
        {DAYS.map(d => <div key={d} className="plan-day">{d}</div>)}

        {SLOTS.map(slot => (
          <FragmentRow key={slot} slot={slot}>
            {DAYS.map(day => (
              <Cell
                key={day + slot}
                day={day}
                slot={slot}
                value={plan[day][slot]?.title || ""}
                onEdit={() => startEdit(day, slot)}
                onClear={() => handleClearCell(day, slot)}
              />
            ))}
          </FragmentRow>
        ))}
      </div>

      {editing && (
        <div className="plan-editor">
          <div className="card editor-card">
            <strong>Edit:</strong> {editing.day} · {editing.slot}
            <input
              autoFocus
              placeholder="Type a recipe title (e.g., Salmon Bowl)"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }}
            />
            <div className="editor-actions">
              <button className="btn" onClick={saveEdit} disabled={loading}>
                {loading ? "Adding..." : "Save"}
              </button>
              <button className="btn-secondary" onClick={() => setEditing(null)} disabled={loading}>Cancel</button>
            </div>
            <p className="muted small">Later we'll populate cells from Search results with real recipes.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function FragmentRow({ slot, children }) {
  return (
    <>
      <div className="plan-slot">{cap(slot)}</div>
      {children}
    </>
  );
}

function Cell({ day, slot, value, onEdit, onClear }) {
  return (
    <div className="plan-cell">
      {value ? (
        <div className="cell-filled">
          <span className="title">{value}</span>
          <div className="cell-actions">
            <button className="link" onClick={onEdit}>Edit</button>
            <button className="link danger" onClick={onClear}>Remove</button>
          </div>
        </div>
      ) : (
        <button className="cell-empty" onClick={onEdit}>+ Add</button>
      )}
    </div>
  );
}

function cap(s){ return s.slice(0,1).toUpperCase() + s.slice(1); }
