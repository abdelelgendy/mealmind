import React, { useEffect } from 'react';
import { AuthProvider } from "./contexts/AuthContext";
import { PlanProvider } from "./plan/PlanContext";
import Header from "./components/Header";
import AppRoutes from "./routes/AppRoutes";

// Import backend health check for development
if (import.meta.env.DEV) {
  import('./lib/backendHealthCheck.js');
}

/**
 * Main application content component 
 * Contains layout structure and routes
 */
function AppContent() {
  useEffect(() => {
    // Log app initialization for debugging
    console.log('App initialized', {
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      hasSpoonacularKey: !!import.meta.env.VITE_SPOONACULAR_API_KEY
    });
  }, []);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content container fade-in">
        <AppRoutes />
      </main>
    </div>
  );
}

/**
 * Root App component that sets up providers
 * Provides authentication and meal plan context to the entire app
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
