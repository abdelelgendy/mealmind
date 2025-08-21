import React from 'react';
import { AuthProvider } from "./contexts/AuthContext";
import { PlanProvider } from "./plan/PlanContext";
import Header from "./components/Header";
import AppRoutes from "./routes/AppRoutes";

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
  try {
    return (
      <AuthProvider>
        <PlanProvider>
          <AppContent />
        </PlanProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24' }}>
        <h1>Application Error</h1>
        <p>Error: {error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }
}
