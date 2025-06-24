import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables for auth middleware');
  process.exit(1);
}

// Create Supabase client for auth validation
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// User profile interface (matching frontend)
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  plan: 'free' | 'premium';
  max_stores: number;
}

// Interface for enhanced request with user data
export interface AuthRequest extends Request {
  user: UserProfile | null;
  token: string | null;
}

/**
 * Authentication middleware
 * Verifies JWT from Authorization header and sets user data in request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (req as AuthRequest).user = null;
      (req as AuthRequest).token = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      (req as AuthRequest).user = null;
      (req as AuthRequest).token = null;
      return next();
    }

    // Verify JWT using Supabase
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      (req as AuthRequest).user = null;
      (req as AuthRequest).token = null;
      return next();
    }

    // Get the user's profile from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.warn(`Profile not found for user ${authData.user.id}:`, profileError);
      
      // Create basic profile from auth data if profile doesn't exist
      (req as AuthRequest).user = {
        id: authData.user.id,
        full_name: authData.user.user_metadata.full_name || authData.user.email?.split('@')[0] || 'User',
        email: authData.user.email || '',
        role: authData.user.user_metadata.role || 'user',
        avatar_url: null,
        phone: null,
        plan: 'free',
        max_stores: 0
      };
    } else {
      // Set full profile in request
      (req as AuthRequest).user = {
        id: profileData.id,
        full_name: profileData.full_name,
        email: authData.user.email || '',
        role: profileData.role,
        avatar_url: profileData.avatar_url,
        phone: profileData.phone,
        plan: profileData.plan || 'free',
        max_stores: profileData.max_stores || 0
      };
    }

    (req as AuthRequest).token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    (req as AuthRequest).user = null;
    (req as AuthRequest).token = null;
    next();
  }
};

/**
 * Authorization middleware - requires authenticated user
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req as AuthRequest).user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * Admin authorization middleware - requires authenticated admin user
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as AuthRequest).user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

/**
 * Store owner authorization middleware - requires user to be store owner
 */
export const requireStoreOwner = (storeIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthRequest).user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const storeId = req.params[storeIdParam];
      if (!storeId) {
        return res.status(400).json({ error: 'Store ID is required' });
      }

      // Check if user is an admin (admins can manage any store)
      if (user.role === 'admin') {
        return next();
      }

      // Check if user owns the store
      const { data, error } = await supabase
        .from('stores')
        .select('owner_id')
        .eq('id', storeId)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Store not found' });
      }

      if (data.owner_id !== user.id) {
        return res.status(403).json({ error: 'Access denied - you must be the store owner' });
      }

      next();
    } catch (error) {
      console.error('Store owner check error:', error);
      res.status(500).json({ error: 'Server error checking store ownership' });
    }
  };
};

/**
 * Middleware to check if user can access order
 * Users can access their own orders, store owners can access orders for their stores,
 * and admins can access all orders
 */
export const requireOrderAccess = (orderIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthRequest).user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const orderId = req.params[orderIdParam];
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      // Admins can access any order
      if (user.role === 'admin') {
        return next();
      }

      // Get the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          items:items
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // User can access their own orders
      if (order.customer_id === user.id) {
        return next();
      }

      // For store owners, check if the order contains products from their stores
      // First get all stores owned by the user
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id);

      if (storesError) {
        return res.status(500).json({ error: 'Error checking store ownership' });
      }

      if (!stores || stores.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if any order item belongs to the user's stores
      const storeIds = stores.map(store => store.id);
      const orderItems = order.items as any[];
      
      const hasAccessToOrder = orderItems.some(item => 
        storeIds.includes(item.store_id)
      );

      if (!hasAccessToOrder) {
        return res.status(403).json({ error: 'Access denied - you do not have access to this order' });
      }

      next();
    } catch (error) {
      console.error('Order access check error:', error);
      res.status(500).json({ error: 'Server error checking order access' });
    }
  };
};