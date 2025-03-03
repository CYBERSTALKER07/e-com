import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderCardProps {
  order: Order;
  isAdmin?: boolean;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isAdmin = false, onStatusChange }) => {
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Неверная дата';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Заказ #{typeof order.id === 'string' ? order.id.substring(0, 8).toUpperCase() : 'Неизвестно'}</h3>
            <p className="text-sm text-gray-500">Оформлен {formatDate(order.createdAt || order.created_at)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} mt-2 sm:mt-0 flex items-center`}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{getStatusText(order.status)}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Адрес доставки</h4>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.fullName || order.shipping_address?.fullName}<br />
                {order.shippingAddress?.streetAddress || order.shipping_address?.streetAddress}<br />
                {order.shippingAddress?.city || order.shipping_address?.city}, {order.shippingAddress?.state || order.shipping_address?.state} {order.shippingAddress?.postalCode || order.shipping_address?.postalCode}<br />
                {order.shippingAddress?.country || order.shipping_address?.country}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Информация о клиенте</h4>
              <p className="text-sm text-gray-600">
                {order.customerName || order.customer_name || 'Н/Д'}<br />
                {order.customerEmail || order.customer_email || 'Н/Д'}<br />
                {(order.shippingAddress?.phone || order.shipping_address?.phone) || 'Н/Д'}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Товары в заказе</h4>
            <div className="space-y-3">
              {(order.items || []).map((item: any) => (
                <div key={item.product.id} className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{item.product.name}</h5>
                    <p className="text-sm text-gray-500">Кол-во: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Ожидаемая доставка: <span className="font-medium">{formatDate(order.estimatedDelivery || order.estimated_delivery)}</span>
              </p>
            </div>
            <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
          </div>

          {isAdmin && onStatusChange && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Обновить статус заказа</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'pending')}
                >
                  Ожидает
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'processing' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'processing')}
                >
                  В обработке
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'shipped' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'shipped')}
                >
                  Отправлен
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'delivered')}
                >
                  Доставлен
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'cancelled')}
                >
                  Отменен
                </button>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Link
                to={`/orders/${order.id}`}
                className="text-primary hover:text-primary-dark font-medium text-sm"
              >
                Просмотреть детали заказа
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;