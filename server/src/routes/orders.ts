import { Router } from 'express';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../src/types/supabase';
import { AuthRequest, requireAuth, requireAdmin, requireOrderAccess } from '../middleware/auth';

// Type for enhanced request with Supabase
interface RequestWithDB extends Request {
  db: SupabaseClient<Database>;
}

const router = Router();

// GET all orders (admin only)
router.get('/', requireAuth, requireAdmin, async (req: RequestWithDB, res) => {
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

// GET order by ID (requires authentication and proper access)
router.get('/:id', requireAuth, requireOrderAccess(), async (req: RequestWithDB, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    
    const { data, error } = await db
      .from('orders')
      .select(`
        *,
        items,
        customer:customer_id (
          id,
          email
        )
      `)
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

// GET orders by customer (customer can only see their own orders, admins can see any)
router.get('/customer/:customerId', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { customerId } = req.params;
    const { db } = req;
    const user = req.user;
    
    // Check authorization - users can only view their own orders
    if (user?.id !== customerId && user?.role !== 'admin') {
      return res.status(403).json({ error: 'You can only view your own orders' });
    }
    
    const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching orders for customer ${req.params.customerId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// GET current user's orders
router.get('/my/orders', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { db } = req;
    const userId = req.user?.id;
    
    const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

// GET orders for seller - store owner gets orders containing their products
router.get('/store/my-orders', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { db } = req;
    const userId = req.user?.id;
    
    // First, get all stores owned by the user
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
    
    const storeIds = stores.map(store => store.id);
    
    // Custom query to find orders containing products from user's stores
    // Note: This is a complex query that depends on your JSON structure in the 'items' column
    // Adjust as needed based on your specific schema
    const { data: orders, error: ordersError } = await db
      .from('orders')
      .select('*');
      
    if (ordersError) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    
    // Filter orders client-side (since we can't easily query inside the JSON array)
    const filteredOrders = orders?.filter(order => {
      const items = order.items as any[] || [];
      return items.some(item => storeIds.includes(item.store_id));
    });
    
    return res.status(200).json(filteredOrders || []);
  } catch (error) {
    console.error('Error fetching store orders:', error);
    return res.status(500).json({ error: 'Failed to fetch store orders' });
  }
});

// POST create new order (requires authentication)
router.post('/', requireAuth, async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { db } = req;
    const userId = req.user?.id;
    
    // Set the customer_id to the current user
    const orderData = {
      ...req.body,
      customer_id: userId,
      created_at: new Date().toISOString(),
      status: 'pending' // Default status
    };
    
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

// PUT update order status (admin or store owner)
router.put('/:id', requireAuth, requireOrderAccess(), async (req: RequestWithDB & AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { db } = req;
    const { status } = req.body;
    
    // Only allow updating specific fields
    const orderData = {
      status,
      ...(req.user?.role === 'admin' ? req.body : {}) // Admins can update any field
    };
    
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

// DELETE order (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req: RequestWithDB, res) => {
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
