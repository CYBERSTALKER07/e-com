import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useOrder } from '../../context/OrderContext';
import AuthGuard from '../../components/Auth/AuthGuard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { OrderStatus } from '../../types';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById } = useOrder();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, getOrderById]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Ожидает обработки';
      case 'processing':
        return 'В обработке';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'cancelled':
        return 'Отменен';
      default:
        return 'Ожидает обработки';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Н/Д';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Неверная дата';
      }
      
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Неверная дата';
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link to="/orders" className="inline-flex items-center text-primary hover:text-primary-dark">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад к заказам
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : !order ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Заказ не найден</h2>
              <p className="text-gray-600 mb-6">
                Заказ, который вы ищете, не существует или у вас нет прав для его просмотра.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Заказ #{typeof order.id === 'string' ? order.id.substring(0, 8).toUpperCase() : 'Неизвестно'}</h1>
                    <p className="text-gray-600">Оформлен {formatDate(order.created_at)}</p>
                  </div>
                  <div className={`mt-4 sm:mt-0 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{getStatusText(order.status)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Статус заказа</h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <ul className="space-y-6 relative">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center z-10">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Заказ оформлен</h3>
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                    </li>
                    
                    {order.status !== 'pending' && order.status !== 'cancelled' && (
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center z-10">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">В обработке</h3>
                          <p className="text-sm text-gray-500">Ваш заказ готовится</p>
                        </div>
                      </li>
                    )}
                    
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center z-10">
                          <Truck className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">Отправлен</h3>
                          <p className="text-sm text-gray-500">Ваш заказ в пути</p>
                        </div>
                      </li>
                    )}
                    
                    {order.status === 'delivered' && (
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center z-10">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">Доставлен</h3>
                          <p className="text-sm text-gray-500">Ваш заказ доставлен</p>
                        </div>
                      </li>
                    )}
                    
                    {order.status === 'cancelled' && (
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-600 flex items-center justify-center z-10">
                          <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">Отменен</h3>
                          <p className="text-sm text-gray-500">Ваш заказ был отменен</p>
                        </div>
                      </li>
                    )}
                    
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <li className="flex items-start opacity-50">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center z-10">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            {order.status === 'pending' ? 'В обработке' : 
                             order.status === 'processing' ? 'Отправлен' : 'Доставлен'}
                          </h3>
                          <p className="text-sm text-gray-500">Ожидается: {formatDate(order.estimated_delivery)}</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Адрес доставки</h2>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-gray-800 font-medium">{order.shipping_address?.fullName || 'Н/Д'}</p>
                    <p className="text-gray-600">{order.shipping_address?.streetAddress || 'Н/Д'}</p>
                    <p className="text-gray-600">
                      {order.shipping_address?.city || 'Н/Д'}, {order.shipping_address?.state || 'Н/Д'} {order.shipping_address?.postalCode || 'Н/Д'}
                    </p>
                    <p className="text-gray-600">{order.shipping_address?.country || 'Н/Д'}</p>
                    <p className="text-gray-600 mt-2">{order.shipping_address?.phone || 'Н/Д'}</p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Информация об оплате</h2>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-gray-800 font-medium">Способ оплаты</p>
                    <p className="text-gray-600 capitalize">{(order.payment_method || 'Н/Д').replace('-', ' ')}</p>
                    
                    <p className="text-gray-800 font-medium mt-4">Платежный адрес</p>
                    <p className="text-gray-600">{order.billing_address?.fullName || 'Н/Д'}</p>
                    <p className="text-gray-600">{order.billing_address?.streetAddress || 'Н/Д'}</p>
                    <p className="text-gray-600">
                      {order.billing_address?.city || 'Н/Д'}, {order.billing_address?.state || 'Н/Д'} {order.billing_address?.postalCode || 'Н/Д'}
                    </p>
                    <p className="text-gray-600">{order.billing_address?.country || 'Н/Д'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Товары в заказе</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Товар
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Цена
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Количество
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Сумма
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(order.items || []).map((item: any) => (
                        <tr key={item.product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                                <div className="text-sm text-gray-500 capitalize">{item.product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Итого
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default OrderDetailPage;