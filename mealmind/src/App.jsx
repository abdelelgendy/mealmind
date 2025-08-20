import { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { PlanProvider } from "./plan/PlanContext.jsx";
import Header from "./components/Header.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

/**
 * Main application content component 
 * Contains layout structure and routes
 */
function AppContent() {
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Simple initialization without external services
    console.log("App: Starting initialization...");
    setTimeout(() => {
      console.log("App: Initialization complete");
      setIsInitializing(false);
    }, 1000);
  }, []);

  if (isInitializing) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading MealMind...</h2>
        <div className="loading-spinner"></div>
        <p>Initializing application...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      <main className="container">
        <AppRoutes />
      </main>
    </div>
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
