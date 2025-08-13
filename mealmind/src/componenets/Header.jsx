import { useState } from "react";
import { NavLink } from "react-router-dom";
import { logOut } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="logo">MealMind</div>

      <button
        className="hamburger"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(o => !o)}
      >
        <span /><span /><span />
      </button>

      <nav
        id="site-menu"
        className={`nav ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}  // close after clicking a link
      >
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/pantry">Pantry</NavLink>
        <NavLink to="/plan">Meal Plan</NavLink>
        <NavLink to="/search">Search</NavLink>
        {user ? (
          <>
            <NavLink to="/profile">Profile</NavLink>
            <button 
              className="nav-button" 
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await logOut();
                } catch (error) {
                  console.error("Error logging out:", error);
                }
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log In</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
