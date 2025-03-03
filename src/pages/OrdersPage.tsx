import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import OrderCard from '../components/Orders/OrderCard';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const OrdersPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { getUserOrders } = useOrder();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  const userOrders = getUserOrders(user.email);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <Package className="h-6 w-6 mr-2" />
          Your Orders
        </h1>

        {userOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;