import React from 'react';
import { Clock, Package, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface AdminOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const AdminOrderCard: React.FC<AdminOrderCardProps> = ({ order, onStatusChange }) => {
  const [expanded, setExpanded] = React.useState(false);

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
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
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
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} mr-4 flex items-center`}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{getStatusText(order.status)}</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Order #{typeof order.id === 'string' ? order.id.substring(0, 8).toUpperCase() : 'Unknown'}</h3>
              <p className="text-sm text-gray-500">
                {formatDate(order.createdAt || order.created_at)} • {order.customerName || order.customer_name || 'N/A'} • ${order.total.toFixed(2)}
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {expanded && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span> {order.customerName || order.customer_name || 'N/A'}<br />
                  <span className="font-medium">Email:</span> {order.customerEmail || order.customer_email || 'N/A'}<br />
                  <span className="font-medium">Phone:</span> {(order.shippingAddress?.phone || order.shipping_address?.phone) || 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                <p className="text-sm text-gray-600">
                  {(order.shippingAddress?.streetAddress || order.shipping_address?.streetAddress) || 'N/A'}<br />
                  {(order.shippingAddress?.city || order.shipping_address?.city) || 'N/A'}, {(order.shippingAddress?.state || order.shipping_address?.state) || 'N/A'} {(order.shippingAddress?.postalCode || order.shipping_address?.postalCode) || 'N/A'}<br />
                  {(order.shippingAddress?.country || order.shipping_address?.country) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
              <div className="space-y-3">
                {(order.items || []).map((item) => (
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
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-sm font-bold text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Update Order Status</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'pending')}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'processing' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'processing')}
                >
                  Processing
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'shipped' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'shipped')}
                >
                  Shipped
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'delivered')}
                >
                  Delivered
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-medium ${order.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => onStatusChange(order.id, 'cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderCard;