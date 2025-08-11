import "../styles/Header.css";
//Nav bar for application 

import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">MealMind</div>

      {/* Hamburger (mobile) */}
      <button
        className="hamburger"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(o => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Nav */}
      <nav id="site-menu" className={`nav ${open ? "is-open" : ""}`}onClick={()=> setOpen(false)}>
        <a href="#">Home</a>
        <a href="#">Pantry</a>
        <a href="#">Meal Plan</a>
        <a href="#">Profile</a>
      </nav>
    </header>
  );
}
