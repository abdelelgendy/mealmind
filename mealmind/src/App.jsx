import { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { PlanProvider } from "./plan/PlanContext.jsx";
import Header from "./components/Header.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { initializeServices } from "./lib/initialize.js";

/**
 * Main application content component 
 * Contains layout structure and routes
 */
function AppContent() {
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Initialize services when component mounts
    initializeServices()
      .then(connected => {
        console.log(`App initialized. Supabase connected: ${connected}`);
        setIsInitializing(false);
      })
      .catch(err => {
        console.error("Error initializing app:", err);
        setIsInitializing(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main className="container">
        {isInitializing ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Initializing application...</p>
          </div>
        ) : (
          <AppRoutes />
        )}
      </main>
    </>
  );
}

/**
 * Root App component that sets up providers
 * Simplified to focus on context setup only
 */
export default function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <AppContent />
      </PlanProvider>
    </AuthProvider>
  );
}
