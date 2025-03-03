import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { OrderStatus } from '../types';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrder } = useOrder();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const order = id ? getOrder(id) : undefined;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!order) {
      navigate('/orders');
    } else if (!isAdmin && order.customerEmail !== user?.email) {
      // If not admin and not the order owner, redirect
      navigate('/orders');
    }
  }, [isAuthenticated, order, user, isAdmin, navigate]);

  if (!isAuthenticated || !order) {
    return null; // Will redirect
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/orders" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className={`mt-4 sm:mt-0 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center`}>
                {getStatusIcon(order.status)}
                <span className="ml-2">{getStatusText(order.status)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <ul className="space-y-6 relative">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center z-10">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Order Placed</h3>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </li>
                
                {order.status !== 'pending' && order.status !== 'cancelled' && (
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center z-10">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">Processing</h3>
                      <p className="text-sm text-gray-500">Your order is being prepared</p>
                    </div>
                  </li>
                )}
                
                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center z-10">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">Shipped</h3>
                      <p className="text-sm text-gray-500">Your order is on the way</p>
                    </div>
                  </li>
                )}
                
                {order.status === 'delivered' && (
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center z-10">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">Delivered</h3>
                      <p className="text-sm text-gray-500">Your order has been delivered</p>
                    </div>
                  </li>
                )}
                
                {order.status === 'cancelled' && (
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-600 flex items-center justify-center z-10">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">Cancelled</h3>
                      <p className="text-sm text-gray-500">Your order has been cancelled</p>
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
                        {order.status === 'pending' ? 'Processing' : 
                         order.status === 'processing' ? 'Shipped' : 'Delivered'}
                      </h3>
                      <p className="text-sm text-gray-500">Estimated: {formatDate(order.estimatedDelivery)}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-gray-800 font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-gray-600">{order.shippingAddress.streetAddress}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
                <p className="text-gray-600 mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-gray-800 font-medium">Payment Method</p>
                <p className="text-gray-600 capitalize">{order.paymentMethod.replace('-', ' ')}</p>
                
                <p className="text-gray-800 font-medium mt-4">Billing Address</p>
                <p className="text-gray-600">{order.billingAddress.fullName}</p>
                <p className="text-gray-600">{order.billingAddress.streetAddress}</p>
                <p className="text-gray-600">
                  {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                </p>
                <p className="text-gray-600">{order.billingAddress.country}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
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
                      Subtotal
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
      </div>
    </Layout>
  );
};

export default OrderDetailPage;