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
    if (!userId) return;
    
    try {
      const [userProfile, userPantry, userMealPlan] = await Promise.all([
        getProfile(userId),
        getPantry(userId),
        getMealPlan(userId)
      ]);

      setProfile(userProfile);
      setPantry(userPantry || []);
      setMealPlan(userMealPlan || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
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
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserData(currentUser.id);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserData(currentUser.id);
        } else {
          // Reset user data on sign out
          setProfile(null);
          setPantry([]);
          setMealPlan([]);
        }
        
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
