import React, { useState, useEffect } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import OrderCard from '../../components/Orders/OrderCard';
import { useOrder } from '../../context/OrderContext';
import AuthGuard from '../../components/Auth/AuthGuard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const OrdersPage: React.FC = () => {
  const { getUserOrders } = useOrder();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const userOrders = await getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [getUserOrders]);

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Package className="h-6 w-6 mr-2 text-primary" />
            Ваши заказы
          </h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Заказы не найдены</h2>
              <p className="text-gray-600 mb-6">
                Вы еще не сделали ни одного заказа. Начните покупки, чтобы увидеть свои заказы здесь.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default OrdersPage;