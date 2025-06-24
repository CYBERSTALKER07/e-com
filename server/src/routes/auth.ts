import { Router } from 'express';
import type { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';
import { AuthRequest, requireAuth } from '../middleware/auth';

interface RequestWithDB extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', async (req: RequestWithDB, res: Response) => {
  try {
    const { email, password, full_name, role = 'user' } = req.body;
    
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }
    
    const { db } = req;
    
    // Create new user with Supabase auth
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for simplicity
      user_metadata: {
        full_name,
        role,
        created_at: new Date().toISOString()
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Create profile in profiles table
    if (data.user) {
      const { error: profileError } = await db
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name,
          role,
          avatar_url: null,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'free',
          max_stores: 1 // Default to 1 store for free plan
        });
        
      if (profileError) {
        console.error('Failed to create profile:', profileError);
        // Don't fail registration if profile creation fails
      }
    }
    
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: data.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', async (req: RequestWithDB, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { db } = req;
    
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    // Get user's profile
    const { data: profileData, error: profileError } = await db
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    // If profile doesn't exist, create a basic one
    if (profileError) {
      const defaultProfile = {
        id: data.user.id,
        full_name: data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'User',
        role: data.user.user_metadata.role || 'user',
        avatar_url: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan: 'free',
        max_stores: 1
      };
      
      await db.from('profiles').upsert(defaultProfile);
      
      return res.status(200).json({
        user: data.user,
        profile: defaultProfile,
        session: data.session
      });
    }
    
    return res.status(200).json({
      user: data.user,
      profile: profileData,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req: RequestWithDB & AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { db } = req;
    
    // Get user profile from database
    const { data: profile, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Get user from auth
    const { data: userData, error: userError } = await db.auth.admin.getUserById(userId as string);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
    }
    
    return res.status(200).json({
      profile,
      user: userData?.user || null
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
router.put('/profile', requireAuth, async (req: RequestWithDB & AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { full_name, avatar_url, phone } = req.body;
    const { db } = req;
    
    // Update user metadata first
    await db.auth.admin.updateUserById(
      userId as string,
      {
        user_metadata: {
          full_name,
          updated_at: new Date().toISOString()
        }
      }
    );
    
    // Update profile in database
    const { data, error } = await db
      .from('profiles')
      .update({
        full_name,
        avatar_url,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      return res.status(400).json({ error: 'Failed to update profile' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Change password
 * POST /api/auth/change-password
 */
router.post('/change-password', requireAuth, async (req: RequestWithDB & AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    const { db } = req;
    
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    
    // Update user password (This requires service role key)
    const { error } = await db.auth.admin.updateUserById(
      req.user?.id as string,
      { password: new_password }
    );
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * Request password reset
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req: RequestWithDB, res: Response) => {
  try {
    const { email, reset_url } = req.body;
    const { db } = req;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const { error } = await db.auth.resetPasswordForEmail(
      email, 
      { redirectTo: reset_url || `${process.env.FRONTEND_URL}/reset-password` }
    );
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(200).json({ message: 'Password reset instructions sent' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ error: 'Failed to send reset instructions' });
  }
});

/**
 * Refresh session token
 * POST /api/auth/refresh-token
 */
router.post('/refresh-token', async (req: RequestWithDB, res: Response) => {
  try {
    const { refresh_token } = req.body;
    const { db } = req;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    const { data, error } = await db.auth.refreshSession({ refresh_token });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(200).json({
      session: data.session,
      user: data.user
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;