import { testConnection } from "./supabase";

/**
 * Initialize application services and connections
 * This function handles startup tasks for the application
 */
export async function initializeServices() {
  try {
    // Test Supabase connection when app initializes
    const connected = await testConnection();
    if (connected) {
      console.log("✅ Supabase connection is successful!");
    } else {
      console.warn("⚠️ Failed to connect to Supabase.");
    }
    return connected;
  } catch (error) {
    console.error("❌ Error initializing services:", error);
    return false;
  }
}
