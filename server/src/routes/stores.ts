import { Router } from 'express';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';

// Type for enhanced request with Supabase
interface AuthRequest extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

// GET all stores
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { db } = req;
    const { data, error } = await db
      .from('stores')
      .select('*');
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// GET store by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Store not found' });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching store ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// GET store by owner ID
router.get('/owner/:ownerId', async (req: AuthRequest, res) => {
  try {
    const { ownerId } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('stores')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching stores for owner ${req.params.ownerId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch owner stores' });
  }
});

// POST create new store
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { db } = req;
    const storeData = req.body;
    
    const { data, error } = await db
      .from('stores')
      .insert(storeData)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating store:', error);
    return res.status(500).json({ error: 'Failed to create store' });
  }
});

// PUT update store
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    const storeData = req.body;
    
    const { data, error } = await db
      .from('stores')
      .update(storeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Store not found' });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating store ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update store' });
  }
});

// DELETE store
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    const { error } = await db
      .from('stores')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting store ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to delete store' });
  }
});

export default router;