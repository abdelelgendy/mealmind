import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./componenets/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pantry from "./pages/Pantry.jsx";
import Plan from "./pages/Plan.jsx";
import Preferences from "./pages/Preferences.jsx";
import Profile from "./pages/Profile.jsx";
import Search from "./pages/Search.jsx";

export default function App() {
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
