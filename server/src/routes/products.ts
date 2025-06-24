import { Router } from 'express';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';

// Type for enhanced request with Supabase
interface AuthRequest extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

// GET all products
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { db } = req;
    const { data, error } = await db
      .from('products')
      .select('*');
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET product by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new product
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { db } = req;
    const productData = req.body;
    
    const { data, error } = await db
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    const productData = req.body;
    
    const { data, error } = await db
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    const { error } = await db
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET products by store
router.get('/store/:storeId', async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('store_id', storeId);
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching products for store ${req.params.storeId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch store products' });
  }
});

export default router;
