import { useState } from "react";
import { logIn } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      await logIn(email, password);
      setStatus("success");
      navigate("/"); // Redirect to home page after successful login
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('Supabase client not initialized')) {
        setError("Database connection unavailable. Please try again later or contact support.");
      } else {
        setError(err.message);
      }
      setStatus("idle");
    }
  };

  return (
    <section className="container">
      <h1>Log In</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Logging In..." : "Log In"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </section>
  );
}
