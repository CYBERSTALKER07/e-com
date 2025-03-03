import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ProductGrid from '../components/Products/ProductGrid';
import ProductFilter from '../components/Products/ProductFilter';
import { products, categories } from '../data/products';
import { Product } from '../types';

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');
  const categoryParam = queryParams.get('category');

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [isLoading, setIsLoading] = useState(true);

  // Find the maximum price in the product list
  const maxPrice = Math.max(...products.map(product => product.price));

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    
    setTimeout(() => {
      let result = [...products];
      
      // Apply search filter if provided
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter if selected
      if (selectedCategory) {
        result = result.filter(product => product.category === selectedCategory);
      }
      
      // Apply price range filter
      result = result.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
      
      setFilteredProducts(result);
      setIsLoading(false);
    }, 500); // Simulate network delay
  }, [searchQuery, selectedCategory, priceRange]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <ProductFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
              maxPrice={maxPrice}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCategory 
                  ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} товары`
                  : searchQuery
                  ? `Результаты поиска для "${searchQuery}"`
                  : 'Все товары'}
              </h1>
              <p className="text-gray-600 mt-2">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : 
                  filteredProducts.length >= 2 && filteredProducts.length <= 4 ? 'товара' : 'товаров'} найдено
              </p>
            </div>
            
            <ProductGrid products={filteredProducts} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;