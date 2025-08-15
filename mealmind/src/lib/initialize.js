import { testConnection, supabase } from "./supabase";

/**
 * Initialize application services and connections
 * This function handles startup tasks for the application
 */
export async function initializeServices() {
  try {
    console.log("🚀 Initializing application services...");
    
    // Test Supabase connection when app initializes
    const connected = await testConnection();
    if (connected) {
      console.log("✅ Supabase connection is successful!");
      
      // Check if profiles table is accessible
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
        
      if (error) {
        console.error("⚠️ Could not access profiles table:", error.message);
      } else {
        console.log("✅ Profiles table accessible");
      }
      
    } else {
      console.warn("⚠️ Failed to connect to Supabase.");
    }
    
    // Configure Supabase with reasonable timeout
    supabase.realtime.setConfig({
      timeout: 10000 // 10 seconds
    });
    
    return connected;
  } catch (error) {
    console.error("❌ Error initializing services:", error);
    return false;
  }
}
