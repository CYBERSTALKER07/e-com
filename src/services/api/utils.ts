// API utilities with retry mechanism and better error handling

// Maximum number of retry attempts for API calls
const MAX_RETRIES = 3;
// Base delay in milliseconds (will be multiplied by attempt number)
const BASE_DELAY = 300;

/**
 * Performs an API request with automatic retries on certain failure conditions
 * 
 * @param apiCall - Promise-returning function that makes the actual API call
 * @param retryCount - Current retry attempt (used internally)
 * @returns Promise with the API response
 */
export async function withRetry<T>(
  apiCall: () => Promise<T>, 
  retryCount = 0
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    // Only retry on network errors or 5xx server errors
    const shouldRetry = (
      retryCount < MAX_RETRIES && 
      (error.message?.includes('fetch') || 
       error.status >= 500 || 
       error.code === 'ECONNREFUSED')
    );
    
    if (shouldRetry) {
      // Exponential backoff with jitter
      const delay = Math.floor(
        BASE_DELAY * Math.pow(2, retryCount) * (0.8 + Math.random() * 0.4)
      );
      
      console.log(`API call failed, retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(apiCall, retryCount + 1);
    }
    
    // If we shouldn't retry or we're out of retries, throw the error
    throw error;
  }
}

/**
 * Provides a fallback when an API call completely fails after retries
 * 
 * @param apiCall - Function that makes the API call with retry
 * @param fallbackValue - Value to use if the API call fails
 * @param errorHandler - Optional function to handle the error
 * @returns The API result or fallback value
 */
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  errorHandler?: (error: any) => void
): Promise<T> {
  try {
    return await withRetry(apiCall);
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error('API call failed with error:', error);
    }
    return fallbackValue;
  }
}

/**
 * Check if the Supabase service is available
 * @returns True if the service is available, false otherwise
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    const response = await fetch(import.meta.env.VITE_SUPABASE_URL, { 
      method: 'HEAD',
      timeout: 5000
    });
    return response.ok || response.status === 404; // 404 is fine, it means the endpoint exists
  } catch (e) {
    return false;
  }
}