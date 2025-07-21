import React, { useState, useMemo } from 'react';
import { Product } from '../../services/api/products';
import ProductCard from './ProductCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import AnimatedCard from '../UI/AnimatedCard';
import { ChevronDown, List, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

type SortOption = 'default' | 'price-low' | 'price-high' | 'name' | 'newest';
type ViewMode = 'grid' | 'list';

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      default:
        return sorted;
    }
  }, [products, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L9 23M15 5v4"/>
            </svg>
          </div>
          <p className="text-gray-500 text-lg">Товары не найдены</p>
          <p className="text-gray-400 text-sm mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with results count, sort, and view options - Optimized for Desktop & Mobile */}
      <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Results count - Mobile optimized */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{products.length}</span> результатов
            </p>
            {/* Mobile view toggle - show on mobile only */}
            <div className="flex sm:hidden items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3 w-3" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List View"
              >
                <List className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop view toggle */}
            <div className="hidden sm:flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Dropdown - Optimized for mobile */}
            <div className="relative flex-1 sm:flex-none">
              <label htmlFor="sort-select" className="sr-only">Сортировать товары</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto appearance-none bg-white border border-gray-300 rounded-md px-3 sm:px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="default">По умолчанию</option>
                <option value="price-low">Цена ↑</option>
                <option value="price-high">Цена ↓</option>
                <option value="name">А-Я</option>
                <option value="newest">Новые</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid - Amazon style with fixed layout */}
      {viewMode === 'grid' ? (
        <div className="products-grid gap-2 sm:gap-3 md:gap-4">
          {sortedProducts.map((product, index) => (
            <motion.div 
              key={product.id} 
              className="product-grid-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <AnimatedCard className="h-full">
                <ProductCard product={product} viewMode="grid" />
              </AnimatedCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sortedProducts.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <AnimatedCard className="w-full">
                <ProductCard product={product} viewMode="list" />
              </AnimatedCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More Button (for pagination) */}
      {sortedProducts.length > 20 && (
        <div className="mt-8 text-center">
          <button className="bg-white border border-gray-300 rounded-md px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Показать еще товары
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;