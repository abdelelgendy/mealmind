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

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Pantry items state changed:', pantryItems.length, 'items');
  }, [pantryItems]);

  const fetchPantryItems = async () => {
    try {
      setLoading(true);
      
      // Always load from localStorage first for immediate display
      const localItems = localStorage.getItem('pantryItems');
      if (localItems) {
        const parsedItems = JSON.parse(localItems);
        setPantryItems(parsedItems);
        setError(null);
      }

      // Try to sync with Supabase in the background if available
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('pantry_items')
            .select('*')
            .order('name');

          if (!error && data) {
            setPantryItems(data);
            localStorage.setItem('pantryItems', JSON.stringify(data));
            setError(null);
          } else {
            console.log('Supabase fetch failed, using local storage');
            setError('Using offline mode');
          }
        } catch (supabaseError) {
          console.log('Supabase connection failed, using local storage');
          setError('Using offline mode');
        }
      } else {
        setError('Using offline mode - no database connection');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Using offline mode');
    } finally {
      setLoading(false);
    }
  };

  const addPantryItem = async (item) => {
    console.log('addPantryItem called with:', item);
    try {
      const itemToAdd = {
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'piece',
        added_date: new Date().toISOString(),
        id: Date.now() // Generate a local ID
      };

      console.log('Item to add:', itemToAdd);

      // Always add to local state first for immediate UI update
      const updatedItems = [...pantryItems, itemToAdd];
      console.log('Current pantryItems:', pantryItems);
      console.log('New updatedItems:', updatedItems);
      setPantryItems(updatedItems);
      localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
      
      console.log('Added to localStorage, pantry now has:', updatedItems.length, 'items');
      
      // Force a re-render by triggering a state change
      setTimeout(() => {
        console.log('Checking state after timeout:', pantryItems.length);
      }, 100);

      // Try to sync with Supabase in the background (optional)
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('pantry_items')
            .insert([{ ...itemToAdd, id: undefined }]) // Remove local ID for Supabase
            .select();

          if (!error && data && data[0]) {
            // Update the item with Supabase ID
            const itemsWithSupabaseId = updatedItems.map(localItem => 
              localItem.id === itemToAdd.id ? { ...localItem, id: data[0].id } : localItem
            );
            setPantryItems(itemsWithSupabaseId);
            localStorage.setItem('pantryItems', JSON.stringify(itemsWithSupabaseId));
          }
        } catch (supabaseError) {
          console.log('Supabase sync failed, using local storage only');
        }
      }
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add item. Please try again.');
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
    console.log('QuickAdd called with:', item);
    await addPantryItem(item);
  };

  const removePantryItem = async (id) => {
    try {
      // Always remove from local state first for immediate UI update
      const updatedItems = pantryItems.filter(item => item.id !== id);
      setPantryItems(updatedItems);
      localStorage.setItem('pantryItems', JSON.stringify(updatedItems));

      // Try to sync with Supabase in the background if available
      if (supabase) {
        try {
          const { error } = await supabase
            .from('pantry_items')
            .delete()
            .eq('id', id);

          if (error) {
            console.log('Supabase delete failed, using local storage only');
          }
        } catch (supabaseError) {
          console.log('Supabase connection failed for delete operation');
        }
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
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

      {/* Debug Info */}
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
        <strong>Debug Info:</strong> 
        <br />Items in state: {pantryItems.length}
        <br />Items in localStorage: {localStorage.getItem('pantryItems') ? JSON.parse(localStorage.getItem('pantryItems')).length : 0}
        <br />Error: {error || 'None'}
        <br />Loading: {loading ? 'Yes' : 'No'}
        <br />
        <button onClick={() => {
          console.log('Test button clicked');
          setPantryItems([...pantryItems, { id: Date.now(), name: 'Test Item', quantity: 1, unit: 'piece' }]);
        }}>
          Test Add Item
        </button>
        <button onClick={() => {
          console.log('Refresh from localStorage');
          const localItems = localStorage.getItem('pantryItems');
          if (localItems) {
            setPantryItems(JSON.parse(localItems));
          }
        }}>
          Refresh from localStorage
        </button>
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
