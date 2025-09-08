import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard.jsx";
import Pantry from "../pages/Pantry.jsx";
import Plan from "../pages/Plan.jsx";
import Preferences from "../pages/Preferences.jsx";
import Profile from "../pages/Profile.jsx";
import Search from "../pages/Search.jsx";
import Favorites from "../pages/Favorites.jsx";
import SignUp from "../pages/SignUp.jsx";
import LogIn from "../pages/LogIn.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import DebugPage from "../components/DebugPage.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

/**
 * AppRoutes component that contains all route definitions
 * Extracted from App.jsx for better organization and maintainability
 */
export default function AppRoutes() {
  const { user, profile, mealPlan } = useAuth();
  
  return (
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
            <Plan mealPlan={mealPlan} />
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
            <Profile user={user} profile={profile} />
          </ProtectedRoute>
        } 
      />
      <Route path="/search" element={<Search />} />
      <Route 
        path="/favorites" 
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        } 
      />
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
