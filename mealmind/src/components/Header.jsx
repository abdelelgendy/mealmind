import { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { logOut } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";

const NAVIGATION_ITEMS = [
  { to: ROUTES.HOME, label: "Home", end: true },
  { to: ROUTES.PANTRY, label: "Pantry" },
  { to: "/plan", label: "Meal Plan" },
  { to: "/search", label: "Search" }
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await logOut();
      closeMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [closeMenu]);

  return (
    <header className="header">
      <div className="logo hover-glow">
        <NavLink to={ROUTES.HOME} className="logo-link">
          MealMind
        </NavLink>
      </div>

      <button
        className="hamburger"
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
        aria-controls="site-menu"
        onClick={toggleMenu}
      >
        <span /><span /><span />
      </button>

      <nav
        id="site-menu"
        className={`nav ${isMenuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
      >
        {NAVIGATION_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'nav-link--active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
        
        {user ? (
          <>
            <NavLink 
              to="/profile"
              className={({ isActive }) => 
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              Profile
            </NavLink>
            <button 
              className="nav-button nav-button--logout" 
              onClick={handleLogout}
              type="button"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink 
              to="/login"
              className={({ isActive }) => 
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              Log In
            </NavLink>
            <NavLink 
              to="/signup"
              className={({ isActive }) => 
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              Sign Up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
