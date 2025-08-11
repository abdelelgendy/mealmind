import { useEffect, useRef, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import { searchRecipes } from "../lib/recipes";

export default function Search() {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [maxCals, setMaxCals] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [error, setError] = useState(null);

  // debounce
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // abortable fetch when inputs change
  const abortRef = useRef();
  useEffect(() => {
    // avoid empty searches
    if (!debounced && !diet && !maxCals) {
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    async function run() {
      try {
        setStatus("loading");
        setError(null);
        const data = await searchRecipes({
          query: debounced,
          diet,
          maxCalories: maxCals || undefined,
          number: 24,
          signal: ctrl.signal
        });

        // if maxCals provided, also filter client-side as a safety net
        const filtered = maxCals
          ? data.filter(r => !r.calories || r.calories <= Number(maxCals))
          : data;

        setResults(filtered);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") return;
        setStatus("error");
        setError(err.message || "Search failed");
      }
    }
    run();

    return () => ctrl.abort();
  }, [debounced, diet, maxCals]);

  return (
    <section className="container">
      <h1>Search Recipes</h1>

      <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., salmon, high-protein…"
        />
        <button className="btn" onClick={() => setDebounced(query)}>Search</button>
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

      {status === "idle" && <p className="muted">Type a query to search recipes.</p>}
      {status === "loading" && <p className="muted">Searching…</p>}
      {status === "error" && <p className="muted" style={{ color: "#b91c1c" }}>{error}</p>}
      {status === "success" && <RecipeGrid recipes={results} />}
    </section>
  );
}
