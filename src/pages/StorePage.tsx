import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Store, CreateStoreDTO, Product } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import AdminProductForm from '../components/Admin/AdminProductForm';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout/Layout';

const StorePage = () => {
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

  // When a store is selected, fetch its products
  useEffect(() => {
    if (selectedStore) {
      fetchStoreProducts(selectedStore.id);
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
      const { data, error } = await supabase
        .from('products')
        .upsert({
          ...product,
          store_id: selectedStore?.id
        })
        .select()
        .single();

      if (error) throw error;

      setStoreProducts(prev => ({
        ...prev,
        [selectedStore!.id]: prev[selectedStore!.id].map(p => 
          p.id === data.id ? data : p
        ).concat(product.id ? [] : [data])
      }));

      setIsProductFormOpen(false);
      setEditingProduct(null);
      toast.success(product.id ? 'Товар обновлен' : 'Товар добавлен');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Не удалось сохранить товар');
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

                {/* Products Section */}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
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
        )}
      </div>
    </Layout>
  );
};

export default StorePage;