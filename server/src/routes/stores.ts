import { Router } from 'express';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';
import { AuthRequest, requireAuth, requireStoreOwner, requireAdmin } from '../middleware/auth';

interface RequestWithDB extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

// GET all stores - public
router.get('/', async (req: RequestWithDB, res) => {
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

// GET store by ID - public
router.get('/:id', async (req: RequestWithDB, res) => {
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

// GET current user's stores - requires authentication
router.get('/my-stores', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { db } = req;
    
    const { data, error } = await db
      .from('stores')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching user stores:', error);
    return res.status(500).json({ error: 'Failed to fetch your stores' });
  }
});

// GET store by owner ID - requires authentication and ownership check
router.get('/owner/:ownerId', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { ownerId } = req.params;
    const { db } = req;
    
    // Users can only see their own stores unless they're admins
    if (req.user?.id !== ownerId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: You can only view your own stores' });
    }

    const { data, error } = await db
      .from('stores')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json(data || []);
  } catch (error) {
    console.error(`Error fetching stores for owner ${req.params.ownerId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// POST create new store - requires authentication
router.post('/', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { db } = req;
    const userId = req.user?.id;
    
    // Check store limit based on user's plan - example
    const { data: profile } = await db
      .from('profiles')
      .select('max_stores, plan')
      .eq('id', userId)
      .single();
      
    const maxStores = profile?.max_stores || 1;  // Default to 1 store for free plan
    
    // Check how many stores user already has
    const { data: existingStores, error: countError } = await db
      .from('stores')
      .select('id')
      .eq('owner_id', userId);
      
    if (countError) throw countError;
    
    if (existingStores && existingStores.length >= maxStores) {
      return res.status(403).json({ 
        error: 'Store limit reached for your plan',
        currentStores: existingStores.length,
        maxStores
      });
    }
    
    // Add owner_id to store data
    const storeData = {
      ...req.body,
      owner_id: userId,
      is_active: true  // Default to active when creating
    };
    
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

// PUT update store - requires store owner or admin
router.put('/:id', requireAuth, requireStoreOwner(), async (req: RequestWithDB, res) => {
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

// DELETE store - requires store owner or admin
router.delete('/:id', requireAuth, requireStoreOwner(), async (req: RequestWithDB, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    // Check if store has products
    const { data: products, error: productsError } = await db
      .from('products')
      .select('id')
      .eq('store_id', id)
      .limit(1);
      
    if (productsError) throw productsError;
    
    if (products && products.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete store with products. Remove all products first.' 
      });
    }
    
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