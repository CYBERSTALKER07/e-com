import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../hooks/useAuth';
import { Store, CreateStoreDTO, Product, CartItem } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AdminProductForm from '../components/Admin/AdminProductForm';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout/Layout';
import { X } from 'lucide-react';

interface StoreOrder {
  id: string;
  created_at: string;
  customer_id: string;
  status: string;
  total: number;
  shipping_address: {
    fullName: string;
    [key: string]: any;
  };
  billing_address: any;
  payment_method: string;
  items: CartItem[];
  estimated_delivery: string;
}

const StorePage = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { userStores, loading, createStore, updateStore, deleteStore } = useStore();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newStore, setNewStore] = useState<CreateStoreDTO>({ name: '', description: '' });
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [storeProducts, setStoreProducts] = useState<Record<string, Product[]>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [storeOrders, setStoreOrders] = useState<Record<string, StoreOrder[]>>({});
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch products for a store
  const fetchStoreProducts = async (storeId: string) => {
    setIsLoadingProducts(true);
    try {
      const { data: productData, error } = await supabase
        .from('products')
        .select('id, name, description, price, image, stock_quantity, is_visible, sku, store_id')
        .eq('store_id', storeId);
      
      if (error) throw error;
      setStoreProducts(prev => ({ ...prev, [storeId]: productData || [] }));
    } catch (error) {
      console.error('Error fetching store products:', error);
      toast.error('Не удалось загрузить товары');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch orders for a store
  const fetchStoreOrders = async (storeId: string) => {
    setIsLoadingOrders(true);
    try {
      // First get all products for this store
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', storeId);

      if (!products) return;

      const productIds = products.map(p => p.id);

      // Then get orders containing these products
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, items')
        .neq('status', 'cancelled');

      if (error) throw error;

      // Filter orders to only include those with products from this store
      const storeOrders = orders?.filter(order => {
        const orderItems = order.items as CartItem[];
        return orderItems.some(item => productIds.includes(item.product.id));
      });

      setStoreOrders(prev => ({ ...prev, [storeId]: storeOrders || [] }));
    } catch (error) {
      console.error('Error fetching store orders:', error);
      toast.error('Не удалось загрузить заказы');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // When a store is selected, fetch its products and orders
  useEffect(() => {
    if (selectedStore) {
      fetchStoreProducts(selectedStore.id);
      fetchStoreOrders(selectedStore.id);
    }
  }, [selectedStore]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast.error('Please log in to create a store');
      return;
    }

    const store = await createStore(newStore);
    if (store) {
      setIsCreating(false);
      setNewStore({ name: '', description: '' });
      setSelectedStore(store);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    
    const updated = await updateStore({
      id: editingStore.id,
      name: editingStore.name,
      description: editingStore.description,
      is_active: editingStore.is_active
    });
    
    if (updated) {
      setEditingStore(null);
      if (selectedStore?.id === updated.id) {
        setSelectedStore(updated);
      }
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот магазин?')) {
      const success = await deleteStore(id);
      if (success && selectedStore?.id === id) {
        setSelectedStore(null);
      }
    }
  };

  const handleProductSave = async (product: Product) => {
    try {
      if (!selectedStore?.id) {
        throw new Error('No store selected');
      }

      // Clean and validate the data before saving
      const productData = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(product.price),
        image: product.image.trim(),
        category: product.category.trim(),
        store_id: selectedStore.id,
        stock_quantity: product.stock_quantity || 0,
        is_visible: true,
        sku: product.sku || `SKU-${Date.now()}`
      };

      // If editing an existing product, include the id
      if (product.id) {
        productData['id'] = product.id;
      }

      // Validate required fields
      if (!productData.name) throw new Error('Name is required');
      if (!productData.price || isNaN(productData.price)) throw new Error('Valid price is required');
      if (!productData.description) throw new Error('Description is required');
      if (!productData.image) throw new Error('Image is required');
      if (!productData.category) throw new Error('Category is required');

      console.log('Attempting to save product:', productData);

      const { data, error } = await supabase
        .from('products')
        .upsert(productData)
        .select();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Product saved successfully:', data);

      // Add back the specifications for the local state since we keep it in the frontend
      const savedProduct = {
        ...data[0],
        specifications: product.specifications || {}
      };

      // Update local state with the new/updated product
      setStoreProducts(prev => {
        const existingProducts = prev[selectedStore.id] || [];
        const updatedProducts = product.id
          ? existingProducts.map(p => p.id === savedProduct.id ? savedProduct : p)
          : [...existingProducts, savedProduct];
        
        return {
          ...prev,
          [selectedStore.id]: updatedProducts
        };
      });

      setIsProductFormOpen(false);
      setEditingProduct(null);
      toast.success(product.id ? 'Товар обновлен' : 'Товар добавлен');
    } catch (error: any) {
      console.error('Error saving product:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error
      });
      
      toast.error(
        error.message === 'No store selected'
          ? 'Пожалуйста, выберите магазин'
          : error.message || 'Не удалось сохранить товар'
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setStoreProducts(prev => ({
        ...prev,
        [selectedStore!.id]: prev[selectedStore!.id].filter(p => p.id !== productId)
      }));

      toast.success('Товар удален');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Не удалось удалить товар');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">Пожалуйста, войдите в систему для управления магазинами.</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Stores Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold mb-4">Мои магазины</h2>
              
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded mb-4"
                >
                  Создать новый магазин
                </button>
              ) : (
                <form onSubmit={handleCreateSubmit} className="mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Название магазина</label>
                      <input
                        type="text"
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                        placeholder="Введите название магазина"
                        aria-label="Название магазина"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Описание</label>
                      <textarea
                        value={newStore.description || ''}
                        onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
                        className="w-full p-2 border rounded"
                        rows={3}
                        placeholder="Введите описание магазина"
                        aria-label="Описание магазина"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={newStore.email || ''}
                        onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                        placeholder="Email для связи"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Телефон</label>
                      <input
                        type="tel"
                        value={newStore.phone || ''}
                        onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                        placeholder="Номер телефона"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Адрес</label>
                      <input
                        type="text"
                        value={newStore.address || ''}
                        onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                        placeholder="Адрес магазина"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Город</label>
                        <input
                          type="text"
                          value={newStore.city || ''}
                          onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                          className="w-full p-2 border rounded"
                          required
                          placeholder="Город"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Почтовый индекс</label>
                        <input
                          type="text"
                          value={newStore.postal_code || ''}
                          onChange={(e) => setNewStore({ ...newStore, postal_code: e.target.value })}
                          className="w-full p-2 border rounded"
                          required
                          placeholder="Почтовый индекс"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Создать
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {userStores.map((store) => (
                  <div 
                    key={store.id} 
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedStore?.id === store.id 
                        ? 'bg-blue-50 border-2 border-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedStore(store)}
                  >
                    <h3 className="font-medium">{store.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{store.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Store Content */}
          <div className="md:col-span-3">
            {selectedStore ? (
              <div className="bg-white rounded-lg shadow">
                {/* Store Header */}
                <div className="p-6 border-b">
                  {editingStore?.id === selectedStore.id ? (
                    <form onSubmit={handleUpdateSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Название магазина</label>
                          <input
                            type="text"
                            value={editingStore.name}
                            onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                            placeholder="Введите название магазина"
                            aria-label="Название магазина"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Описание</label>
                          <textarea
                            value={editingStore.description ?? ''}
                            onChange={(e) => setEditingStore({ ...editingStore, description: e.target.value })}
                            className="w-full p-2 border rounded"
                            rows={3}
                            placeholder="Введите описание магазина"
                            aria-label="Описание магазина"
                          />
                        </div>
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={editingStore.is_active}
                              onChange={(e) => setEditingStore({ ...editingStore, is_active: e.target.checked })}
                              className="form-checkbox"
                            />
                            <span className="text-sm font-medium">Активен</span>
                          </label>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded"
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStore(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h1 className="text-2xl font-bold">{selectedStore.name}</h1>
                          <p className="text-gray-600">{selectedStore.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingStore(selectedStore)}
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteStore(selectedStore.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedStore.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedStore.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      className={`px-4 py-3 font-medium text-sm flex items-center ${
                        activeTab === 'products' 
                          ? 'text-primary border-b-2 border-primary' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('products')}
                    >
                      Товары
                    </button>
                    <button
                      className={`px-4 py-3 font-medium text-sm flex items-center ${
                        activeTab === 'orders' 
                          ? 'text-primary border-b-2 border-primary' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('orders')}
                    >
                      Заказы
                    </button>
                  </div>
                </div>

                {/* Products Section */}
                {activeTab === 'products' && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Товары</h2>
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setIsProductFormOpen(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Добавить товар
                      </button>
                    </div>

                    {isLoadingProducts ? (
                      <LoadingSpinner />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storeProducts[selectedStore.id]?.map((product) => (
                          <div key={product.id} className="bg-white border rounded-lg overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="font-bold mb-2">{product.name}</h3>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                              <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                              <div className="mt-4 flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setIsProductFormOpen(true);
                                  }}
                                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                >
                                  Редактировать
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                >
                                  Удалить
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Section */}
                {activeTab === 'orders' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Заказы магазина</h2>
                    {isLoadingOrders ? (
                      <LoadingSpinner />
                    ) : !storeOrders[selectedStore.id]?.length ? (
                      <p className="text-gray-600 text-center">Заказов пока нет</p>
                    ) : (
                      <div className="space-y-4">
                        {storeOrders[selectedStore.id]?.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-medium">Заказ #{order.id.substring(0, 8)}</h3>
                                <p className="text-sm text-gray-600">
                                  Оформлен: {new Date(order.created_at).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Покупатель: {order.shipping_address.fullName}
                                </p>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-sm ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status === 'pending' ? 'Новый' :
                                 order.status === 'processing' ? 'В обработке' :
                                 order.status === 'shipped' ? 'Отправлен' :
                                 order.status === 'delivered' ? 'Доставлен' :
                                 'Отменен'}
                              </div>
                            </div>
                            <div className="space-y-4 border-t pt-4">
                              {(order.items as CartItem[])
                                .filter(item => item.product.store_id === selectedStore.id)
                                .map(item => (
                                  <div key={item.product.id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                      <div className="ml-4">
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-gray-600">
                                          Количество: {item.quantity} × ${item.product.price}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="font-medium">
                                      ${(item.product.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                              ))}
                            </div>
                            <div className="border-t mt-4 pt-4 text-right">
                              <p className="text-sm text-gray-600">
                                Сумма товаров магазина: ${(order.items as CartItem[])
                                  .filter(item => item.product.store_id === selectedStore.id)
                                  .reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
                                  .toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">Выберите магазин слева или создайте новый</p>
              </div>
            )}
          </div>
        </div>

        {/* Product Form Modal */}
        {isProductFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white w-full min-h-screen">
              <div className="border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
                    </h2>
                    <button
                      onClick={() => {
                        setIsProductFormOpen(false);
                        setEditingProduct(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 p-2"
                      aria-label="Close"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="max-w-4xl mx-auto px-6 py-6">
                <AdminProductForm
                  product={editingProduct}
                  onSave={handleProductSave}
                  onCancel={() => {
                    setIsProductFormOpen(false);
                    setEditingProduct(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StorePage;