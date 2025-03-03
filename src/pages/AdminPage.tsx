import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import AdminOrderCard from '../components/Admin/AdminOrderCard';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { OrderStatus } from '../types';

const AdminPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { getAllOrders, updateOrderStatus } = useOrder();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect
  }

  const orders = getAllOrders();

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <Package className="h-6 w-6 mr-2" />
          Admin Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-indigo-900">{orders.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {orders.filter(order => order.status === 'pending').length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Processing</p>
              <p className="text-2xl font-bold text-blue-900">
                {orders.filter(order => order.status === 'processing').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {orders.filter(order => order.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No orders have been placed yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <AdminOrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;