import { useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/base.css';

const Preferences = () => {
  const { user } = useContext(AuthContext);
  const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    allergies: [],
    cuisine_preferences: [],
    calorie_goal: 2000,
    protein_goal: 150,
    carb_goal: 250,
    fat_goal: 65
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
    'keto', 'paleo', 'low-carb', 'low-fat'
  ];

  const allergyOptions = [
    'nuts', 'dairy', 'eggs', 'soy', 'wheat', 'fish', 
    'shellfish', 'sesame'
  ];

  const cuisineOptions = [
    'italian', 'mexican', 'asian', 'american', 'mediterranean', 
    'indian', 'french', 'chinese', 'japanese', 'thai'
  ];

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          dietary_restrictions: data.dietary_restrictions || [],
          allergies: data.allergies || [],
          cuisine_preferences: data.cuisine_preferences || [],
          calorie_goal: data.calorie_goal || 2000,
          protein_goal: data.protein_goal || 150,
          carb_goal: data.carb_goal || 250,
          fat_goal: data.fat_goal || 65
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNumberChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const savePreferences = async () => {
    if (!user || !supabase) {
      alert('Please log in to save preferences');
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving preferences:', error);
        alert('Error saving preferences. Please try again.');
      } else {
        alert('Preferences saved successfully!');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="preferences-page">
        <div className="loading-spinner">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="preferences-page">
      <div className="preferences-container">
        <h1>My Preferences</h1>
        
        <div className="preferences-section">
          <h2>Dietary Restrictions</h2>
          <div className="checkbox-grid">
            {dietaryOptions.map(option => (
              <label key={option} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={preferences.dietary_restrictions.includes(option)}
                  onChange={() => handleArrayChange('dietary_restrictions', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="preferences-section">
          <h2>Allergies</h2>
          <div className="checkbox-grid">
            {allergyOptions.map(option => (
              <label key={option} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={preferences.allergies.includes(option)}
                  onChange={() => handleArrayChange('allergies', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="preferences-section">
          <h2>Cuisine Preferences</h2>
          <div className="checkbox-grid">
            {cuisineOptions.map(option => (
              <label key={option} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={preferences.cuisine_preferences.includes(option)}
                  onChange={() => handleArrayChange('cuisine_preferences', option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="preferences-section">
          <h2>Daily Goals</h2>
          <div className="goals-grid">
            <div className="goal-item">
              <label>Calories</label>
              <input
                type="number"
                value={preferences.calorie_goal}
                onChange={(e) => handleNumberChange('calorie_goal', e.target.value)}
                min="1000"
                max="5000"
              />
            </div>
            <div className="goal-item">
              <label>Protein (g)</label>
              <input
                type="number"
                value={preferences.protein_goal}
                onChange={(e) => handleNumberChange('protein_goal', e.target.value)}
                min="50"
                max="300"
              />
            </div>
            <div className="goal-item">
              <label>Carbs (g)</label>
              <input
                type="number"
                value={preferences.carb_goal}
                onChange={(e) => handleNumberChange('carb_goal', e.target.value)}
                min="50"
                max="500"
              />
            </div>
            <div className="goal-item">
              <label>Fat (g)</label>
              <input
                type="number"
                value={preferences.fat_goal}
                onChange={(e) => handleNumberChange('fat_goal', e.target.value)}
                min="20"
                max="200"
              />
            </div>
          </div>
        </div>

        <div className="preferences-actions">
          <button 
            onClick={savePreferences}
            disabled={saving}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
