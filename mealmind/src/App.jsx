import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { PlanProvider } from "./plan/PlanContext.jsx";
import Header from "./componenets/Header.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { initializeServices } from "./lib/initialize.js";

/**
 * Main application content component 
 * Contains layout structure and routes
 */
function AppContent() {
  useEffect(() => {
    // Initialize services when component mounts
    initializeServices();
  }, []);

  return (
    <>
      <Header />
      <main className="container">
        <AppRoutes />
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
