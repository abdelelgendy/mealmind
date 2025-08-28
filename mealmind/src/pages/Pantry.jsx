import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import QuickSelect from '../components/QuickSelect';
import '../styles/quick-select.css';

const Pantry = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(new Set());

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Mark item as recently added
  const markAsRecentlyAdded = (itemId) => {
    setRecentlyAdded(prev => new Set([...prev, itemId]));
    setTimeout(() => {
      setRecentlyAdded(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 3000);
  };

  // Load pantry items on component mount
  useEffect(() => {
    fetchPantryItems();
  }, []);

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
        } catch {
          // Supabase sync failed, continue with local storage
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
    setIsAdding(true);
    
    try {
      const itemToAdd = {
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'piece',
        added_date: new Date().toISOString(),
        id: Date.now() // Generate a local ID
      };

      // Always add to local state first for immediate UI update
      const updatedItems = [...pantryItems, itemToAdd];
      setPantryItems(updatedItems);
      localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
      
      // Show success notification
      showNotification(`✅ Added ${item.name} to your pantry!`);
      
      // Mark as recently added for visual highlight
      markAsRecentlyAdded(itemToAdd.id);

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
          } else {
            showNotification(`📱 ${item.name} saved locally (offline mode)`, 'info');
          }
        } catch {
          // Supabase sync failed, continue with local storage
          showNotification(`📱 ${item.name} saved locally (offline mode)`, 'info');
        }
      } else {
        showNotification(`📱 ${item.name} saved locally (offline mode)`, 'info');
      }
    } catch (err) {
      console.error('Error adding item:', err);
      showNotification(`❌ Failed to add ${item.name}. Please try again.`, 'error');
    } finally {
      setIsAdding(false);
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
          // Supabase connection failed for delete operation
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
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="page-header">
        <h1>My Pantry</h1>
        <p>Manage your ingredients and pantry items</p>
        {error && <div className="error-banner">⚠️ {error}</div>}
      </div>

      {/* Quick Select Section */}
      <QuickSelect onItemSelect={handleQuickAdd} loading={isAdding} />

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
              <div 
                key={item.id} 
                className={`pantry-item-card ${recentlyAdded.has(item.id) ? 'recently-added' : ''}`}
              >
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>
                    {item.quantity} {item.unit}
                  </p>
                  {recentlyAdded.has(item.id) && (
                    <span className="new-badge">NEW!</span>
                  )}
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
