import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "./componenets/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pantry from "./pages/Pantry.jsx";
import Plan from "./pages/Plan.jsx";
import Preferences from "./pages/Preferences.jsx";
import Profile from "./pages/Profile.jsx";
import Search from "./pages/Search.jsx";
import { testConnection } from "./lib/supabase";
import { testInsert } from "./lib/recipes";

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
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pantry" element={<Pantry />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
