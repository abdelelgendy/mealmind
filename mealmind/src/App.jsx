import React from 'react';
import { AuthProvider } from "./contexts/AuthContext";
import { PlanProvider } from "./plan/PlanContext";
import Header from "./components/Header";
import AppRoutes from "./routes/AppRoutes";
import { testSupabaseConnection } from "./lib/testSupabase";
import "./lib/test-supabase"; // Import to run the hardcoded test

// Test connection on app load
if (import.meta.env.DEV) {
  testSupabaseConnection();
}

/**
 * Main application content component 
 * Contains layout structure and routes
 */
function AppContent() {
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
