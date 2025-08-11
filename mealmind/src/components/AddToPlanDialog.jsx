import { useState } from "react";
import Modal from "./Modal";
import { usePlan } from "../plan/PlanContext";

export default function AddToPlanDialog({ open, onClose, recipe }) {
  const { DAYS, SLOTS, setCell } = usePlan();
  const [day, setDay] = useState(DAYS[0]);
  const [slot, setSlot] = useState(SLOTS[0]);

  function add() {
    if (!recipe) return;
    setCell(day, slot, { id: recipe.id || recipe.title, title: recipe.title });
    onClose?.();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3>Add to plan</h3>
      <p className="muted">{recipe?.title}</p>
      <div className="row" style={{ marginTop: ".75rem" }}>
        <select value={day} onChange={e=>setDay(e.target.value)}>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={slot} onChange={e=>setSlot(e.target.value)}>
          {SLOTS.map(s => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
        <button className="btn" onClick={add}>Add</button>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

function cap(s){ return s[0].toUpperCase()+s.slice(1); }
