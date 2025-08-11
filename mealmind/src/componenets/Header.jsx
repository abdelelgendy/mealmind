import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);

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
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </header>
  );
}
