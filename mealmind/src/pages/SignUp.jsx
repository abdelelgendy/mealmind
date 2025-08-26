import { useState } from "react";
import { signUp } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
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
      await signUp(email, password);
      setStatus("success");
      alert("Sign up successful! Please check your email for confirmation.");
      navigate("/login"); // Redirect to login page after signup
    } catch (err) {
      console.error('Signup error:', err);
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
      <h1>Sign Up</h1>
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
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <button className="btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Signing Up..." : "Sign Up"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </section>
  );
}
