import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../hooks/useAuth';
import { Store, CreateStoreDTO, Product, CartItem } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AdminProductForm from '../components/Admin/AdminProductForm';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout/Layout';
import { X, Package as PackageIcon, ShoppingBag, Clock, DollarSign } from 'lucide-react';
import { deleteProduct } from '../services/api/products'; // Fixed import path

interface StoreOrder {
  id: string;
  created_at: string;
  customer_id: string;
  status: string;
  total: number;
  shipping_address: ShippingAddress;
  billing_address: BillingAddress;
  payment_method: string;
  items: CartItem[];
  estimated_delivery: string;
}

interface ShippingAddress {
  fullName: string;
  [key: string]: string;
}

interface RawShippingAddress {
  fullName?: string;
  [key: string]: string | undefined;
}

interface BillingAddress {
  [key: string]: string;
}

const StorePage = () => {
  const { stores: userStores, loading, addStore: createStore, editStore: updateStore, removeStore: deleteStore } = useStore();
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
        .select('*')
        .eq('store_id', storeId);
      
      if (error) throw error;

      const typedProducts: Product[] = productData?.map(p => ({
        ...p,
        category: p.category || '',
        specifications: {}
      })) || [];
      
      setStoreProducts(prev => ({ ...prev, [storeId]: typedProducts }));
    } catch (error: unknown) {
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
      // Fetch orders that have items from this store
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .filter('items', 'cs', `[{"product":{"store_id":"${storeId}"}}]`)
        .neq('status', 'cancelled');

      if (error) throw error;

      const typedOrders: StoreOrder[] = orders?.map(order => ({
        ...order,
        items: (order.items as unknown as CartItem[]) || [],
        shipping_address: {
          fullName: (order.shipping_address as RawShippingAddress)?.fullName || '',
          ...(order.shipping_address as RawShippingAddress || {})
        },
        billing_address: order.billing_address as BillingAddress || {}
      })) || [];

      setStoreOrders(prev => ({ ...prev, [storeId]: typedOrders }));
    } catch (error: unknown) {
      console.error('Error fetching store orders:', error);
      toast.error('Не удалось загрузить заказы');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // When a store is selected, fetch its products and orders
  useEffect(() => {
    if (selectedStore) {
      // Initialize empty arrays in state to prevent map errors
      setStoreProducts(prev => ({
        ...prev,
        [selectedStore.id]: prev[selectedStore.id] || []
      }));
      setStoreOrders(prev => ({
        ...prev,
        [selectedStore.id]: prev[selectedStore.id] || []
      }));
      
      // Then fetch data
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
    
    const updateData = {
      id: editingStore.id,
      name: editingStore.name,
      description: editingStore.description,
      // Remove is_active as it's not in UpdateStoreDTO
    };
    
    const updated = await updateStore(updateData);
    
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

      // Check for duplicate products by name
      const { data: existingProducts, error: searchError } = await supabase
        .from('products')
        .select('*')
        .ilike('name', product.name);

      if (searchError) {
        console.error('Error checking for duplicates:', searchError);
        throw searchError;
      }

      // If this is a new product (no id) or we're updating a different product
      if (existingProducts?.length > 0) {
        const duplicate = existingProducts.find(p => 
          p.id !== product.id && // Skip current product when updating
          p.store_id !== selectedStore.id && // Only check other stores
          p.name.toLowerCase() === product.name.toLowerCase()
        );

        if (duplicate) {
          toast.error('This product already exists in another store. Each product must be unique across all stores.');
          return;
        }
      }

      // Clean up product data to match Supabase schema
      const productData = {
        id: product.id,
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

      // Remove undefined id for new products
      if (!productData.id) {
        delete productData.id;
      }

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
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      toast.error(
        error instanceof Error && error.message === 'No store selected'
          ? 'Пожалуйста, выберите магазин'
          : error instanceof Error ? error.message : 'Не удалось сохранить товар'
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    try {
      setIsLoadingProducts(true); // Show loading indicator while deleting

      // Use the enhanced deleteProduct function from the API
      const { success, error } = await deleteProduct(productId, {
        onSuccess: () => {
          toast.success('Товар успешно удален');
        },
        onError: (err) => {
          console.error('Error deleting product:', err);
          toast.error('Не удалось удалить товар');
        }
      });

      if (success) {
        // Update local state immediately
        setStoreProducts(prev => ({
          ...prev,
          [selectedStore!.id]: prev[selectedStore!.id].filter(p => p.id !== productId)
        }));
        
        // Re-fetch the products list from the server to ensure sync
        if (selectedStore) {
          await fetchStoreProducts(selectedStore.id);
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Не удалось удалить товар');
    } finally {
      setIsLoadingProducts(false); // Hide loading indicator
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
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4" data-aos="fade-up">Store Dashboard</h1>
              <p className="text-lg text-gray-100 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
                Track your store performance, manage products, and handle orders
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {selectedStore && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="bg-primary-light/20 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <h3 className="text-xl font-bold text-gray-900">
                      {storeProducts[selectedStore.id]?.length || 0}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <PackageIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <h3 className="text-xl font-bold text-gray-900">
                      {storeOrders[selectedStore.id]?.length || 0}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Pending Orders</p>
                    <h3 className="text-xl font-bold text-gray-900">
                      {storeOrders[selectedStore.id]?.filter(order => order.status === 'pending').length || 0}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <h3 className="text-xl font-bold text-gray-900">
                      ${storeOrders[selectedStore.id]?.reduce((sum, order) => {
                        const storeItems = order.items.filter(item => item.product.store_id === selectedStore.id);
                        return sum + storeItems.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0);
                      }, 0).toFixed(2) || '0.00'}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
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

                <div className="space-y-4">
                  {userStores && userStores.length > 0 ? userStores.map((store) => (
                    <div 
                      key={store.id} 
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedStore?.id === store.id 
                          ? 'bg-primary/10 border-2 border-primary shadow-md' 
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                      onClick={() => setSelectedStore(store)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{store.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          store.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {store.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{store.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="flex items-center">
                          {storeProducts[store.id]?.length || 0} products
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          {storeOrders[store.id]?.length || 0} orders
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-500">
                      У вас пока нет магазинов
                    </div>
                  )}
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
                          {storeProducts[selectedStore.id] && storeProducts[selectedStore.id].length > 0 ? 
                            storeProducts[selectedStore.id].map((product) => (
                              <div key={product.id} className="group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="relative aspect-w-4 aspect-h-3">
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                                </div>
                                <div className="p-4">
                                  <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                                  <div className="flex items-center justify-between mb-4">
                                    <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                                    <span className="text-sm text-gray-500">Stock: {product.stock_quantity}</span>
                                  </div>
                                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                      onClick={() => {
                                        setEditingProduct(product);
                                        setIsProductFormOpen(true);
                                      }}
                                      className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                            : (
                              <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
                                <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Add products to your store to start selling.</p>
                              </div>
                            )
                          }
                        </div>
                      )}
                    </div>
                  )}

                  {/* Orders Section */}
                  {activeTab === 'orders' && (
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Orders</h2>
                        <div className="flex space-x-4">
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                            <span className="text-sm text-gray-600">Pending</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                            <span className="text-sm text-gray-600">Processing</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            <span className="text-sm text-gray-600">Delivered</span>
                          </div>
                        </div>
                      </div>
                      {isLoadingOrders ? (
                        <LoadingSpinner />
                      ) : !storeOrders[selectedStore.id]?.length ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                          <p className="mt-1 text-sm text-gray-500">Start selling to see your orders here.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {storeOrders[selectedStore.id]?.map((order) => (
                            <div key={order.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                              <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold">Order #{order.id.substring(0, 8)}</h3>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm text-gray-600">
                                        Placed on: {new Date(order.created_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Customer: {order.shipping_address.fullName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status === 'pending' ? 'Pending' :
                                     order.status === 'processing' ? 'Processing' :
                                     order.status === 'shipped' ? 'Shipped' :
                                     order.status === 'delivered' ? 'Delivered' :
                                     'Cancelled'}
                                  </div>
                                </div>
                                <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                                  <div className="space-y-4">
                                    {(order.items as CartItem[])
                                      .filter(item => item.product.store_id === selectedStore.id)
                                      .map(item => (
                                        <div key={item.product.id} className="flex items-center">
                                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                            <img
                                              src={item.product.image}
                                              alt={item.product.name}
                                              className="h-full w-full object-cover object-center"
                                            />
                                          </div>
                                          <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                              <div>
                                                <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                                <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                  ${(item.product.price * item.quantity).toFixed(2)}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                  ${item.product.price} each
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="border-t border-gray-200 mt-4 pt-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Order Total:</span>
                                    <span className="text-lg font-semibold text-primary">
                                      ${(order.items as CartItem[])
                                        .filter(item => item.product.store_id === selectedStore.id)
                                        .reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
                                        .toFixed(2)}
                                    </span>
                                  </div>
                                </div>
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
      </div>
    </Layout>
  );
};

export default StorePage;