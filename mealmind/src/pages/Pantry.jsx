import { useEffect, useMemo, useState } from "react";
import { loadPantry, savePantry } from "../utils/storage";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Pantry() {
  const [items, setItems] = useState(() => loadPantry());
  const [form, setForm] = useState({ name: "", quantity: "", unit: "" });
  const [editingId, setEditingId] = useState(null);

  // persist on change
  useEffect(() => { savePantry(items); }, [items]);

  // derived: simple count & distinct items
  const stats = useMemo(() => ({
    count: items.length,
    totalQty: items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
  }), [items]);

  function resetForm() { setForm({ name: "", quantity: "", unit: "" }); }

  function onSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const quantity = Number(form.quantity) || 0;
    const unit = form.unit.trim();

    if (!name) return; // minimal validation

    if (editingId) {
      setItems(prev => prev.map(it =>
        it.id === editingId ? { ...it, name, quantity, unit } : it
      ));
      setEditingId(null);
    } else {
      setItems(prev => [{ id: uid(), name, quantity, unit }, ...prev]);
    }
    resetForm();
  }

  function onEdit(id) {
    const it = items.find(x => x.id === id);
    if (!it) return;
    setForm({ name: it.name, quantity: String(it.quantity ?? ""), unit: it.unit ?? "" });
    setEditingId(id);
  }

  function onDelete(id) {
    setItems(prev => prev.filter(it => it.id !== id));
    if (editingId === id) {
      setEditingId(null);
      resetForm();
    }
  }

  function onClearAll() {
    if (confirm("Clear all pantry items?")) setItems([]);
  }

  return (
    <section className="container">
      <h1>Pantry</h1>
      <p className="muted">Track ingredients you have on hand. We’ll subtract these from shopping lists later.</p>

      <form className="pantry-form" onSubmit={onSubmit}>
        <input
          placeholder="Item name (e.g., chicken breast)"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Qty"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })}
        />
        <input
          placeholder="Unit (g, ml, pcs)"
          value={form.unit}
          onChange={e => setForm({ ...form, unit: e.target.value })}
        />
        <button className="btn">{editingId ? "Update" : "Add"}</button>
        {editingId && (
          <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); resetForm(); }}>
            Cancel
          </button>
        )}
      </form>

      <div className="pantry-toolbar">
        <span className="muted">{stats.count} items • total qty {stats.totalQty}</span>
        {items.length > 0 && (
          <button className="btn-secondary" onClick={onClearAll}>Clear all</button>
        )}
      </div>

      <ul className="pantry-list">
        {items.map(it => (
          <li key={it.id} className="pantry-row">
            <div className="pantry-info">
              <strong>{it.name}</strong>
              <span className="muted">
                {it.quantity || 0} {it.unit || ""}
              </span>
            </div>
            <div className="row-actions">
              <button className="link" onClick={() => onEdit(it.id)}>Edit</button>
              <button className="link danger" onClick={() => onDelete(it.id)}>Delete</button>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="muted">No items yet. Add your first ingredient above.</li>
        )}
      </ul>
    </section>
  );
}
