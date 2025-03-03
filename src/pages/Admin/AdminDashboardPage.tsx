import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingBag, DollarSign, Plus, Pencil, Trash2, Search } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import AdminOrderCard from '../../components/Admin/AdminOrderCard';
import { useOrder } from '../../context/OrderContext';
import { OrderStatus, Product } from '../../types';
import AuthGuard from '../../components/Auth/AuthGuard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { products as mockProducts } from '../../data/products';
import { toast } from 'react-hot-toast';
import AdminProductForm from '../../components/Admin/AdminProductForm';
import AdminUsersList from '../../components/Admin/AdminUsersList';

type AdminTab = 'dashboard' | 'orders' | 'products' | 'users';

const AdminDashboardPage: React.FC = () => {
  const { getAllOrders, updateOrderStatus } = useOrder();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const allOrders = await getAllOrders();
        setOrders(allOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Не удалось загрузить заказы');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [getAllOrders]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const success = await updateOrderStatus(orderId, status);
    if (success) {
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    // In a real app, this would call an API to delete the product
    // For now, we'll just update the local state
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast.success('Товар успешно удален');
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? product : p)
      );
      toast.success('Товар успешно обновлен');
    } else {
      // Add new product with a generated ID
      const newProduct = {
        ...product,
        id: Date.now().toString(), // Simple ID generation for demo
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
      toast.success('Товар успешно добавлен');
    }
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const filteredProducts = searchQuery
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

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

  return (
    <AuthGuard requireAdmin>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Package className="h-6 w-6 mr-2 text-primary" />
            Панель администратора
          </h1>

          {/* Admin Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="flex overflow-x-auto">
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'dashboard' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <Package className="h-4 w-4 mr-2" />
                Обзор
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'orders' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Заказы
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'products' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('products')}
              >
                <Package className="h-4 w-4 mr-2" />
                Товары
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'users' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Пользователи
              </button>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="bg-primary-light/20 p-3 rounded-full">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Всего заказов</p>
                      <h3 className="text-xl font-bold text-gray-900">{totalOrders}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Общая выручка</p>
                      <h3 className="text-xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">В обработке</p>
                      <h3 className="text-xl font-bold text-gray-900">{processingOrders}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Товары</p>
                      <h3 className="text-xl font-bold text-gray-900">{products.length}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Последние заказы</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    Смотреть все
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Заказы не найдены</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map(order => (
                      <AdminOrderCard 
                        key={order.id} 
                        order={order} 
                        onStatusChange={handleStatusChange} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Order Status Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Сводка по статусам заказов</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium">Ожидает</p>
                    <p className="text-2xl font-bold text-yellow-800">{pendingOrders}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">В обработке</p>
                    <p className="text-2xl font-bold text-blue-800">{processingOrders}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Отправлен</p>
                    <p className="text-2xl font-bold text-purple-800">{shippedOrders}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Доставлен</p>
                    <p className="text-2xl font-bold text-green-800">{deliveredOrders}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Отменен</p>
                    <p className="text-2xl font-bold text-red-800">{cancelledOrders}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <>
              {/* Order Status Filter */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Фильтр заказов</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilter('all')}
                  >
                    Все заказы
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilter('pending')}
                  >
                    Ожидает ({pendingOrders})
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'processing' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilter('processing')}
                  >
                    В обработке ({processingOrders})
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'shipped' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilter('shipped')}
                  >
                    Отправлен ({shippedOrders})
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilter('delivered')}
                  >
                    Доставлен ({deliveredOrders})
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilter('cancelled')}
                  >
                    Отменен ({cancelledOrders})
                  </button>
                </div>
              </div>

              {/* Orders List */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {filter === 'all' ? 'Все заказы' : `Заказы со статусом "${getStatusText(filter)}"`}
                </h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600">Заказы не найдены.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <AdminOrderCard 
                        key={order.id} 
                        order={order} 
                        onStatusChange={handleStatusChange} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Товары</h2>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductFormOpen(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить товар
                  </button>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск товаров..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Товар
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Категория
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Цена
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{product.description.substring(0, 50)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Form Modal */}
              {isProductFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
                      </h2>
                      <AdminProductForm
                        product={editingProduct}
                        onSave={handleSaveProduct}
                        onCancel={() => {
                          setIsProductFormOpen(false);
                          setEditingProduct(null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Пользователи</h2>
              <AdminUsersList />
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default AdminDashboardPage;