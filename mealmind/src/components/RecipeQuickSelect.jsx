import React, { useState, memo } from 'react';
import { RECIPE_QUICK_SELECT_OPTIONS } from '../constants/quickSelectItems';
import { useAuth } from '../contexts/AuthContext';
import '../styles/quick-select.css';

const RecipeQuickSelect = memo(({ onQuickSearch, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState('Popular Searches');
  const [showProfileMatch, setShowProfileMatch] = useState(false);
  const { profile } = useAuth();

  // Get all categories
  const categories = Object.keys(RECIPE_QUICK_SELECT_OPTIONS);

  // Get items for the selected category
  const getItemsForCategory = (category) => {
    return RECIPE_QUICK_SELECT_OPTIONS[category] || [];
  };

  const handleQuickSearch = (option) => {
    onQuickSearch(option.query);
    
    // Scroll down to show search results
    setTimeout(() => {
      const searchResults = document.querySelector('.search-results, .recipe-grid, .smart-recipe-grid');
      if (searchResults) {
        searchResults.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      } else {
        // If no results section found, scroll down by viewport height
        window.scrollBy({ 
          top: window.innerHeight * 0.6, 
          behavior: 'smooth' 
        });
      }
    }, 100);
  };

  // Generate profile-based search suggestions
  const getProfileBasedSuggestions = () => {
    if (!profile) return [];
    
    const suggestions = [];
    
    // Add diet-based suggestions
    if (profile.diet) {
      const dietLower = profile.diet.toLowerCase();
      if (dietLower.includes('vegetarian')) {
        suggestions.push({ query: 'vegetarian', emoji: '🥕', description: 'Vegetarian recipes for you' });
      }
      if (dietLower.includes('vegan')) {
        suggestions.push({ query: 'vegan', emoji: '🌱', description: 'Vegan recipes for you' });
      }
      if (dietLower.includes('keto')) {
        suggestions.push({ query: 'keto', emoji: '🥑', description: 'Keto recipes for you' });
      }
      if (dietLower.includes('protein')) {
        suggestions.push({ query: 'high protein', emoji: '💪', description: 'High protein recipes for you' });
      }
      if (dietLower.includes('low carb')) {
        suggestions.push({ query: 'low carb', emoji: '🥩', description: 'Low carb recipes for you' });
      }
      if (dietLower.includes('gluten')) {
        suggestions.push({ query: 'gluten free', emoji: '🌾', description: 'Gluten-free recipes for you' });
      }
      if (dietLower.includes('paleo')) {
        suggestions.push({ query: 'paleo', emoji: '🦴', description: 'Paleo recipes for you' });
      }
    }

    // Add calorie-based suggestions
    if (profile.calories) {
      if (profile.calories <= 1500) {
        suggestions.push({ query: 'low calorie healthy', emoji: '🥗', description: 'Low calorie recipes' });
      } else if (profile.calories >= 2500) {
        suggestions.push({ query: 'high calorie protein', emoji: '🍖', description: 'High calorie recipes' });
      }
    }

    // Add allergy-safe suggestions
    if (profile.allergies) {
      const allergiesLower = profile.allergies.toLowerCase();
      if (allergiesLower.includes('dairy')) {
        suggestions.push({ query: 'dairy free', emoji: '🥥', description: 'Dairy-free recipes' });
      }
      if (allergiesLower.includes('nut') || allergiesLower.includes('peanut')) {
        suggestions.push({ query: 'nut free', emoji: '🚫🥜', description: 'Nut-free recipes' });
      }
      if (allergiesLower.includes('gluten')) {
        suggestions.push({ query: 'gluten free', emoji: '🌾', description: 'Gluten-free recipes' });
      }
    }

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  };

  const currentItems = showProfileMatch ? getProfileBasedSuggestions() : getItemsForCategory(selectedCategory);

  return (
    <div className="quick-select recipe-quick-select">
      <div className="quick-select-header">
        <h3>Quick Recipe Search</h3>
        
        {/* Profile Match Toggle */}
        {profile && (
          <div className="profile-match-toggle">
            <button
              className={`toggle-btn ${showProfileMatch ? 'active' : ''}`}
              onClick={() => setShowProfileMatch(!showProfileMatch)}
              disabled={loading}
            >
              {showProfileMatch ? '👤 My Preferences' : '🎯 Match Profile'}
            </button>
          </div>
        )}
      </div>

      {!showProfileMatch && (
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
              disabled={loading}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="recipe-options-grid">
        {currentItems.length > 0 ? (
          currentItems.map((option, index) => (
            <button
              key={`${option.query}-${index}`}
              className="recipe-option"
              onClick={() => handleQuickSearch(option)}
              disabled={loading}
            >
              <span className="emoji">{option.emoji}</span>
              <div className="option-info">
                <span className="query">{option.query}</span>
                <span className="description">{option.description}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="no-suggestions">
            <p>👤 Set up your profile preferences to get personalized recipe suggestions!</p>
          </div>
        )}
      </div>

      {showProfileMatch && profile && (
        <div className="profile-info">
          <small>
            Based on your preferences: 
            {profile.diet && ` ${profile.diet}`}
            {profile.calories && ` • ${profile.calories} cal`}
            {profile.allergies && ` • Avoiding ${profile.allergies}`}
          </small>
        </div>
      )}
    </div>
  );
});

export default RecipeQuickSelect;
