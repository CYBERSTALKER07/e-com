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
        <p className="text-gray-500">Товары не найдены</p>
      </div>
    );
  }

  // Wrap each product card in an AnimatedCard
  const productItems = products.map(product => (
    <div key={product.id} className="h-full">
      <AnimatedCard className="h-full">
        <ProductCard product={product} />
      </AnimatedCard>
    </div>
  ));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
      <AnimatedList>
        {productItems}
      </AnimatedList>
    </div>
  );
};

export default ProductGrid;