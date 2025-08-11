import { useEffect, useState } from "react";
import { loadPrefs, savePrefs } from "../utils/storage";

export default function Preferences() {
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // optional: show a tiny “saved” flash after save
    if (saved) {
      const t = setTimeout(() => setSaved(false), 1200);
      return () => clearTimeout(t);
    }
  }, [saved]);

  function onSubmit(e) {
    e.preventDefault();
    const caloriesNum = Number(prefs.calories) || 0;
    const next = {
      calories: caloriesNum,
      diet: prefs.diet.trim(),
      allergies: prefs.allergies.trim(), // comma-separated string for now
    };
    savePrefs(next);
    setPrefs(next);
    setSaved(true);
  }

  return (
    <section className="container">
      <h1>Preferences</h1>
      <p className="muted">These guide search and meal planning. You can change them anytime.</p>

      <form className="prefs-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Daily calories</span>
          <input
            type="number"
            min="800"
            max="6000"
            placeholder="e.g., 2200"
            value={prefs.calories}
            onChange={(e) => setPrefs({ ...prefs, calories: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Diet</span>
          <select
            value={prefs.diet}
            onChange={(e) => setPrefs({ ...prefs, diet: e.target.value })}
          >
            <option value="">Any</option>
            <option value="balanced">Balanced</option>
            <option value="high-protein">High protein</option>
            <option value="keto">Keto</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </label>

        <label className="field field-wide">
          <span>Allergies (comma-separated)</span>
          <input
            type="text"
            placeholder="peanut, gluten, shellfish"
            value={prefs.allergies}
            onChange={(e) => setPrefs({ ...prefs, allergies: e.target.value })}
          />
        </label>

        <div className="actions">
          <button className="btn">Save</button>
          {saved && <span className="muted">Saved ✓</span>}
        </div>
      </form>
    </section>
  );
}
