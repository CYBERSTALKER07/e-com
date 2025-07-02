import React, { useEffect } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import OrderCard from '../../components/Orders/OrderCard';
import { useOrder } from '../../context/OrderContext';
import AuthGuard from '../../components/Auth/AuthGuard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { Link } from 'react-router-dom';

const OrdersPage: React.FC = () => {
  const { orders = [], loading, error, refreshOrders } = useOrder();

  // Refresh orders when component mounts
  useEffect(() => {
    if (refreshOrders) {
      refreshOrders();
    }
  }, [refreshOrders]);

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Package className="h-6 w-6 mr-2 text-primary" />
            Ваши заказы
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-red-900 mb-2">Ошибка загрузки</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => refreshOrders && refreshOrders()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Попробовать снова
              </button>
            </div>
          ) : (orders || []).length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Заказы не найдены</h2>
              <p className="text-gray-600 mb-6">
                Вы еще не сделали ни одного заказа. Начните покупки, чтобы увидеть свои заказы здесь.
              </p>
              <Link
                to="/products"
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Начать покупки
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {(orders || []).map(order => (
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