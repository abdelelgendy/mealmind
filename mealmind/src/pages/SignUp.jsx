import { useState } from "react";
import { signUp } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");

    const { data, error } = await signUp(email, password);
    
    if (error) {
      console.error('Signup error:', error);
      if (error.message.includes('Supabase client not initialized')) {
        setError("Database connection unavailable. Using demo mode.");
        // Use demo login to auto-login after "signup"
        if (demoLogin) {
          await demoLogin();
          setStatus("success");
          alert("Demo account created! You are now logged in.");
          navigate("/");
          return;
        }
      } else {
        setError(error.message);
      }
      setStatus("idle");
    } else {
      setStatus("success");
      alert("Sign up successful! Please check your email for confirmation.");
      navigate("/login"); // Redirect to login page after signup
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
