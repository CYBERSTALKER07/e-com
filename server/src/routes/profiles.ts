import { Router } from 'express';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';

// Type for enhanced request with Supabase
interface AuthRequest extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

// GET all profiles
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { db } = req;
    const { data, error } = await db
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// GET profile by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching profile ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST create new profile
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { db } = req;
    const profileData = req.body;
    
    const { data, error } = await db
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ error: 'Failed to create profile' });
  }
});

// PUT update profile
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    const profileData = req.body;
    
    const { data, error } = await db
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating profile ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET profiles by role
router.get('/role/:role', async (req: AuthRequest, res) => {
  try {
    const { role } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('role', role);
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching profiles with role ${req.params.role}:`, error);
    return res.status(500).json({ error: 'Failed to fetch profiles by role' });
  }
});

export default router;