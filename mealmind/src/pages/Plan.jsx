import { useEffect, useState } from "react";
import { usePlan } from "../plan/PlanContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { saveMealPlan, getMealPlan, deleteMealPlan, deleteAllMealPlans } from "../lib/supabase";
import AddToPlanDialog from "../components/AddToPlanDialog";
import MealTrackingSummary from "../components/MealTrackingSummary";
import { useDrag, useDrop } from "react-dnd";

// Define a type for drag and drop operations
const ITEM_TYPE = "RECIPE";

export default function Plan() {
  const { plan, setCell, clearCell, clearAll, DAYS, SLOTS, refreshPlan } = usePlan();
  const { user, refreshUserData } = useAuth();
  const [editing, setEditing] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(""); // For showing sync status messages
  const [mealTracking, setMealTracking] = useState({}); // Store meal tracking status
  const [openDialog, setOpenDialog] = useState(false); // Toggle recipe selection dialog
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Recipe being added to the plan
  
  const navigate = useNavigate();
  
  // When user changes, refresh the plan from Supabase - only on initial mount or user change
  useEffect(() => {
    if (!user) {
      // Redirect to login if no user
      //navigate("/login");
      return;
    }
    
    console.log("User logged in, loading their meal plan");
    setSyncStatus("Loading your meal plan...");
    setLoading(true);
    
    // Using a flag to prevent recursive calls
    let isMounted = true;
    
    // Fetch user's meal plan from Supabase
    async function fetchMealPlan() {
      try {
        const userMealPlan = await getMealPlan(user.id);
        
        if (isMounted) {
          console.log("Loaded meal plan from Supabase:", userMealPlan);
          setSyncStatus("Meal plan loaded successfully");
          
          // Don't call refreshUserData here as it creates a loop
          // The AuthContext already loads meal plans on user login
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading meal plan:", error);
          setSyncStatus("Error loading your meal plan");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          // Clear status after a few seconds
          setTimeout(() => setSyncStatus(""), 3000);
        }
      }
    }
    
    fetchMealPlan();
    
    return () => {
      isMounted = false; // Clean up to prevent state updates if component unmounts
    };
  }, [user, navigate]);
  
  function startEdit(day, slot) {
    setEditing({ day, slot });
    setText(plan[day]?.[slot]?.title ?? "");
  }
  
  function openAddRecipeDialog(day, slot) {
    setEditing({ day, slot });
    setOpenDialog(true);
  } // Only depend on user, not refreshUserData

  function startEdit(day, slot) {
    setEditing({ day, slot });
    setText(plan[day][slot]?.title ?? "");
  }
  
  async function saveEdit() {
    if (!editing) return;
    const { day, slot } = editing;
    const title = text.trim();
    
    setLoading(true);
    setSyncStatus("Saving recipe...");
    
    try {
      if (title) {
        const newRecipe = { 
          title, 
          id: crypto.randomUUID?.() || Math.random().toString(36).slice(2)
        };
        
        // If the user is logged in, save to Supabase first
        if (user) {
          await saveMealPlan(user.id, day, slot, newRecipe);
          console.log(`Recipe ${title} saved to ${day} ${slot} for user ${user.id}`);
          setSyncStatus("Recipe saved to your account");
          
          // Refresh user data to keep everything in sync
          await refreshUserData();
        } else {
          // For guests, just update local state
          setCell(day, slot, newRecipe);
          setSyncStatus("Recipe saved locally");
        }
      } else {
        // Empty title means remove
        if (user) {
          await deleteMealPlan(user.id, day, slot);
          await refreshUserData();
        }
        setCell(day, slot, null);
      }
      
      setEditing(null);
      setText("");
    } catch (error) {
      console.error("Error saving meal plan:", error);
      setSyncStatus("Error saving recipe");
      alert("Error saving the recipe. Please try again.");
    } finally {
      setLoading(false);
      // Clear status after a few seconds
      setTimeout(() => setSyncStatus(""), 3000);
    }
  }

  // Handle clearing a single cell
  async function handleClearCell(day, slot) {
    try {
      setLoading(true);
      
      // If user is logged in, delete from Supabase first
      if (user) {
        setSyncStatus("Removing recipe...");
        await deleteMealPlan(user.id, day, slot);
        console.log(`Recipe removed from ${day} ${slot} for user ${user.id}`);
        setSyncStatus("Recipe removed");
      }
      
      // Then update local state
      clearCell(day, slot);
      
      if (editing?.day === day && editing?.slot === slot) {
        setEditing(null);
        setText("");
      }
      
      // If user is logged in, refresh their data to keep everything in sync
      if (user) {
        await refreshUserData();
      }
      
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      setSyncStatus("Error removing recipe");
      alert("Error removing the recipe from your plan. Please try again.");
    } finally {
      setLoading(false);
      // Clear status after a few seconds
      setTimeout(() => setSyncStatus(""), 3000);
    }
  }
  
  // Handle clearing the entire week
  async function handleClearWeek() {
    // Prevent executing if already loading
    if (loading) return;
    
    setLoading(true);
    setSyncStatus("Clearing meal plan...");
    
    try {
      if (user) {
        await deleteAllMealPlans(user.id);
        console.log(`All recipes cleared for user ${user.id}`);
        
        // Refresh user data to keep everything in sync
        await refreshUserData();
        setSyncStatus("Meal plan cleared");
      }
      
      // Always clear local state
      clearAll();
    } catch (error) {
      console.error("Error clearing meal plan:", error);
      setSyncStatus("Error clearing meal plan");
      alert("Error clearing your meal plan. Please try again.");
    } finally {
      setLoading(false);
      // Clear status after a few seconds
      setTimeout(() => setSyncStatus(""), 3000);
    }
  }
  
  // Handle refreshing the meal plan
  async function handleRefresh() {
    // Prevent executing if already loading
    if (loading) return;
    
    setLoading(true);
    setSyncStatus("Refreshing meal plan...");
    
    try {
      await refreshUserData();
      
      // Also refresh meal tracking data
      if (user) {
        const userMealTracking = await getMealTracking(user.id);
        if (userMealTracking && userMealTracking.length) {
          // Convert array to object for easier lookup
          const trackingObj = {};
          userMealTracking.forEach(item => {
            const key = `${item.day}-${item.slot}`;
            trackingObj[key] = item.status;
          });
          setMealTracking(trackingObj);
        }
      }
      
      setSyncStatus("Meal plan refreshed");
    } catch (error) {
      console.error("Error refreshing meal plan:", error);
      setSyncStatus("Error refreshing meal plan");
    } finally {
      setLoading(false);
      // Clear status after a few seconds
      setTimeout(() => setSyncStatus(""), 3000);
    }
  }
  
  // Handle meal tracking
  async function handleTrackMeal(day, slot, status) {
    if (!user) {
      alert("Please log in to track meals");
      return;
    }
    
    try {
      // Get meal info for better messages
      const mealTitle = plan[day][slot]?.title || "Meal";
      
      // If status is empty, we're toggling off
      if (status === '') {
        // Update local state first for immediate feedback
        setMealTracking(prev => {
          const newTracking = {...prev};
          delete newTracking[`${day}-${slot}`];
          return newTracking;
        });
        
        // Then save to Supabase (status empty = remove tracking)
        await trackMeal(user.id, day, slot, '');
        console.log(`Tracking removed for ${mealTitle} on ${day} ${slot}`);
        
        // Show quick feedback
        setSyncStatus(`Tracking removed for ${mealTitle}`);
      } else {
        // Update local state first for immediate feedback
        setMealTracking(prev => ({
          ...prev,
          [`${day}-${slot}`]: status
        }));
        
        // Then save to Supabase
        await trackMeal(user.id, day, slot, status);
        console.log(`${mealTitle} on ${day} ${slot} marked as ${status}`);
        
        // Show descriptive feedback based on status
        const statusMsg = status === 'made' 
          ? `${mealTitle} marked as prepared` 
          : `${mealTitle} marked as consumed`;
        
        setSyncStatus(statusMsg);
      }
      
      setTimeout(() => setSyncStatus(""), 2000);
    } catch (error) {
      console.error("Error tracking meal:", error);
      setSyncStatus("Error tracking meal");
      setTimeout(() => setSyncStatus(""), 3000);
    }
  }

  return (
    <section className="container">
      <div className="plan-header">
        <h1>Weekly Meal Plan</h1>
        <div className="plan-actions">
          {syncStatus && <div className="sync-status">{syncStatus}</div>}
          <button 
            className="btn-secondary" 
            onClick={() => handleClearWeek()}
            disabled={loading}
            type="button"
          >
            {loading ? "Clearing..." : "Clear week"}
          </button>
          {user && (
            <button 
              className="btn-secondary" 
              onClick={() => handleRefresh()}
              disabled={loading}
              type="button"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
      
      {/* Show meal tracking summary if user is logged in */}
      {user && (
        <MealTrackingSummary 
          mealTracking={mealTracking} 
          plan={plan} 
          days={DAYS} 
          slots={SLOTS} 
        />
      )}

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
                trackingStatus={mealTracking[`${day}-${slot}`]}
                onTrackMeal={user ? handleTrackMeal : null}
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
              <button className="btn" onClick={saveEdit} disabled={loading}>
                {loading ? "Adding..." : "Save"}
              </button>
              <button className="btn-secondary" onClick={() => setEditing(null)} disabled={loading}>Cancel</button>
            </div>
            <p className="muted small">You can type a recipe name or search for saved recipes.</p>
          </div>
        </div>
      )}
      
      <AddToPlanDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        recipe={selectedRecipe}
        onAddToPlan={(recipe, day, slot) => {
          if (editing) {
            setCell(editing.day, editing.slot, {
              id: recipe.id,
              title: recipe.title
            });
            if (user) {
              saveMealPlan(user.id, editing.day, editing.slot, {
                id: recipe.id,
                title: recipe.title
              });
            }
          }
          setOpenDialog(false);
          setEditing(null);
        }}
      />
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

function Cell({ day, slot, value, onEdit, onClear, trackingStatus, onTrackMeal }) {
  const recipe = value ? { title: value } : null;
  
  return (
    <PlanCell 
      day={day} 
      slot={slot} 
      recipe={recipe} 
      onEdit={onEdit}
      onClear={onClear}
      trackingStatus={trackingStatus}
      onTrackMeal={onTrackMeal}
    />
  );
}

function PlanCell({ day, slot, recipe, onEdit, onClear, trackingStatus, onTrackMeal }) {
  const { moveRecipe } = usePlan();
  
  // Configure drop target
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (draggedItem) => {
      // Only process if we're dropping onto a different cell
      if (draggedItem.day !== day || draggedItem.slot !== slot) {
        moveRecipe(draggedItem.day, draggedItem.slot, day, slot);
      }
    },
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  });
  
  // Configure drag source (only if we have a recipe)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { day, slot, recipe },
    canDrag: !!recipe, // Only allow dragging if there's a recipe
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  }), [day, slot, recipe]);
  
  return (
    <div 
      ref={drop} 
      className={`plan-cell ${isOver ? "hover" : ""}`}
    >
      {recipe ? (
        <div 
          ref={drag} 
          className={`cell-filled ${isDragging ? "dragging" : ""}`}
          style={{ opacity: isDragging ? 0.5 : 1 }}
        >
          <span className="title">{recipe.title}</span>
          <div className="cell-actions">
            <button className="link" onClick={onEdit}>Edit</button>
            <button className="link danger" onClick={onClear}>Remove</button>
          </div>
          
          {onTrackMeal && (
            <div className="meal-tracking">
              <button 
                className={`meal-tracking-btn ${trackingStatus === 'made' ? 'made' : ''}`}
                onClick={() => onTrackMeal(day, slot, trackingStatus === 'made' ? '' : 'made')}
                title={trackingStatus === 'made' ? 'Prepared' : 'Mark as prepared'}
                aria-label={trackingStatus === 'made' ? 'Prepared' : 'Mark as prepared'}
              >
                {trackingStatus === 'made' ? '👨‍🍳' : '🍳'}
              </button>
              <button 
                className={`meal-tracking-btn ${trackingStatus === 'eaten' ? 'eaten' : ''}`}
                onClick={() => onTrackMeal(day, slot, trackingStatus === 'eaten' ? '' : 'eaten')}
                title={trackingStatus === 'eaten' ? 'Consumed' : 'Mark as consumed'}
                aria-label={trackingStatus === 'eaten' ? 'Consumed' : 'Mark as consumed'}
              >
                {trackingStatus === 'eaten' ? '✅' : '🍽️'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="cell-empty" onClick={onEdit}>+ Add</button>
      )}
    </div>
  );
}

function cap(s){ return s.slice(0,1).toUpperCase() + s.slice(1); }
