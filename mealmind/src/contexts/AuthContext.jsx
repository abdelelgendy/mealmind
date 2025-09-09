import { createContext, useContext, useEffect, useState } from "react";
import { supabase, getCurrentUser, getProfile, getPantry, getMealPlan, logOut, getFavorites } from "../lib/supabase";
import { DEMO_PANTRY_DATA, DEMO_PROFILE } from "../constants";
import { MOCK_USER_PROFILE, MOCK_PANTRY_ITEMS, DEMO_MEAL_PLAN } from "../lib/mockData";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pantry, setPantry] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const { isOnline } = useNetworkStatus();

  // Demo/Offline mode functions
  const enableOfflineMode = () => {
    console.log("🔄 Enabling offline demo mode");
    setIsOfflineMode(true);
    setUser(MOCK_USER_PROFILE);
    setProfile(MOCK_USER_PROFILE.preferences);
    setPantry(MOCK_PANTRY_ITEMS);
    setMealPlan(DEMO_MEAL_PLAN);
    setFavorites([]);
    setLoading(false);
  };

  // Fetch user's data (profile, pantry, meal plan, favorites)
  const fetchUserData = async (userId) => {
    if (!userId || !supabase) return false;
    
    // If offline, don't try to fetch from server
    if (!isOnline) {
      console.log("Offline - skipping user data fetch");
      return false;
    }
    
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
      // If we can't fetch user data and we're offline, enable offline mode
      if (!isOnline) {
        enableOfflineMode();
        return true;
      }
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

  // Demo login when Supabase is not available
  const demoLogin = () => {
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@mealmind.com',
      created_at: new Date().toISOString()
    };
    
    setUser(demoUser);
    setProfile(DEMO_PROFILE);
    setPantry(DEMO_PANTRY_DATA);
    setMealPlan([]);
    setFavorites([]);
    setLoading(false);
    
    // More detailed alert about what's missing
    const missingVars = [];
    if (!import.meta.env.VITE_SUPABASE_URL) missingVars.push('VITE_SUPABASE_URL');
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missingVars.push('VITE_SUPABASE_ANON_KEY');
    if (!import.meta.env.VITE_SPOONACULAR_API_KEY) missingVars.push('VITE_SPOONACULAR_API_KEY');
    
    alert(`Cannot connect to database. Demo mode active.\n\nMissing environment variables: ${missingVars.join(', ')}\n\nPlease check your .env file.`);
    console.log('Demo mode activated');
    return demoUser;
  };  useEffect(() => {
    // Check for the current user when the component mounts
    const checkUser = async () => {
      try {
        console.log("AuthContext: Checking for current user");
        // Set a safety timeout to ensure loading state doesn't get stuck
        const safetyTimeout = setTimeout(() => {
          console.log("Safety timeout triggered - enabling offline mode");
          if (!user) {
            enableOfflineMode();
          } else {
            setLoading(false);
          }
        }, 7000); // 7 seconds max for loading
        
        // If offline or no Supabase, enable offline mode immediately
        if (!isOnline || !supabase) {
          console.log(isOnline ? "Supabase not available" : "Offline detected", "- enabling offline mode");
          clearTimeout(safetyTimeout);
          enableOfflineMode();
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
          // No user logged in - enable offline mode for demo
          console.log("No user logged in, enabling offline demo mode");
          clearTimeout(safetyTimeout);
          enableOfflineMode();
          return;
        }
        
        clearTimeout(safetyTimeout);
        setLoading(false);
        console.log("AuthContext: Initial loading complete");
      } catch (error) {
        console.error("Error checking user:", error);
        // Enable offline mode on error
        enableOfflineMode();
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
      } catch {
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
    isAuthenticated: !!user,
    isOfflineMode,
    isOnline,
    enableOfflineMode,
    logOut: handleLogOut,
    refreshUserData: () => user && fetchUserData(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
