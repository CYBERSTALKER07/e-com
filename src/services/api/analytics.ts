import { supabase } from '../../lib/supabase';

export interface StoreAnalytics {
  storeId: string;
  revenue: {
    total: number;
    growth: number;
    monthly: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
    daily: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    avgOrderValue: number;
    growth: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
    lowStock: number;
    views: number;
    topSelling: Array<{
      id: string;
      name: string;
      sold: number;
      revenue: number;
      image: string;
      category: string;
      profit: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      revenue: number;
    }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    avgLifetimeValue: number;
    retention: number;
    segments: Array<{
      segment: string;
      count: number;
      value: number;
    }>;
  };
  traffic: {
    totalViews: number;
    uniqueVisitors: number;
    conversionRate: number;
    bounceRate: number;
    avgSessionDuration: number;
    sources: Array<{
      source: string;
      visitors: number;
      percentage: number;
    }>;
    devices: Array<{
      device: string;
      visits: number;
      percentage: number;
    }>;
  };
  financial: {
    grossRevenue: number;
    netRevenue: number;
    totalCosts: number;
    profit: number;
    profitMargin: number;
    tax: number;
    refunds: number;
  };
  inventory: {
    totalValue: number;
    lowStockAlerts: number;
    outOfStockAlerts: number;
    fastMoving: Array<{
      productId: string;
      name: string;
      velocity: number;
    }>;
    slowMoving: Array<{
      productId: string;
      name: string;
      daysInStock: number;
    }>;
  };
}

export interface AnalyticsFilters {
  dateRange: string;
  category?: string;
  customerSegment?: string;
}

class AnalyticsService {
  async getStoreAnalytics(storeId: string, filters: AnalyticsFilters): Promise<StoreAnalytics> {
    try {
      // In a real implementation, these would be actual database queries
      // For now, returning mock data based on the store ID
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);

      if (productsError) throw productsError;

      // Calculate analytics from real data
      const analytics = this.calculateAnalytics(orders || [], products || [], filters);
      
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return mock data as fallback
      return this.getMockAnalytics(storeId);
    }
  }

  private calculateAnalytics(orders: any[], products: any[], filters: AnalyticsFilters): StoreAnalytics {
    // Filter orders based on date range
    const filteredOrders = this.filterOrdersByDateRange(orders, filters.dateRange);
    
    // Calculate revenue metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const previousPeriodRevenue = this.calculatePreviousPeriodRevenue(orders, filters.dateRange);
    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0;

    // Calculate order metrics
    const ordersByStatus = {
      total: filteredOrders.length,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      processing: filteredOrders.filter(o => o.status === 'processing').length,
      shipped: filteredOrders.filter(o => o.status === 'shipped').length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
      avgOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
      growth: 0 // Calculate based on previous period
    };

    // Calculate product metrics
    const productMetrics = {
      total: products.length,
      active: products.filter(p => p.is_visible).length,
      outOfStock: products.filter(p => p.stock_quantity === 0).length,
      lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length,
      views: 0, // Would come from analytics tracking
      topSelling: this.calculateTopSellingProducts(orders, products).slice(0, 10),
      categoryBreakdown: this.calculateCategoryBreakdown(products, orders)
    };

    // Calculate customer metrics
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customer_id)).size;
    const customerMetrics = {
      total: uniqueCustomers,
      new: 0, // Would need customer creation dates
      returning: 0, // Would need to track repeat customers
      avgLifetimeValue: uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0,
      retention: 0, // Would need historical data
      segments: []
    };

    return {
      storeId: products[0]?.store_id || '',
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth,
        monthly: this.calculateMonthlyRevenue(filteredOrders),
        daily: this.calculateDailyRevenue(filteredOrders)
      },
      orders: ordersByStatus,
      products: productMetrics,
      customers: customerMetrics,
      traffic: this.getMockTrafficData(),
      financial: this.calculateFinancialMetrics(totalRevenue),
      inventory: this.calculateInventoryMetrics(products)
    };
  }

  private filterOrdersByDateRange(orders: any[], dateRange: string): any[] {
    const now = new Date();
    const days = this.getDateRangeDays(dateRange);
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return orders.filter(order => new Date(order.created_at) >= cutoffDate);
  }

  private getDateRangeDays(dateRange: string): number {
    switch (dateRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  private calculatePreviousPeriodRevenue(orders: any[], dateRange: string): number {
    const days = this.getDateRangeDays(dateRange);
    const now = new Date();
    const previousStart = new Date(now.getTime() - (days * 2 * 24 * 60 * 60 * 1000));
    const previousEnd = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= previousStart && orderDate < previousEnd;
    });
    
    return previousOrders.reduce((sum, order) => sum + order.total, 0);
  }

  private calculateMonthlyRevenue(orders: any[]): Array<{month: string, revenue: number, orders: number}> {
    const monthlyData = new Map();
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { month: monthKey, revenue: 0, orders: 0 });
      }
      
      const current = monthlyData.get(monthKey);
      current.revenue += order.total;
      current.orders += 1;
    });
    
    return Array.from(monthlyData.values()).slice(0, 6);
  }

  private calculateDailyRevenue(orders: any[]): Array<{date: string, revenue: number, orders: number}> {
    const dailyData = new Map();
    
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      
      if (!dailyData.has(date)) {
        dailyData.set(date, { date, revenue: 0, orders: 0 });
      }
      
      const current = dailyData.get(date);
      current.revenue += order.total;
      current.orders += 1;
    });
    
    return Array.from(dailyData.values()).slice(0, 30);
  }

  private calculateTopSellingProducts(orders: any[], products: any[]): any[] {
    const productSales = new Map();
    
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        if (!productSales.has(item.product_id)) {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            productSales.set(item.product_id, {
              id: product.id,
              name: product.name,
              image: product.image,
              category: product.category,
              sold: 0,
              revenue: 0,
              profit: 0
            });
          }
        }
        
        const current = productSales.get(item.product_id);
        if (current) {
          current.sold += item.quantity;
          current.revenue += item.price * item.quantity;
          current.profit += (item.price - (item.price * 0.7)) * item.quantity; // Assuming 30% profit margin
        }
      });
    });
    
    return Array.from(productSales.values())
      .sort((a, b) => b.sold - a.sold);
  }

  private calculateCategoryBreakdown(products: any[], orders: any[]): Array<{category: string, count: number, revenue: number}> {
    const categories = new Map();
    
    products.forEach(product => {
      if (!categories.has(product.category)) {
        categories.set(product.category, {
          category: product.category,
          count: 0,
          revenue: 0
        });
      }
      categories.get(product.category).count += 1;
    });
    
    // Calculate revenue per category
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const product = products.find(p => p.id === item.product_id);
        if (product && categories.has(product.category)) {
          categories.get(product.category).revenue += item.price * item.quantity;
        }
      });
    });
    
    return Array.from(categories.values());
  }

  private calculateFinancialMetrics(totalRevenue: number) {
    const costs = totalRevenue * 0.7; // Assuming 70% costs
    const profit = totalRevenue - costs;
    
    return {
      grossRevenue: totalRevenue,
      netRevenue: totalRevenue * 0.95, // After payment processing fees
      totalCosts: costs,
      profit: profit,
      profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
      tax: profit * 0.2, // Assuming 20% tax rate
      refunds: totalRevenue * 0.02 // Assuming 2% refund rate
    };
  }

  private calculateInventoryMetrics(products: any[]) {
    const totalValue = products.reduce((sum, product) => 
      sum + (product.price * product.stock_quantity), 0
    );
    
    return {
      totalValue,
      lowStockAlerts: products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length,
      outOfStockAlerts: products.filter(p => p.stock_quantity === 0).length,
      fastMoving: [], // Would need sales velocity data
      slowMoving: [] // Would need inventory age data
    };
  }

  private getMockTrafficData() {
    return {
      totalViews: 15678,
      uniqueVisitors: 8934,
      conversionRate: 3.2,
      bounceRate: 42.1,
      avgSessionDuration: 245, // seconds
      sources: [
        { source: 'Direct', visitors: 3456, percentage: 38.7 },
        { source: 'Search Engines', visitors: 2891, percentage: 32.4 },
        { source: 'Social Media', visitors: 1678, percentage: 18.8 },
        { source: 'Referrals', visitors: 909, percentage: 10.1 }
      ],
      devices: [
        { device: 'Desktop', visits: 5234, percentage: 58.6 },
        { device: 'Mobile', visits: 3156, percentage: 35.3 },
        { device: 'Tablet', visits: 544, percentage: 6.1 }
      ]
    };
  }

  private getMockAnalytics(storeId: string): StoreAnalytics {
    // Return comprehensive mock data for testing
    return {
      storeId,
      revenue: {
        total: 45678.90,
        growth: 12.5,
        monthly: [
          { month: 'Jan', revenue: 28450, orders: 145 },
          { month: 'Feb', revenue: 32100, orders: 167 },
          { month: 'Mar', revenue: 35600, orders: 189 },
          { month: 'Apr', revenue: 38900, orders: 203 },
          { month: 'May', revenue: 42300, orders: 221 },
          { month: 'Jun', revenue: 45678, orders: 238 }
        ],
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          revenue: Math.floor(Math.random() * 2000) + 500,
          orders: Math.floor(Math.random() * 20) + 5
        }))
      },
      orders: {
        total: 1163,
        pending: 23,
        processing: 45,
        shipped: 67,
        delivered: 1020,
        cancelled: 8,
        avgOrderValue: 192.35,
        growth: 8.7
      },
      products: {
        total: 156,
        active: 148,
        outOfStock: 8,
        lowStock: 23,
        views: 45678,
        topSelling: [
          { id: '1', name: 'Premium Leather Jacket', sold: 89, revenue: 17800, image: '/api/placeholder/80/80', category: 'Fashion', profit: 5340 },
          { id: '2', name: 'Designer Handbag', sold: 67, revenue: 13400, image: '/api/placeholder/80/80', category: 'Accessories', profit: 4020 },
          { id: '3', name: 'Luxury Watch', sold: 45, revenue: 22500, image: '/api/placeholder/80/80', category: 'Jewelry', profit: 6750 },
          { id: '4', name: 'Silk Scarf', sold: 123, revenue: 9840, image: '/api/placeholder/80/80', category: 'Accessories', profit: 2952 },
          { id: '5', name: 'Cashmere Sweater', sold: 34, revenue: 10200, image: '/api/placeholder/80/80', category: 'Fashion', profit: 3060 }
        ],
        categoryBreakdown: [
          { category: 'Fashion', count: 65, revenue: 28940 },
          { category: 'Accessories', count: 43, revenue: 18750 },
          { category: 'Jewelry', count: 28, revenue: 35600 },
          { category: 'Electronics', count: 20, revenue: 12450 }
        ]
      },
      customers: {
        total: 2847,
        new: 234,
        returning: 567,
        avgLifetimeValue: 456.78,
        retention: 67.8,
        segments: [
          { segment: 'High Value', count: 234, value: 1200 },
          { segment: 'Medium Value', count: 1456, value: 350 },
          { segment: 'Low Value', count: 1157, value: 125 }
        ]
      },
      traffic: this.getMockTrafficData(),
      financial: {
        grossRevenue: 45678.90,
        netRevenue: 43395.96,
        totalCosts: 31975.23,
        profit: 13703.67,
        profitMargin: 30.0,
        tax: 2740.73,
        refunds: 913.58
      },
      inventory: {
        totalValue: 245670,
        lowStockAlerts: 23,
        outOfStockAlerts: 8,
        fastMoving: [
          { productId: '1', name: 'Premium Leather Jacket', velocity: 8.5 },
          { productId: '4', name: 'Silk Scarf', velocity: 12.3 }
        ],
        slowMoving: [
          { productId: '15', name: 'Vintage Hat', daysInStock: 245 },
          { productId: '28', name: 'Classic Belt', daysInStock: 189 }
        ]
      }
    };
  }

  async getRealtimeMetrics(storeId: string) {
    // This would typically connect to a real-time analytics service
    return {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      todaysRevenue: Math.floor(Math.random() * 1000) + 500,
      todaysOrders: Math.floor(Math.random() * 20) + 5,
      conversionRate: (Math.random() * 5 + 2).toFixed(1),
      lastOrderTime: new Date(Date.now() - Math.random() * 3600000).toISOString()
    };
  }
}

export const analyticsService = new AnalyticsService();