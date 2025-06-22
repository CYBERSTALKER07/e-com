import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../App';

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
}

export default function OrdersScreen({ navigation }) {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={24} color="#EAB308" />;
      case 'processing':
        return <Package size={24} color="#3B82F6" />;
      case 'shipped':
        return <Truck size={24} color="#8B5CF6" />;
      case 'delivered':
        return <CheckCircle size={24} color="#22C55E" />;
      case 'cancelled':
        return <XCircle size={24} color="#EF4444" />;
      default:
        return <Clock size={24} color="#EAB308" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50';
      case 'processing':
        return 'bg-blue-50';
      case 'shipped':
        return 'bg-purple-50';
      case 'delivered':
        return 'bg-green-50';
      case 'cancelled':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getStatusText = (status: Order['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetails', { id: item.id })}
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 mx-2 p-4"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className={`p-2 rounded-full ${getStatusColor(item.status)}`}>
            {getStatusIcon(item.status)}
          </View>
          <View className="ml-3">
            <Text className="text-sm text-gray-500">Order #{item.id.slice(0, 8)}</Text>
            <Text className="text-lg font-bold text-gray-900">
              ${item.total.toFixed(2)}
            </Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className={`text-sm font-medium ${
            item.status === 'cancelled' ? 'text-red-700' :
            item.status === 'delivered' ? 'text-green-700' :
            item.status === 'shipped' ? 'text-purple-700' :
            item.status === 'processing' ? 'text-blue-700' :
            'text-yellow-700'
          }`}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-4">
        <Text className="text-gray-500 mb-2">
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text className="text-gray-700">
          {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Package size={64} color="#6B4423" />
        <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">
          Your Orders
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Sign in to view and track your orders
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-[#6B4423] w-full py-3 rounded-full"
        >
          <Text className="text-white text-center font-medium">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6B4423" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Package size={64} color="#6B4423" />
        <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">
          No Orders Yet
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Start shopping to see your orders here
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductsTab')}
          className="bg-[#6B4423] w-full py-3 rounded-full"
        >
          <Text className="text-white text-center font-medium">Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}