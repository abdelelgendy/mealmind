import { createContext, useContext, useEffect, useState } from "react";
import { supabase, getCurrentUser, getProfile, getPantry, getMealPlan, logOut, getFavorites } from "../lib/supabase";
import { DEMO_PANTRY_DATA, DEMO_PROFILE } from "../constants";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pantry, setPantry] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's data (profile, pantry, meal plan, favorites)
  const fetchUserData = async (userId) => {
    if (!userId || !supabase) return false;
    
    try {
      console.log("Fetching user data for:", userId);
      const [userProfile, userPantry, userMealPlan, userFavorites] = await Promise.all([
        getProfile(userId),
        getPantry(userId),
        getMealPlan(userId),
        getFavorites(userId)
      ]);

      console.log("User data fetched successfully");
      setProfile(userProfile);
      setPantry(userPantry || []);
      setMealPlan(userMealPlan || []);
      setFavorites(userFavorites || []);
      return true;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return false;
    }
  };

  // Handle logout
  const handleLogOut = async () => {
    try {
      if (supabase) {
        await logOut();
      }
      setUser(null);
      setProfile(null);
      setPantry([]);
      setMealPlan([]);
      setFavorites([]);
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
        
        if (!supabase) {
          console.log("Supabase not available, using demo data");
          setPantry(DEMO_PANTRY_DATA);
          setProfile(DEMO_PROFILE);
          clearTimeout(safetyTimeout);
          setLoading(false);
          return;
        }
        
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
        } else {
          // No user logged in - use demo data for testing
          console.log("No user logged in, using demo data for testing");
          setPantry(DEMO_PANTRY_DATA);
          setProfile(DEMO_PROFILE);
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
    
    // Listen for auth state changes (only if Supabase is initialized)
    if (!supabase || !supabase.auth) {
      console.warn("AuthContext: Supabase not initialized - skipping auth state subscription");
      return;
    }

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
        
        if (currentUser && supabase) {
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
          setFavorites([]);
        }
        
        clearTimeout(safetyTimeout);
        setLoading(false);
        console.log("AuthContext: Auth state change handling complete");
      }
    );
    
    return () => {
      try {
        if (authListener && authListener.subscription) {
          authListener.subscription.unsubscribe();
        }
      } catch (e) {
        // no-op
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
    favorites,
    setFavorites,
    loading,
    error,
    isAuthenticated: !!user,
    logOut: handleLogOut,
    refreshUserData: () => user && fetchUserData(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
