import React, { useState } from 'react';
import { QUICK_SELECT_PANTRY_ITEMS, MOST_COMMON_PANTRY_ITEMS } from '../constants/quickSelectItems';
import '../styles/quick-select.css';

const QuickSelect = ({ onItemSelect, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState('Most Common');
  const [searchTerm, setSearchTerm] = useState('');

  // Get all categories including "Most Common"
  const categories = ['Most Common', ...Object.keys(QUICK_SELECT_PANTRY_ITEMS)];

  // Get items for the selected category
  const getItemsForCategory = (category) => {
    if (category === 'Most Common') {
      return MOST_COMMON_PANTRY_ITEMS;
    }
    return QUICK_SELECT_PANTRY_ITEMS[category] || [];
  };

  // Filter items based on search term
  const filteredItems = getItemsForCategory(selectedCategory).filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickAdd = (item) => {
    console.log('QuickSelect handleQuickAdd called with:', item);
    const itemToPass = {
      name: item.name,
      quantity: item.quantity,
      unit: item.unit
    };
    console.log('Calling onItemSelect with:', itemToPass);
    onItemSelect(itemToPass);
  };

  return (
    <div className="quick-select">
      <div className="quick-select-header">
        <h3>Quick Add Items</h3>
        <p className="muted">Click any item to add it to your pantry with default quantities</p>
      </div>

      <div className="quick-select-controls">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="quick-select-search"
        />
      </div>

      <div className="quick-select-categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="quick-select-grid">
        {filteredItems.length === 0 ? (
          <p className="muted">No items found matching "{searchTerm}"</p>
        ) : (
          filteredItems.map((item, index) => (
            <button
              key={`${item.name}-${index}`}
              className="quick-select-item"
              onClick={() => handleQuickAdd(item)}
              disabled={loading}
              title={`Add ${item.quantity} ${item.unit} of ${item.name}`}
            >
              <span className="item-emoji">{item.emoji}</span>
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">
                {item.quantity} {item.unit}
              </span>
            </button>
          ))
        )}
      </div>

      {selectedCategory === 'Most Common' && (
        <div className="quick-select-tip">
          💡 <strong>Tip:</strong> These are the most commonly used ingredients. Browse other categories for more options!
        </div>
      )}
    </div>
  );
};

export default QuickSelect;
