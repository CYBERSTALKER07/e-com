import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '../../../src/types/supabase';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables for auth middleware');
  process.exit(1);
}

// Create Supabase client for auth validation
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Interface for enhanced request with user data
export interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
    email: string;
    full_name: string;
    plan?: 'free' | 'premium';
    max_stores?: number;
  } | null;
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
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      (req as AuthRequest).user = null;
      (req as AuthRequest).token = null;
      return next();
    }

    // Get additional user data from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Set user data in request
    (req as AuthRequest).user = {
      id: user.id,
      email: user.email || '',
      role: profile?.role || user.user_metadata.role || 'user',
      full_name: profile?.full_name || user.user_metadata.full_name || '',
      plan: profile?.plan || user.user_metadata.plan || 'free',
      max_stores: profile?.max_stores || user.user_metadata.max_stores || 1
    };
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
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error('Store owner check error:', error);
      res.status(500).json({ error: 'Server error checking store ownership' });
    }
  };
};