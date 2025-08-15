// Helper function for adding delays
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry function for database operations
export async function retryOperation(operation, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}`);
      const result = await operation();
      console.log(`Operation succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`Waiting ${delayMs}ms before next attempt`);
        await delay(delayMs);
        // Increase delay for next attempt (exponential backoff)
        delayMs *= 1.5;
      }
    }
  }
  
  throw lastError || new Error(`Operation failed after ${maxRetries} attempts`);
}
