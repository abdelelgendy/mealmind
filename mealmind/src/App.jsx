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
import { testInsert } from "./lib/recipes";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  useEffect(() => {
    // Test connection when app loads
    testConnection().then(success => {
      if (success) {
        console.log("Supabase connection is successful!");
        // After successful connection, test inserting a recipe
        testInsert();
      } else {
        console.log("Failed to connect to Supabase.");
      }
    });
  }, []);

  return (
    <AuthProvider>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route 
            path="/pantry" 
            element={
              <ProtectedRoute>
                <Pantry />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plan" 
            element={
              <ProtectedRoute>
                <Plan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/preferences" 
            element={
              <ProtectedRoute>
                <Preferences />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="/search" element={<Search />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
