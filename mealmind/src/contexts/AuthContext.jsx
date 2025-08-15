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
  const [error, setError] = useState(null);

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
        console.log("AuthContext: Checking for current user");
        // Set a safety timeout to ensure loading state doesn't get stuck
        const safetyTimeout = setTimeout(() => {
          console.log("Safety timeout triggered - forcing loading to complete");
          setLoading(false);
        }, 7000); // 7 seconds max for loading
        
        const currentUser = await getCurrentUser();
        console.log("AuthContext: Current user check result:", currentUser ? "Found user" : "No user");
        setUser(currentUser);
        
        if (currentUser) {
          // Add a timeout for the fetchUserData call too
          const dataTimeout = setTimeout(() => {
            console.log("Data fetch timeout triggered");
            setLoading(false);
          }, 5000);
          
          try {
            await fetchUserData(currentUser.id);
            clearTimeout(dataTimeout);
          } catch (err) {
            console.error("Error in fetchUserData:", err);
            clearTimeout(dataTimeout);
            // Continue even if we can't fetch all data
          }
        }
        
        clearTimeout(safetyTimeout);
        setLoading(false);
        console.log("AuthContext: Initial loading complete");
      } catch (error) {
        console.error("Error checking user:", error);
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthContext: Auth state changed:", event);
        // Set a safety timeout for auth state changes too
        const safetyTimeout = setTimeout(() => {
          console.log("Auth state change safety timeout triggered");
          setLoading(false);
        }, 5000);
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            console.log("AuthContext: User authenticated, fetching data");
            // Don't wait indefinitely for data fetch on auth change
            const fetchPromise = fetchUserData(currentUser.id);
            const timeoutPromise = new Promise(resolve => {
              setTimeout(() => {
                console.log("Auth state change data fetch timeout");
                resolve(false);
              }, 3000);
            });
            
            await Promise.race([fetchPromise, timeoutPromise]);
          } catch (error) {
            console.error("Error fetching user data on auth change:", error);
          }
        } else {
          console.log("AuthContext: No user in session, resetting data");
          // Reset user data on sign out
          setProfile(null);
          setPantry([]);
          setMealPlan([]);
        }
        
        clearTimeout(safetyTimeout);
        setLoading(false);
        console.log("AuthContext: Auth state change handling complete");
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
    setProfile: (newProfile) => {
      console.log("Setting new profile in context:", newProfile);
      setProfile(newProfile);
    },
    pantry,
    setPantry,
    mealPlan,
    setMealPlan,
    loading,
    error,
    isAuthenticated: !!user,
    logOut: handleLogOut,
    refreshUserData: () => user && fetchUserData(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
