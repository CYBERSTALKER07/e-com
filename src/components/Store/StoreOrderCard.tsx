import React, { useState } from 'react';
import { Clock, Package, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { OrderStatus } from '../../types';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface StoreOrderCardProps {
  order: any;
  storeId: string;
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus) => void;
}

const StoreOrderCard: React.FC<StoreOrderCardProps> = ({ order, storeId, onStatusUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Get current user session to verify authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('User must be authenticated');
      }

      // Check if user is authorized to update this order
      // Either admin or store owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const { data: store } = await supabase
        .from('stores')
        .select('owner_id')
        .eq('id', storeId)
        .single();

      const isAdmin = profile?.role === 'admin';
      const isStoreOwner = store?.owner_id === session.user.id;

      if (!isAdmin && !isStoreOwner) {
        throw new Error('Unauthorized: Only store owners and admins can update order status');
      }

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success(`Статус заказа обновлен на "${getStatusText(newStatus)}"`);
      
      // Call the callback to update parent component
      if (onStatusUpdate) {
        onStatusUpdate(order.id, newStatus);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error instanceof Error) {
        toast.error(`Ошибка: ${error.message}`);
      } else {
        toast.error('Не удалось обновить статус заказа');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter items to only show items from this store
  const storeItems = order.items?.filter((item: any) => item.product?.store_id === storeId) || [];
  const storeTotal = storeItems.reduce((sum: number, item: any) => 
    sum + (item.product?.price * item.quantity), 0
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Неизвестная дата';
    }
  };

  const getNextStatusOptions = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'pending':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['shipped', 'cancelled'];
      case 'shipped':
        return ['delivered', 'cancelled'];
      case 'delivered':
        return []; // Final status
      case 'cancelled':
        return []; // Final status
      default:
        return ['processing', 'cancelled'];
    }
  };

  const nextStatusOptions = getNextStatusOptions(order.status);

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div 
          className="flex justify-between items-center cursor-pointer" 
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2">{getStatusText(order.status)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Заказ #{order.id.substring(0, 8).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(order.created_at)} • {order.shipping_address?.fullName || 'Без имени'}
              </p>
              <p className="text-sm font-medium text-primary">
                Сумма: ${storeTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {nextStatusOptions.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {nextStatusOptions.length} действий
              </span>
            )}
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-6 border-t border-gray-200 pt-6 space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Информация о клиенте</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Имя:</span> {order.shipping_address?.fullName || 'Не указано'}</p>
                  <p><span className="font-medium">Email:</span> {order.customer_email || 'Не указан'}</p>
                  <p><span className="font-medium">Телефон:</span> {order.shipping_address?.phone || 'Не указан'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Адрес доставки</h4>
                <div className="text-sm text-gray-600">
                  <p>{order.shipping_address?.streetAddress || 'Не указан'}</p>
                  <p>
                    {order.shipping_address?.city || 'Город не указан'}, {order.shipping_address?.state || 'Регион не указан'} {order.shipping_address?.postalCode || ''}
                  </p>
                  <p>{order.shipping_address?.country || 'Страна не указана'}</p>
                </div>
              </div>
            </div>

            {/* Store Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Товары из вашего магазина</h4>
              <div className="space-y-3">
                {storeItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border">
                      <img
                        src={item.product?.image || '/placeholder.jpg'}
                        alt={item.product?.name || 'Product'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.product?.name || 'Неизвестный товар'}</h5>
                      <p className="text-sm text-gray-500">
                        Количество: {item.quantity} × ${item.product?.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Итого по вашему магазину:</span>
                  <span className="text-xl font-bold text-primary">${storeTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            {nextStatusOptions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Обновить статус заказа</h4>
                <div className="flex flex-wrap gap-2">
                  {nextStatusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        status === 'cancelled' 
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : status === 'delivered'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : status === 'shipped'
                          ? 'bg-purple-500 hover:bg-purple-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isUpdating ? 'Обновление...' : `Пометить как "${getStatusText(status)}"`}
                    </button>
                  ))}
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Совет:</strong> Обновляйте статус заказа по мере выполнения: 
                    Обработка → Отправлен → Доставлен
                  </p>
                </div>
              </div>
            )}

            {/* Final Status Message */}
            {nextStatusOptions.length === 0 && (
              <div className={`p-3 rounded-lg ${
                order.status === 'delivered' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className={`text-sm font-medium ${
                  order.status === 'delivered' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {order.status === 'delivered' 
                    ? '✅ Заказ успешно доставлен!' 
                    : '❌ Заказ был отменен'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOrderCard;