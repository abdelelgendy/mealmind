import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "./componenets/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pantry from "./pages/Pantry.jsx";
import Plan from "./pages/Plan.jsx";
import Preferences from "./pages/Preferences.jsx";
import Profile from "./pages/Profile.jsx";
import Search from "./pages/Search.jsx";
import SignUp from "./pages/SignUp.jsx";
import LogIn from "./pages/LogIn.jsx";
import { testConnection } from "./lib/supabase";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { PlanProvider } from "./plan/PlanContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Main app component
function AppContent() {
  const { user, profile, pantry, mealPlan } = useAuth();

  useEffect(() => {
    // Test connection when app loads
    testConnection().then(success => {
      if (success) {
        console.log("Supabase connection is successful!");
      } else {
        console.log("Failed to connect to Supabase.");
      }
    });
  }, []);

  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route 
            path="/pantry" 
            element={
              <ProtectedRoute>
                <Pantry pantryItems={pantry} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plan" 
            element={
              <ProtectedRoute>
                <Plan mealPlan={mealPlan} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/preferences" 
            element={
              <ProtectedRoute>
                <Preferences profile={profile} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile user={user} profile={profile} />
              </ProtectedRoute>
            } 
          />
          <Route path="/search" element={<Search />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

// Root component that provides the AuthContext
export default function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <AppContent />
      </PlanProvider>
    </AuthProvider>
  );
}
