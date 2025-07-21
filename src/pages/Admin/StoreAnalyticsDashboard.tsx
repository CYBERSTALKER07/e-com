import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  Star,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AuthGuard from '../../components/Auth/AuthGuard';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import RealtimeMetricsWidget from '../../components/Admin/RealtimeMetricsWidget';
import { analyticsService, StoreAnalytics, AnalyticsFilters } from '../../services/api/analytics';

// Import chart components (you'll need to install recharts)
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    monthly: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
    avgOrderValue: number;
  };
  products: {
    total: number;
    outOfStock: number;
    lowStock: number;
    topSelling: Array<{
      id: string;
      name: string;
      sold: number;
      revenue: number;
      image: string;
    }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    avgLifetimeValue: number;
  };
  traffic: {
    totalViews: number;
    uniqueVisitors: number;
    conversionRate: number;
    bounceRate: number;
  };
}

const StoreAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<StoreAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers' | 'traffic' | 'financial'>('overview');

  // Get store ID from user context or props
  const storeId = user?.store_id || 'mock-store-id';

  // Fetch analytics data using the new service
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      
      try {
        const filters: AnalyticsFilters = { dateRange };
        const data = await analyticsService.getStoreAnalytics(storeId, filters);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, storeId]);

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  const orderStatusData = analyticsData ? [
    { name: 'Delivered', value: analyticsData.orders.delivered, color: '#10B981' },
    { name: 'Processing', value: analyticsData.orders.processing, color: '#06B6D4' },
    { name: 'Pending', value: analyticsData.orders.pending, color: '#F59E0B' },
    { name: 'Cancelled', value: analyticsData.orders.cancelled, color: '#EF4444' }
  ] : [];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!analyticsData) return null;

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-primary" />
                Store Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive insights for your business</p>
            </div>
            
            {/* Date Range Filter */}
            <div className="mt-4 sm:mt-0">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="flex overflow-x-auto border-b">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'customers', label: 'Customers', icon: Users },
                { id: 'traffic', label: 'Traffic', icon: Eye },
                { id: 'financial', label: 'Financial', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Key Metrics - 2/3 width */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Metrics Cards */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white p-6 rounded-lg shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Revenue</p>
                          <h3 className="text-2xl font-bold text-gray-900">
                            ${analyticsData.revenue.total.toLocaleString()}
                          </h3>
                          <div className="flex items-center mt-1">
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">
                              +{analyticsData.revenue.growth}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white p-6 rounded-lg shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Orders</p>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {analyticsData.orders.total.toLocaleString()}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Avg: ${analyticsData.orders.avgOrderValue}
                          </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <ShoppingBag className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white p-6 rounded-lg shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Customers</p>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {analyticsData.customers.total.toLocaleString()}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {analyticsData.customers.new} new this month
                          </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white p-6 rounded-lg shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Conversion Rate</p>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {analyticsData.traffic.conversionRate}%
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {analyticsData.traffic.uniqueVisitors.toLocaleString()} visitors
                          </p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                          <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Real-time Metrics - 1/3 width */}
                <div>
                  <RealtimeMetricsWidget storeId={storeId} />
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 font-medium">
                        ↗ +{analyticsData?.revenue.growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData?.revenue.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Orders']} 
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Order Status Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Orders']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Financial Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-6">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Gross Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analyticsData?.financial.grossRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Net Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${analyticsData?.financial.netRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Profit</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${analyticsData?.financial.profit.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Profit Margin</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {analyticsData?.financial.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && analyticsData && (
            <>
              {/* Financial KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Gross Revenue</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        ${analyticsData.financial.grossRevenue.toLocaleString()}
                      </h3>
                    </div>
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Net Revenue</p>
                      <h3 className="text-2xl font-bold text-blue-600">
                        ${analyticsData.financial.netRevenue.toLocaleString()}
                      </h3>
                      <p className="text-xs text-gray-500">After fees</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Profit</p>
                      <h3 className="text-2xl font-bold text-green-600">
                        ${analyticsData.financial.profit.toLocaleString()}
                      </h3>
                      <p className="text-xs text-gray-500">{analyticsData.financial.profitMargin.toFixed(1)}% margin</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Costs</p>
                      <h3 className="text-2xl font-bold text-red-600">
                        ${analyticsData.financial.totalCosts.toLocaleString()}
                      </h3>
                    </div>
                    <ArrowDown className="h-8 w-8 text-red-400" />
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Financial Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Gross Revenue</span>
                      <span className="font-medium text-gray-900">
                        ${analyticsData.financial.grossRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Payment Processing Fees</span>
                      <span className="font-medium text-red-600">
                        -${(analyticsData.financial.grossRevenue - analyticsData.financial.netRevenue).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Cost of Goods</span>
                      <span className="font-medium text-red-600">
                        -${analyticsData.financial.totalCosts.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Refunds</span>
                      <span className="font-medium text-red-600">
                        -${analyticsData.financial.refunds.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-b-2 border-gray-900">
                      <span className="font-medium text-gray-900">Net Profit</span>
                      <span className="font-bold text-green-600">
                        ${analyticsData.financial.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Estimated Tax</span>
                      <span className="font-medium text-orange-600">
                        ${analyticsData.financial.tax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Inventory Value</h3>
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Total Inventory Value</p>
                      <p className="text-3xl font-bold text-purple-600">
                        ${analyticsData.inventory.totalValue.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-600 font-medium mb-1">Low Stock</p>
                        <p className="text-2xl font-bold text-yellow-700">
                          {analyticsData.inventory.lowStockAlerts}
                        </p>
                        <p className="text-xs text-yellow-600">products</p>
                      </div>
                      
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600 font-medium mb-1">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-700">
                          {analyticsData.inventory.outOfStockAlerts}
                        </p>
                        <p className="text-xs text-red-600">products</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              {/* Product Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Products</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {analyticsData.products.total}
                      </h3>
                    </div>
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Out of Stock</p>
                      <h3 className="text-2xl font-bold text-red-600">
                        {analyticsData.products.outOfStock}
                      </h3>
                    </div>
                    <Package className="h-8 w-8 text-red-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Low Stock</p>
                      <h3 className="text-2xl font-bold text-yellow-600">
                        {analyticsData.products.lowStock}
                      </h3>
                    </div>
                    <Package className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Top Selling Products</h3>
                <div className="space-y-4">
                  {analyticsData.products.topSelling.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-4">
                          {index + 1}
                        </div>
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover mr-4" />
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.sold} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Customers</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {analyticsData.customers.total.toLocaleString()}
                      </h3>
                    </div>
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">New Customers</p>
                      <h3 className="text-2xl font-bold text-green-600">
                        {analyticsData.customers.new}
                      </h3>
                      <p className="text-sm text-gray-500">This month</p>
                    </div>
                    <Users className="h-8 w-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg Lifetime Value</p>
                      <h3 className="text-2xl font-bold text-purple-600">
                        ${analyticsData.customers.avgLifetimeValue}
                      </h3>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Customer Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Customer Types</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">New Customers</span>
                        <span className="font-medium">{analyticsData.customers.new}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Returning Customers</span>
                        <span className="font-medium">{analyticsData.customers.returning}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Retention Rate</span>
                        <span className="font-medium text-green-600">
                          {((analyticsData.customers.returning / analyticsData.customers.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Value Segments</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">High Value (&gt;$500)</span>
                        <span className="font-medium">234</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Medium Value ($200-$500)</span>
                        <span className="font-medium">1,456</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Low Value (&lt;$200)</span>
                        <span className="font-medium">1,157</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Traffic Tab */}
          {activeTab === 'traffic' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Page Views</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {analyticsData.traffic.totalViews.toLocaleString()}
                      </h3>
                    </div>
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Unique Visitors</p>
                      <h3 className="text-2xl font-bold text-blue-600">
                        {analyticsData.traffic.uniqueVisitors.toLocaleString()}
                      </h3>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Conversion Rate</p>
                      <h3 className="text-2xl font-bold text-green-600">
                        {analyticsData.traffic.conversionRate}%
                      </h3>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Bounce Rate</p>
                      <h3 className="text-2xl font-bold text-red-600">
                        {analyticsData.traffic.bounceRate}%
                      </h3>
                    </div>
                    <ArrowDown className="h-8 w-8 text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Traffic Sources</h3>
                <div className="space-y-4">
                  {[
                    { source: 'Direct', visitors: 3456, percentage: 38.7, color: 'bg-blue-500' },
                    { source: 'Search Engines', visitors: 2891, percentage: 32.4, color: 'bg-green-500' },
                    { source: 'Social Media', visitors: 1678, percentage: 18.8, color: 'bg-purple-500' },
                    { source: 'Referrals', visitors: 909, percentage: 10.1, color: 'bg-orange-500' }
                  ].map((item) => (
                    <div key={item.source} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-900">{item.source}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-4">{item.visitors.toLocaleString()}</span>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default StoreAnalyticsDashboard;