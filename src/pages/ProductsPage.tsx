import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ProductGrid from '../components/Products/ProductGrid';
import ProductFilter from '../components/Products/ProductFilter';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');
  const categoryParam = queryParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  // Fetch products from all active stores
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch active stores first
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select('id, name')
          .eq('is_active', true);

        if (storesError) throw storesError;
        setStores(storesData || []);

        // Fetch products from active stores
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            store:store_id (
              name,
              is_active
            )
          `)
          .eq('store.is_active', true);

        if (error) throw error;

        const validProducts = data.filter(product => product.store !== null);
        setProducts(validProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(validProducts.map(p => p.category)));
        setCategories(uniqueCategories);

        // Set initial price range based on actual product prices
        const prices = validProducts.map(p => p.price);
        const maxPrice = Math.max(...prices, 0);
        setPriceRange([0, maxPrice]);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Не удалось загрузить товары');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search, category, store, and price range
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStore) {
      filtered = filtered.filter(product => product.store_id === selectedStore);
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, selectedStore, priceRange]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64">
            <ProductFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              maxPrice={Math.max(...products.map(p => p.price))}
              stores={stores}
              selectedStore={selectedStore}
              onStoreChange={setSelectedStore}
            />
          </aside>

          <main className="flex-1">
            {searchQuery && (
              <p className="mb-4 text-gray-600">
                Результаты поиска для: "{searchQuery}"
              </p>
            )}
            
            <ProductGrid products={filteredProducts} isLoading={isLoading} />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;