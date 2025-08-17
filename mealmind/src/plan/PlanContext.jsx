import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMealPlan, saveMealPlan, deleteMealPlan } from "../lib/supabase";
import { supabase } from "../lib/supabase";

// Constants
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["breakfast", "lunch", "dinner"];
const LOCAL_STORAGE_KEY_PREFIX = "mealmind_plan_";

// Create an empty plan structure
function emptyPlan() {
  return DAYS.reduce((acc, d) => {
    acc[d] = SLOTS.reduce((m, s) => (m[s] = null, m), {});
    return acc;
  }, {});
}

// Convert flat Supabase meal plan array to structured plan object
function convertDbPlanToLocalPlan(mealPlanArray) {
  const planObj = emptyPlan();
  
  if (Array.isArray(mealPlanArray)) {
    mealPlanArray.forEach(item => {
      if (item && item.day && item.slot) {
        planObj[item.day][item.slot] = {
          id: item.recipe_id,
          title: item.title
        };
      }
    });
  }
  
  return planObj;
}

const PlanCtx = createContext(null);
export const usePlan = () => useContext(PlanCtx);

export function PlanProvider({ children }) {
  const { user, mealPlan: userMealPlan } = useAuth();
  const [plan, setPlan] = useState(emptyPlan());
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  
  // Initialize from local storage or empty plan
  useEffect(() => {
    // If not logged in, try to get from local storage
    if (!user) {
      try {
        const localStorageKey = LOCAL_STORAGE_KEY_PREFIX + "guest";
        const savedPlan = localStorage.getItem(localStorageKey);
        if (savedPlan) {
          setPlan(JSON.parse(savedPlan));
        }
      } catch (error) {
        console.error("Error loading plan from local storage:", error);
      }
    }
  }, [user]);
  
  // Set up real-time subscription to meal plan changes
  useEffect(() => {
    if (!user) return;
    
    setSyncStatus("Connecting to real-time updates...");
    
    // Subscribe to changes on the meal_plans table for this user
    const subscription = supabase
      .channel('meal_plans_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meal_plans',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Real-time update received:', payload);
        setSyncStatus("Syncing changes...");
        
        // Refresh the plan data when changes are detected
        refreshPlan();
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setSyncStatus("Connected to real-time updates");
        }
      });
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  
  // When the user changes or userMealPlan changes, update the plan
  useEffect(() => {
    if (user && userMealPlan) {
      console.log("Setting plan from user meal plan:", userMealPlan);
      setPlan(convertDbPlanToLocalPlan(userMealPlan));
    }
  }, [user, userMealPlan]);

  // Save to local storage when plan changes (only for guests)
  useEffect(() => {
    if (!user) {
      try {
        const localStorageKey = LOCAL_STORAGE_KEY_PREFIX + "guest";
        localStorage.setItem(localStorageKey, JSON.stringify(plan));
      } catch (error) {
        console.error("Error saving plan to local storage:", error);
      }
    }
  }, [plan, user]);

  // Update a cell in the meal plan
  function setCell(day, slot, recipe) {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: recipe } }));
  }
  
  // Clear a cell in the meal plan
  function clearCell(day, slot) {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: null } }));
  }
  
  // Clear the entire meal plan
  function clearAll() { 
    setPlan(emptyPlan()); 
  }
  
  // Move a recipe from one slot to another
  async function moveRecipe(fromDay, fromSlot, toDay, toSlot) {
    try {
      // Get the recipe being moved
      const movingRecipe = plan[fromDay]?.[fromSlot];
      if (!movingRecipe) return; // Nothing to move
      
      // If the destination has a recipe, we're essentially swapping
      const destinationRecipe = plan[toDay]?.[toSlot];
      
      // Update local state first for immediate feedback
      setCell(toDay, toSlot, movingRecipe);
      setCell(fromDay, fromSlot, null);
      
      // If user is logged in, update Supabase
      if (user) {
        setSyncStatus("Moving recipe...");
        
        // Remove from old slot
        await deleteMealPlan(user.id, fromDay, fromSlot);
        
        // Add to new slot
        await saveMealPlan(user.id, toDay, toSlot, movingRecipe);
        
        setSyncStatus("Recipe moved");
        setTimeout(() => setSyncStatus(""), 2000);
      }
    } catch (error) {
      console.error("Error moving recipe:", error);
      setSyncStatus("Error moving recipe");
      setTimeout(() => setSyncStatus(""), 3000);
    }
  }
  
  // Load user's meal plan from Supabase (useful for manual refresh)
  async function refreshPlan() {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userMealPlan = await getMealPlan(user.id);
      setPlan(convertDbPlanToLocalPlan(userMealPlan || []));
    } catch (error) {
      console.error("Error refreshing meal plan:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PlanCtx.Provider value={{ 
      plan, 
      setCell, 
      clearCell, 
      clearAll,
      moveRecipe,
      refreshPlan,
      DAYS, 
      SLOTS, 
      isLoading,
      syncStatus,
      setSyncStatus,
      isAuthenticated: !!user
    }}>
      {children}
    </PlanCtx.Provider>
  );
}
