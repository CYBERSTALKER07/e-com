import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ProductGrid from '../components/Products/ProductGrid';
import ProductFilter from '../components/Products/ProductFilter';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Import our animation components
import AnimatedPage from '../components/UI/AnimatedPage';
import FadeIn from '../components/UI/FadeIn';

// Import our API services
import { getAllProducts, Product } from '../services/api/products';
import { getAllStores } from '../services/api/stores';

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

  // Fetch products from all active stores using our backend API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch active stores using our backend API
        const storesData = await getAllStores();
        const activeStores = storesData.filter(store => store.is_active);
        setStores(activeStores.map(store => ({ id: store.id, name: store.name })));

        // Fetch products using our backend API
        const productsData = await getAllProducts();
        
        // Filter out products from inactive stores
        const activeStoreIds = activeStores.map(store => store.id);
        const validProducts = productsData.filter(product => 
          activeStoreIds.includes(product.store_id)
        );
        
        setProducts(validProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(validProducts.map(p => p.category)));
        setCategories(uniqueCategories);

        // Set initial price range based on actual product prices
        const prices = validProducts.map(p => p.price);
        const maxPrice = Math.max(...prices, 0);
        setPriceRange([0, maxPrice]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Не удалось загрузить товары');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
      <AnimatedPage className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <FadeIn className="md:w-64" delay={0.2}>
            <ProductFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              maxPrice={Math.max(...products.map(p => p.price), 0)}
              stores={stores}
              selectedStore={selectedStore}
              onStoreChange={setSelectedStore}
            />
          </FadeIn>

          <main className="flex-1">
            {searchQuery && (
              <FadeIn className="mb-4 text-gray-600">
                <p>Результаты поиска для: "{searchQuery}"</p>
              </FadeIn>
            )}
            
            <FadeIn delay={0.4}>
              <ProductGrid products={filteredProducts} isLoading={isLoading} />
            </FadeIn>
          </main>
        </div>
      </AnimatedPage>
    </Layout>
  );
};

export default ProductsPage;