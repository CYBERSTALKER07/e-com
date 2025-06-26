// Export all API services for easy imports
export * from './products';
export * from './orders';
export * from './stores';
export * from './profiles';

// Import and export the Supabase client for consistent usage
import { supabase } from '../../lib/supabase';
export { supabase };