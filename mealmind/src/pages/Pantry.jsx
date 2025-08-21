import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import QuickSelect from '../components/QuickSelect';
import '../styles/quick-select.css';

const Pantry = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load pantry items on component mount
  useEffect(() => {
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching pantry items:', error);
        // Fallback to localStorage
        const localItems = localStorage.getItem('pantryItems');
        if (localItems) {
          setPantryItems(JSON.parse(localItems));
        }
        setError('Using offline mode');
      } else {
        setPantryItems(data || []);
        // Sync to localStorage
        localStorage.setItem('pantryItems', JSON.stringify(data || []));
        setError(null);
      }
    } catch (err) {
      console.error('Error:', err);
      // Fallback to localStorage
      const localItems = localStorage.getItem('pantryItems');
      if (localItems) {
        setPantryItems(JSON.parse(localItems));
      }
      setError('Using offline mode');
    } finally {
      setLoading(false);
    }
  };

  const addPantryItem = async (item) => {
    try {
      const itemToAdd = {
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'piece',
        added_date: new Date().toISOString()
      };

      // Try to add to Supabase
      const { data, error } = await supabase
        .from('pantry_items')
        .insert([itemToAdd])
        .select();

      if (error) {
        console.error('Error adding to Supabase:', error);
        // Add to local state and localStorage
        const newItemWithId = { ...itemToAdd, id: Date.now() };
        const updatedItems = [...pantryItems, newItemWithId];
        setPantryItems(updatedItems);
        localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
      } else {
        // Successfully added to Supabase
        setPantryItems(prev => [...prev, data[0]]);
        localStorage.setItem('pantryItems', JSON.stringify([...pantryItems, data[0]]));
      }
    } catch (err) {
      console.error('Error adding item:', err);
      // Add to local state as fallback
      const newItemWithId = { ...itemToAdd, id: Date.now() };
      const updatedItems = [...pantryItems, newItemWithId];
      setPantryItems(updatedItems);
      localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    
    if (!newItem.name.trim()) {
      alert('Please enter an item name');
      return;
    }

    await addPantryItem(newItem);
    setNewItem({ name: '', quantity: '', unit: '' });
  };

  const handleQuickAdd = async (item) => {
    await addPantryItem(item);
  };

  const removePantryItem = async (id) => {
    try {
      // Try to remove from Supabase
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing from Supabase:', error);
      }

      // Remove from local state regardless
      const updatedItems = pantryItems.filter(item => item.id !== id);
      setPantryItems(updatedItems);
      localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
    } catch (err) {
      console.error('Error removing item:', err);
      // Remove from local state as fallback
      const updatedItems = pantryItems.filter(item => item.id !== id);
      setPantryItems(updatedItems);
      localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your pantry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Pantry</h1>
        <p>Manage your ingredients and pantry items</p>
        {error && <div className="error-banner">⚠️ {error}</div>}
      </div>

      {/* Quick Select Section */}
      <QuickSelect onItemSelect={handleQuickAdd} />

      {/* Manual Add Section */}
      <div className="manual-add-section">
        <h3>Add Custom Item</h3>
        <form onSubmit={handleManualAdd} className="add-item-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            >
              <option value="">Select unit</option>
              <option value="piece">piece</option>
              <option value="cup">cup</option>
              <option value="lb">lb</option>
              <option value="oz">oz</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="liter">liter</option>
              <option value="ml">ml</option>
              <option value="tsp">tsp</option>
              <option value="tbsp">tbsp</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Item
          </button>
        </form>
      </div>

      {/* Pantry Items Display */}
      <div className="pantry-items">
        {pantryItems.length === 0 ? (
          <div className="empty-state">
            <h3>Your pantry is empty</h3>
            <p>Start by adding some items using the quick select or manual add options above.</p>
          </div>
        ) : (
          <div className="items-grid">
            {pantryItems.map((item) => (
              <div key={item.id} className="pantry-item-card">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <button
                  onClick={() => removePantryItem(item.id)}
                  className="btn btn-danger btn-sm"
                  aria-label={`Remove ${item.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pantry;
