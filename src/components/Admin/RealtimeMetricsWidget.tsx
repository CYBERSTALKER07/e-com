import React, { useState, useEffect } from 'react';
import { Activity, Clock, DollarSign, ShoppingCart, Users, Wifi } from 'lucide-react';
import { analyticsService } from '../../services/api/analytics';
import { motion } from 'framer-motion';

interface RealtimeMetrics {
  activeUsers: number;
  todaysRevenue: number;
  todaysOrders: number;
  conversionRate: string;
  lastOrderTime: string;
}

interface RealtimeMetricsProps {
  storeId: string;
}

const RealtimeMetricsWidget: React.FC<RealtimeMetricsProps> = ({ storeId }) => {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchRealtimeMetrics = async () => {
      try {
        const data = await analyticsService.getRealtimeMetrics(storeId);
        setMetrics(data);
        setLastUpdate(new Date());
        setIsConnected(true);
      } catch (error) {
        console.error('Error fetching realtime metrics:', error);
        setIsConnected(false);
      }
    };

    // Initial fetch
    fetchRealtimeMetrics();

    // Update every 30 seconds
    const interval = setInterval(fetchRealtimeMetrics, 30000);

    return () => clearInterval(interval);
  }, [storeId]);

  const formatLastOrderTime = (isoString: string) => {
    const orderTime = new Date(isoString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return orderTime.toLocaleDateString();
  };

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Live Metrics</h3>
          <div className="animate-pulse w-3 h-3 bg-gray-400 rounded-full"></div>
        </div>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Live Metrics
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Active Users */}
        <motion.div 
          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          key={metrics.activeUsers}
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Active Users</p>
              <p className="text-xs text-gray-500">Right now</p>
            </div>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {metrics.activeUsers}
          </div>
        </motion.div>

        {/* Today's Revenue */}
        <motion.div 
          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          key={metrics.todaysRevenue}
        >
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Today's Revenue</p>
              <p className="text-xs text-gray-500">So far today</p>
            </div>
          </div>
          <div className="text-xl font-bold text-green-600">
            ${metrics.todaysRevenue.toLocaleString()}
          </div>
        </motion.div>

        {/* Today's Orders */}
        <motion.div 
          className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          key={metrics.todaysOrders}
        >
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Today's Orders</p>
              <p className="text-xs text-gray-500">Total today</p>
            </div>
          </div>
          <div className="text-xl font-bold text-purple-600">
            {metrics.todaysOrders}
          </div>
        </motion.div>

        {/* Conversion Rate */}
        <motion.div 
          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          key={metrics.conversionRate}
        >
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-full mr-3">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Conversion Rate</p>
              <p className="text-xs text-gray-500">Current session</p>
            </div>
          </div>
          <div className="text-xl font-bold text-orange-600">
            {metrics.conversionRate}%
          </div>
        </motion.div>

        {/* Last Order */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Last order</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatLastOrderTime(metrics.lastOrderTime)}
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMetricsWidget;