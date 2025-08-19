import { testConnection, supabase } from "./supabase";

/**
 * Initialize application services and connections
 * This function handles startup tasks for the application
 */
export async function initializeServices() {
  try {
    console.log("🚀 Initializing application services...");
    
    // Simplified initialization - just test connection with timeout
    const connected = await Promise.race([
      testConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000))
    ]);
    
    if (connected) {
      console.log("✅ Supabase connection is successful!");
    } else {
      console.warn("⚠️ Failed to connect to Supabase.");
    }
    
    return connected;
  } catch (error) {
    console.error("❌ Error initializing services:", error);
    // Return false but don't fail completely
    return false;
  }
}
