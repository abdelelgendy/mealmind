import { useEffect, useMemo, useState } from "react";
import { loadPantry, savePantry } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { savePantry as saveUserPantry } from "../lib/supabase";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Pantry() {
  const { user, pantry: userPantry, setPantry } = useAuth();
  const [items, setItems] = useState(() => user ? userPantry : loadPantry());
  const [form, setForm] = useState({ name: "", quantity: "", unit: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use user pantry when available
  useEffect(() => {
    if (user && userPantry) {
      setItems(userPantry);
    }
  }, [user, userPantry]);

  // persist on change
  useEffect(() => { 
    if (!user) {
      // Local storage for non-authenticated users
      savePantry(items); 
    }
  }, [items, user]);

  // derived: simple count & distinct items
  const stats = useMemo(() => ({
    count: items.length,
    totalQty: items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
  }), [items]);

  function resetForm() { setForm({ name: "", quantity: "", unit: "" }); }

  async function onSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const quantity = Number(form.quantity) || 0;
    const unit = form.unit.trim();

    if (!name) return; // minimal validation
    
    setLoading(true);
    
    try {
      let updatedItems;
      
      if (editingId) {
        // Update an existing item
        updatedItems = items.map(it =>
          it.id === editingId ? { ...it, name, quantity, unit } : it
        );
      } else {
        // Add a new item
        const newItem = { 
          id: uid(), 
          name, 
          quantity, 
          unit 
        };
        updatedItems = [newItem, ...items];
      }
      
      // Update local state
      setItems(updatedItems);
      
      // If user is logged in, save to Supabase
      if (user) {
        await saveUserPantry(user.id, updatedItems);
        setPantry(updatedItems); // Update the auth context
        console.log("Pantry saved to Supabase");
      }
      
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error("Error saving pantry item:", error);
      alert("Error saving pantry item. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onEdit(id) {
    const it = items.find(x => x.id === id);
    if (!it) return;
    setForm({ name: it.name, quantity: String(it.quantity ?? ""), unit: it.unit ?? "" });
    setEditingId(id);
  }

  async function onDelete(id) {
    setLoading(true);
    
    try {
      const updatedItems = items.filter(it => it.id !== id);
      
      // Update local state
      setItems(updatedItems);
      
      // If user is logged in, save to Supabase
      if (user) {
        await saveUserPantry(user.id, updatedItems);
        setPantry(updatedItems); // Update the auth context
        console.log("Updated pantry saved to Supabase after item deletion");
      }
      
      if (editingId === id) {
        setEditingId(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting pantry item:", error);
      alert("Error deleting pantry item. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onClearAll() {
    if (confirm("Clear all pantry items?")) {
      setLoading(true);
      
      try {
        // Update local state
        setItems([]);
        
        // If user is logged in, save to Supabase
        if (user) {
          await saveUserPantry(user.id, []);
          setPantry([]); // Update the auth context
          console.log("Cleared pantry in Supabase");
        }
      } catch (error) {
        console.error("Error clearing pantry:", error);
        alert("Error clearing pantry. Please try again.");
      } finally {
        setLoading(false);
      }
    }
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
        <button className="btn" disabled={loading}>
          {loading ? "Saving..." : (editingId ? "Update" : "Add")}
        </button>
        {editingId && !loading && (
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
