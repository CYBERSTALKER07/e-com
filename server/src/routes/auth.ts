import { Router } from 'express';
import type { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';
import { AuthRequest, requireAuth } from '../middleware/auth';

interface RequestWithDB extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

// Sign up endpoint
router.post('/register', async (req: RequestWithDB, res: Response) => {
  try {
    const { email, password, full_name, role = 'user' } = req.body;
    
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }
    
    const { db } = req;
    
    // Create new user
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
      user_metadata: {
        full_name,
        role,
        plan: 'free',
        max_stores: 1
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
          created_at: new Date().toISOString(),
          plan: 'free',
          max_stores: 1
        });
        
      if (profileError) {
        console.error('Failed to create profile:', profileError);
        // Don't fail the registration if profile creation fails
      }
    }
    
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Sign in endpoint (for reference - actual auth is handled by Supabase client-side)
router.post('/login', async (req: RequestWithDB, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { db } = req;
    
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    // Get profile data
    const { data: profile } = await db
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    return res.status(200).json({
      user: data.user,
      session: data.session,
      profile
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req: RequestWithDB & AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { db } = req;
    
    const { data: profile, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/me', requireAuth, async (req: RequestWithDB & AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { full_name, avatar_url, phone } = req.body;
    const { db } = req;
    
    // Update user metadata first
    const { error: metadataError } = await db.auth.admin.updateUserById(
      userId as string,
      {
        user_metadata: {
          full_name,
        }
      }
    );
    
    if (metadataError) {
      console.warn('Failed to update user metadata:', metadataError);
    }
    
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

// Change password endpoint
router.post('/change-password', requireAuth, async (req: RequestWithDB & AuthRequest, res: Response) => {
  try {
    const { new_password } = req.body;
    const { db } = req;
    
    if (!new_password) {
      return res.status(400).json({ error: 'New password is required' });
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

// Admin: Get all users (requires admin role)
router.get('/users', requireAuth, async (req: RequestWithDB & AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { db } = req;
    
    // Get all profiles
    const { data: profiles, error } = await db
      .from('profiles')
      .select('*');
      
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    return res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Update user role (requires admin role)
router.put('/users/:userId/role', requireAuth, async (req: RequestWithDB & AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { userId } = req.params;
    const { role } = req.body;
    const { db } = req;
    
    if (!role || !['user', 'admin', 'store_owner'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required' });
    }
    
    // Update user metadata
    const { error: metadataError } = await db.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          role
        }
      }
    );
    
    if (metadataError) {
      console.warn('Failed to update user metadata:', metadataError);
    }
    
    // Update profile in database
    const { data, error } = await db
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      return res.status(400).json({ error: 'Failed to update user role' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;