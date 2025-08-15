import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile, supabase } from "../lib/supabase";

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
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    console.log("Starting profile update...");
    console.log("User ID:", user?.id);
    console.log("Form data:", form);

    try {
      const updatedForm = {
        calories: parseInt(form.calories) || 2000,
        diet: form.diet.trim(),
        allergies: form.allergies.trim()
      };

      // Basic validation
      if (updatedForm.calories < 500 || updatedForm.calories > 10000) {
        setMessage({ type: "error", text: "Please enter a reasonable calorie value (500-10000)" });
        setLoading(false);
        return;
      }

      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      // Update profile in Supabase - with a longer timeout
      console.log("Updating profile with data:", updatedForm);
      
      let updateSuccess = false;
      let updateAttempts = 0;
      let updatedProfile;
      const maxAttempts = 2;
      
      while (!updateSuccess && updateAttempts < maxAttempts) {
        updateAttempts++;
        try {
          console.log(`Profile update attempt ${updateAttempts}...`);
          
          // Create a timeout promise that rejects after 10 seconds (increased from 5)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Profile update timed out after 10 seconds (attempt ${updateAttempts})`)), 10000);
          });
          
          // Race the actual update against the timeout
          updatedProfile = await Promise.race([
            updateProfile(user.id, updatedForm),
            timeoutPromise
          ]);
          
          if (updatedProfile && updatedProfile.length > 0) {
            updateSuccess = true;
            break;
          } else {
            console.warn(`No profile data returned from update attempt ${updateAttempts}`);
            // Wait a bit before retrying
            if (updateAttempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (attemptError) {
          console.error(`Error in profile update attempt ${updateAttempts}:`, attemptError);
          // Wait before retrying
          if (updateAttempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw attemptError; // Re-throw on final attempt
          }
        }
      }
      
      console.log("Final update response:", updatedProfile);
      
      if (updateSuccess) {
        console.log("Profile updated successfully:", updatedProfile[0]);
        setProfile(updatedProfile[0]);
        setMessage({ type: "success", text: "Preferences updated successfully" });
      } else {
        console.warn("All profile update attempts failed, using direct insert fallback");
        try {
          console.log("Attempting direct upsert as fallback");
          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from("profiles")
            .upsert([{ id: user.id, ...updatedForm }], {
              onConflict: 'id',
              returning: 'representation'
            })
            .select();
            
          if (fallbackError) {
            console.error("Direct upsert failed:", fallbackError);
            setMessage({ type: "error", text: "Could not save preferences" });
          } else if (fallbackProfile && fallbackProfile.length > 0) {
            console.log("Fallback upsert succeeded:", fallbackProfile[0]);
            setProfile(fallbackProfile[0]);
            setMessage({ type: "success", text: "Preferences saved successfully" });
          } else {
            setMessage({ type: "warning", text: "Preferences may have been saved but could not be confirmed" });
          }
        } catch (insertError) {
          console.error("Error in fallback upsert:", insertError);
          setMessage({ type: "error", text: "Failed to save preferences" });
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Error updating profile: " + (error.message || "Unknown error") });
    } finally {
      console.log("Update process complete");
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
