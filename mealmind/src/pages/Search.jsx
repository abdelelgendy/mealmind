import { useEffect, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";

const MOCK = [
  { id: "r1", title: "Chicken & Rice", image: "/images/placeholder.jpg", calories: 520 },
  { id: "r2", title: "Veggie Pasta", image: "/images/placeholder.jpg", calories: 430 },
  { id: "r3", title: "Salmon Bowl", image: "/images/placeholder.jpg", calories: 610 },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [maxCals, setMaxCals] = useState("");
  const [results, setResults] = useState([]);

  // simple debounce
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // Filter MOCK locally for now; later replace with real API call
    const q = debouncedQuery.trim().toLowerCase();
    const out = MOCK.filter(r =>
      (!q || r.title.toLowerCase().includes(q)) &&
      (!maxCals || (r.calories || 0) <= Number(maxCals))
    );
    setResults(out);
  }, [debouncedQuery, maxCals, diet]);

  return (
    <section className="container">
      <h1>Search Recipes</h1>
      <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., salmon, high-protein…"
        />
        <button className="btn">Search</button>
      </form>

      <div className="filters">
        <label>
          <span className="muted">Diet</span>
          <select value={diet} onChange={(e)=>setDiet(e.target.value)}>
            <option value="">Any</option>
            <option value="balanced">Balanced</option>
            <option value="high-protein">High protein</option>
            <option value="keto">Keto</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </label>
        <label>
          <span className="muted">Max calories</span>
          <input
            type="number"
            min="0"
            placeholder="e.g., 600"
            value={maxCals}
            onChange={(e)=>setMaxCals(e.target.value)}
          />
        </label>
      </div>

      <RecipeGrid recipes={results} />
    </section>
  );
}

// tiny debounce hook
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
