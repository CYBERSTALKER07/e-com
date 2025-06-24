// Export all API services for easy imports
export * from './products';
export * from './orders';
export * from './stores';
export * from './profiles';

// API base URL for consistent usage across services
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';