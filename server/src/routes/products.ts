import { Router } from 'express';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';
import { AuthRequest, requireAuth, requireAdmin } from '../middleware/auth';

// Type for enhanced request with Supabase
interface RequestWithDB extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

// GET all products - public
router.get('/', async (req: RequestWithDB, res) => {
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

// GET product by ID - public
router.get('/:id', async (req: RequestWithDB, res) => {
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

// POST create new product - requires authentication
router.post('/', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { db } = req;
    const productData = req.body;
    const userId = req.user?.id;
    
    // Verify the user owns the store where they're adding a product
    const { data: store, error: storeError } = await db
      .from('stores')
      .select('owner_id')
      .eq('id', productData.store_id)
      .single();
      
    if (storeError) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Check if user is owner or admin
    if (store.owner_id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to add products to this store' });
    }
    
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

// PUT update product - requires authentication
router.put('/:id', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    const productData = req.body;
    const userId = req.user?.id;
    
    // First, check if product exists and get its store_id
    const { data: existingProduct, error: productError } = await db
      .from('products')
      .select('store_id')
      .eq('id', id)
      .single();
      
    if (productError || !existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Verify the user owns the store where the product is
    const { data: store, error: storeError } = await db
      .from('stores')
      .select('owner_id')
      .eq('id', existingProduct.store_id)
      .single();
      
    if (storeError) {
      return res.status(500).json({ error: 'Error verifying store ownership' });
    }
    
    // Check if user is owner or admin
    if (store.owner_id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this product' });
    }
    
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

// DELETE product - requires authentication
router.delete('/:id', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    const userId = req.user?.id;
    
    // First, check if product exists and get its store_id
    const { data: existingProduct, error: productError } = await db
      .from('products')
      .select('store_id')
      .eq('id', id)
      .single();
      
    if (productError || !existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Verify the user owns the store where the product is
    const { data: store, error: storeError } = await db
      .from('stores')
      .select('owner_id')
      .eq('id', existingProduct.store_id)
      .single();
      
    if (storeError) {
      return res.status(500).json({ error: 'Error verifying store ownership' });
    }
    
    // Check if user is owner or admin
    if (store.owner_id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this product' });
    }
    
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

// GET products by store - public
router.get('/store/:storeId', async (req: RequestWithDB, res) => {
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

// GET products owned by current user - requires authentication
router.get('/my-products', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { db } = req;
    
    // First get all stores owned by the user
    const { data: stores, error: storesError } = await db
      .from('stores')
      .select('id')
      .eq('owner_id', userId);
      
    if (storesError) {
      return res.status(500).json({ error: 'Error fetching your stores' });
    }
    
    if (!stores || stores.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get all products from those stores
    const storeIds = stores.map(store => store.id);
    const { data, error } = await db
      .from('products')
      .select('*')
      .in('store_id', storeIds);
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user products:', error);
    return res.status(500).json({ error: 'Failed to fetch your products' });
  }
});

export default router;
