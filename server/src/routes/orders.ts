import { Router } from 'express';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';

// Type for enhanced request with Supabase
interface AuthRequest extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

// GET all orders
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { db } = req;
    const { data, error } = await db
      .from('orders')
      .select('*');
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET order by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching order ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET orders by customer
router.get('/customer/:customerId', async (req: AuthRequest, res) => {
  try {
    const { customerId } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('customer_id', customerId);
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching orders for customer ${req.params.customerId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// POST create new order
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { db } = req;
    const orderData = req.body;
    
    const { data, error } = await db
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order status
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    const orderData = req.body;
    
    const { data, error } = await db
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating order ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE order
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    const { error } = await db
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting order ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
