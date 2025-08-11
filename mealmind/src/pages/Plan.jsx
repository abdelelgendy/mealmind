import { useState } from "react";
import { usePlan } from "../plan/PlanContext";

export default function Plan() {
  const { plan, setCell, clearCell, clearAll, DAYS, SLOTS } = usePlan();
  const [editing, setEditing] = useState(null);
  const [text, setText] = useState("");

  function startEdit(day, slot) {
    setEditing({ day, slot });
    setText(plan[day][slot]?.title ?? "");
  }
  
  function saveEdit() {
    if (!editing) return;
    const { day, slot } = editing;
    const title = text.trim();
    setCell(day, slot, title ? { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title } : null);
    setEditing(null);
    setText("");
  }

  function handleClearCell(day, slot) {
    clearCell(day, slot);
    if (editing?.day === day && editing?.slot === slot) {
      setEditing(null);
      setText("");
    }
  }

  return (
    <section className="container">
      <div className="plan-header">
        <h1>Weekly Meal Plan</h1>
        <div className="plan-actions">
          <button className="btn-secondary" onClick={clearAll}>Clear week</button>
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
              <button className="btn" onClick={saveEdit}>Save</button>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
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
