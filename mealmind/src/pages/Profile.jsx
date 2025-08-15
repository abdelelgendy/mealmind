import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile, supabase } from "../lib/supabase";
import { delay, retryOperation } from "../lib/utils";

export default function Profile() {
  const { user, profile, setProfile } = useAuth();
  const [form, setForm] = useState({
    calories: 2000,
    diet: "",
    allergies: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Initialize form with profile data when it's available
  useEffect(() => {
    if (profile) {
      setForm({
        calories: profile.calories || 2000,
        diet: profile.diet || "",
        allergies: profile.allergies || ""
      });
    }
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); // Set loading state
    setMessage({ type: "", text: "" });
    
    console.log("Starting profile update...");
    console.log("User ID:", user?.id);
    console.log("Form data:", form);
    
    // Always make sure loading state is reset after a reasonable time
    const safetyTimeout = setTimeout(() => {
      console.log("Safety timeout triggered - resetting loading state");
      setLoading(false);
      setMessage({ 
        type: "warning", 
        text: "Update took too long. Please check your connection and try again." 
      });
    }, 10000); // 10 seconds safety

    try {
      const updatedForm = {
        calories: parseInt(form.calories) || 2000,
        diet: form.diet.trim(),
        allergies: form.allergies.trim()
      };

      // Basic validation
      if (updatedForm.calories < 500 || updatedForm.calories > 10000) {
        setMessage({ type: "error", text: "Please enter a reasonable calorie value (500-10000)" });
        clearTimeout(safetyTimeout);
        setLoading(false);
        return;
      }

      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      console.log("Updating profile with data:", updatedForm);
      
      // DIRECT APPROACH WITH NO EXTERNAL UTILITIES
      console.log("Bypassing all utilities, direct Supabase approach");
      
      // Just insert/update directly - simplest possible approach
      const { data, error } = await supabase
        .from("profiles")
        .upsert([{ 
          id: user.id,
          calories: updatedForm.calories,
          diet: updatedForm.diet,
          allergies: updatedForm.allergies
        }]);
      
      if (error) {
        console.error("Direct upsert error:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log("Profile saved, fetching latest version");
      
      // Get the updated profile
      const { data: latestProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching updated profile:", fetchError);
        throw new Error("Profile was saved but could not be retrieved");
      }
      
      console.log("Latest profile:", latestProfile);
      
      // Update the profile in context
      setProfile(latestProfile);
      setMessage({ type: "success", text: "Preferences saved successfully" });
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Error updating profile: " + (error.message || "Unknown error") });
    } finally {
      // Always clean up and reset loading state
      clearTimeout(safetyTimeout);
      console.log("Update process complete - resetting loading state");
      setLoading(false);
    }
  }

  return (
    <section className="container">
      <h1>Profile</h1>
      
      <div className="card">
        <h2>Dietary Preferences</h2>
        <p>Email: {user?.email}</p>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="calories">Daily Calories</label>
            <input
              id="calories"
              type="number"
              min="500"
              max="10000"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              placeholder="Daily calorie target (e.g., 2000)"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="diet">Diet Type</label>
            <select
              id="diet"
              value={form.diet}
              onChange={(e) => setForm({ ...form, diet: e.target.value })}
            >
              <option value="">Any</option>
              <option value="balanced">Balanced</option>
              <option value="high-protein">High Protein</option>
              <option value="keto">Keto</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="allergies">Allergies</label>
            <input
              id="allergies"
              type="text"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder="Comma-separated list (e.g., peanuts, shellfish)"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Updating..." : "Save Preferences"}
            </button>
            {loading && <div className="loading-spinner"></div>}
          </div>
        </form>
      </div>
    </section>
  );
}
