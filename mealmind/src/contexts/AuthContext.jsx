import { createContext, useContext, useEffect, useState } from "react";
import { supabase, getCurrentUser, getProfile, getPantry, getMealPlan, logOut } from "../lib/supabase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pantry, setPantry] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's data (profile, pantry, meal plan)
  const fetchUserData = async (userId) => {
    if (!userId) return false;
    
    try {
      const [userProfile, userPantry, userMealPlan] = await Promise.all([
        getProfile(userId),
        getPantry(userId),
        getMealPlan(userId)
      ]);

      setProfile(userProfile);
      setPantry(userPantry || []);
      setMealPlan(userMealPlan || []);
      return true;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return false;
    }
  };

  // Handle logout
  const handleLogOut = async () => {
    try {
      await logOut();
      setUser(null);
      setProfile(null);
      setPantry([]);
      setMealPlan([]);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    // Check for the current user when the component mounts
    const checkUser = async () => {
      try {
        // Set a safety timeout to ensure loading state doesn't get stuck
        const safetyTimeout = setTimeout(() => {
          console.log("Safety timeout triggered - forcing loading to complete");
          setLoading(false);
        }, 5000); // 5 seconds max for loading
        
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserData(currentUser.id);
        }
        
        clearTimeout(safetyTimeout);
        setLoading(false);
      } catch (error) {
        console.error("Error checking user:", error);
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Set a safety timeout for auth state changes too
        const safetyTimeout = setTimeout(() => {
          console.log("Auth state change safety timeout triggered");
          setLoading(false);
        }, 5000);
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            await fetchUserData(currentUser.id);
          } catch (error) {
            console.error("Error fetching user data on auth change:", error);
          }
        } else {
          // Reset user data on sign out
          setProfile(null);
          setPantry([]);
          setMealPlan([]);
        }
        
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    profile,
    setProfile,
    pantry,
    setPantry,
    mealPlan,
    setMealPlan,
    loading,
    isAuthenticated: !!user,
    logOut: handleLogOut,
    refreshUserData: () => user && fetchUserData(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
