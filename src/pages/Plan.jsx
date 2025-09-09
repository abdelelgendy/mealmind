import { useEffect, useState, useRef } from "react";
import { usePlan } from "../plan/PlanContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  saveMealPlan, 
  getMealPlan, 
  deleteMealPlan, 
  deleteAllMealPlans, 
  getMealTracking, 
  trackMeal, 
  supabase 
} from "../lib/supabase";
import AddToPlanDialog from "../components/AddToPlanDialog";
import MealTrackingSummary from "../components/MealTrackingSummary";
import { useDrag, useDrop } from "react-dnd";

const ITEM_TYPE = "RECIPE";

export default function Plan() {
  const { plan, setCell, clearCell, clearAll, DAYS, SLOTS, refreshPlan } = usePlan();
  const { user, refreshUserData } = useAuth();
  const [editing, setEditing] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [mealTracking, setMealTracking] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const navigate = useNavigate();
  const isPerformingOperation = useRef(false);
  const [isExternalUpdate, setIsExternalUpdate] = useState(false);

  // Load meal plan when user changes
  useEffect(() => {
    if (!user) return;
    
    setSyncStatus("Loading your meal plan...");
    setLoading(true);
    
    const loadMealPlan = async () => {
      try {
        const userMealPlan = await getMealPlan(user.id);
        setSyncStatus("Meal plan loaded successfully");
        
        if (userMealPlan?.length) {
          refreshPlan(userMealPlan);
        }
      } catch (error) {
        console.error("Failed to load meal plan:", error);
        setSyncStatus("Failed to load meal plan");
      } finally {
        setLoading(false);
        setTimeout(() => setSyncStatus(""), 3000);
      }
    };

    loadMealPlan();
  }, [user, refreshPlan]);

  // Subscribe to real-time meal plan changes
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase.channel('public:meal_plans')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_plans',
          filter: `user_id=eq.${user.id}`
        },
        payload => {
          if (isPerformingOperation.current) return;
          
          setIsExternalUpdate(true);
          
          const { eventType } = payload;
          if (eventType === "INSERT" || eventType === "UPDATE") {
            const { day, slot, recipe_id, title, image } = payload.new;
            if (day && slot) {
              setCell(day, slot, { id: recipe_id, title, image });
            }
          }

          if (eventType === "DELETE") {
            const { day, slot } = payload.old;
            if (day && slot) {
              setCell(day, slot, null);
            }
          }
          
          setTimeout(() => setIsExternalUpdate(false), 500);
        }
      )
      .subscribe();

    return () => {
      try { 
        supabase.removeChannel(channel); 
      } catch (error) {
        console.error("Error removing channel:", error);
      }
    };
  }, [user, setCell]);

  // Load meal tracking data
  useEffect(() => {
    if (!user) return;

    const loadMealTracking = async () => {
      try {
        const tracking = await getMealTracking(user.id);
        const trackingMap = {};
        tracking.forEach(t => {
          const key = `${t.day}-${t.slot}`;
          trackingMap[key] = t.completed;
        });
        setMealTracking(trackingMap);
      } catch (error) {
        console.error("Failed to load meal tracking:", error);
      }
    };

    loadMealTracking();
  }, [user]);

  const updateMealPlan = async (day, slot, recipe) => {
    if (!user) {
      setCell(day, slot, recipe);
      return;
    }

    setLoading(true);
    setSyncStatus(recipe ? "Saving recipe..." : "Removing recipe...");
    
    try {
      isPerformingOperation.current = true;
      
      if (recipe) {
        await saveMealPlan(user.id, day, slot, recipe);
        setSyncStatus("Recipe saved");
      } else {
        await deleteMealPlan(user.id, day, slot);
        setSyncStatus("Recipe removed");
      }
      
      if (!isExternalUpdate) {
        setCell(day, slot, recipe);
      }
    } catch (error) {
      console.error("Failed to update meal plan:", error);
      setSyncStatus("Failed to save changes");
    } finally {
      setLoading(false);
      setTimeout(() => {
        isPerformingOperation.current = false;
        setSyncStatus("");
      }, 1000);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { day, slot } = editing;
    const title = text.trim();
    
    const recipe = title ? { 
      title, 
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2)
    } : null;

    await updateMealPlan(day, slot, recipe);
    setEditing(null);
    setText("");
  };

  const handleRecipeAdd = async (recipe, dayIndex, slotIndex) => {
    await updateMealPlan(dayIndex, slotIndex, recipe);
    setOpenDialog(false);
    setSelectedRecipe(null);
  };

  const handleMealTrack = async (day, slot) => {
    if (!user) return;

    const key = `${day}-${slot}`;
    const isCompleted = !mealTracking[key];
    
    try {
      await trackMeal(user.id, day, slot, isCompleted);
      setMealTracking(prev => ({ ...prev, [key]: isCompleted }));
    } catch (error) {
      console.error("Failed to track meal:", error);
    }
  };

  const clearAllMeals = async () => {
    if (!user) {
      clearAll();
      return;
    }

    if (!confirm("Clear your entire meal plan? This cannot be undone.")) return;

    setLoading(true);
    setSyncStatus("Clearing all meals...");
    
    try {
      await deleteAllMealPlans(user.id);
      clearAll();
      setSyncStatus("All meals cleared");
    } catch (error) {
      console.error("Failed to clear all meals:", error);
      setSyncStatus("Failed to clear meals");
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(""), 3000);
    }
  };

  const DraggableCell = ({ day, slot, recipe }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      item: { recipe, sourceDay: day, sourceSlot: slot },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [{ isOver }, drop] = useDrop({
      accept: ITEM_TYPE,
      drop: (item) => {
        if (item.sourceDay !== day || item.sourceSlot !== slot) {
          updateMealPlan(day, slot, item.recipe);
          updateMealPlan(item.sourceDay, item.sourceSlot, recipe);
        }
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    });

    const cellRef = useRef();
    drag(drop(cellRef));

    const isEditing = editing?.day === day && editing?.slot === slot;
    const isTracked = mealTracking[`${day}-${slot}`];

    return (
      <td
        ref={cellRef}
        className={`plan-cell ${isOver ? 'drop-target' : ''} ${isDragging ? 'dragging' : ''} ${isTracked ? 'tracked' : ''}`}
      >
        {isEditing ? (
          <div className="edit-mode">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") setEditing(null);
              }}
              placeholder="Recipe name..."
              autoFocus
              className="input"
            />
            <div className="edit-actions">
              <button onClick={saveEdit} className="btn btn--sm">Save</button>
              <button onClick={() => setEditing(null)} className="btn btn--secondary btn--sm">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="cell-content">
            {recipe ? (
              <div className="recipe-item">
                {recipe.image && (
                  <img src={recipe.image} alt={recipe.title} className="recipe-thumb" />
                )}
                <div className="recipe-info">
                  <div className="recipe-title">{recipe.title}</div>
                  <div className="recipe-actions">
                    <button
                      onClick={() => setEditing({ day, slot })}
                      className="btn btn--ghost btn--sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => updateMealPlan(day, slot, null)}
                      className="btn btn--ghost btn--sm"
                    >
                      Remove
                    </button>
                    {user && (
                      <button
                        onClick={() => handleMealTrack(day, slot)}
                        className={`btn btn--sm ${isTracked ? 'btn--success' : 'btn--secondary'}`}
                      >
                        {isTracked ? '✓ Eaten' : 'Mark Eaten'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-cell">
                <button
                  onClick={() => setEditing({ day, slot })}
                  className="btn btn--ghost"
                >
                  Add Recipe
                </button>
                <button
                  onClick={() => {
                    setEditing({ day, slot });
                    setOpenDialog(true);
                  }}
                  className="btn btn--secondary"
                >
                  Browse Recipes
                </button>
              </div>
            )}
          </div>
        )}
      </td>
    );
  };

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <div className="auth-prompt">
            <h2>Sign in to create your meal plan</h2>
            <p>Keep track of your weekly meals and sync across devices.</p>
            <button onClick={() => navigate("/login")} className="btn">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="plan-header">
          <h1>Weekly Meal Plan</h1>
          
          <div className="plan-controls">
            {syncStatus && (
              <div className="sync-status">{syncStatus}</div>
            )}
            
            <button
              onClick={clearAllMeals}
              className="btn btn--secondary"
              disabled={loading}
            >
              Clear All
            </button>
            
            <button
              onClick={() => navigate("/search")}
              className="btn"
            >
              Add Recipes
            </button>
          </div>
        </div>

        {user && <MealTrackingSummary tracking={mealTracking} />}

        <div className="plan-table-container">
          <table className="plan-table">
            <thead>
              <tr>
                <th>Day</th>
                {SLOTS.map(slot => (
                  <th key={slot}>{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIndex) => (
                <tr key={day}>
                  <td className="day-label">{day}</td>
                  {SLOTS.map((slot, slotIndex) => (
                    <DraggableCell
                      key={`${day}-${slot}`}
                      day={dayIndex}
                      slot={slotIndex}
                      recipe={plan[dayIndex]?.[slotIndex]}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {openDialog && (
          <AddToPlanDialog
            open={openDialog}
            onClose={() => {
              setOpenDialog(false);
              setEditing(null);
            }}
            onAddToPlan={handleRecipeAdd}
            selectedDay={editing?.day}
            selectedSlot={editing?.slot}
          />
        )}
      </div>
    </div>
  );
}
