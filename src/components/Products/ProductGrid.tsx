import React from 'react';
import { Product } from '../../services/api/products';
import ProductCard from './ProductCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import AnimatedList from '../UI/AnimatedList';
import AnimatedCard from '../UI/AnimatedCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
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
      {/* Products count */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Найдено товаров: <span className="font-semibold text-gray-900">{products.length}</span>
        </p>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        <AnimatedList>
          {products.map((product, index) => (
            <div key={product.id} className="h-full">
              <AnimatedCard 
                className="h-full transition-transform duration-200 hover:scale-[1.02]" 
                delay={index * 0.05}
              >
                <ProductCard product={product} />
              </AnimatedCard>
            </div>
          ))}
        </AnimatedList>
      </div>
    </div>
  );
};

export default ProductGrid;