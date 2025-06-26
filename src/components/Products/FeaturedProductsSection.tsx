import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import AnimatedCard from '../UI/AnimatedCard';

interface FeaturedProductsSectionProps {
  products: Product[];
  title?: string;
  description?: string;
}

const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  title = "Избранные коллекции",
  description = "Откройте для себя наши самые популярные предметы мужской одежды, идеально подходящие для климата и образа жизни Ташкента"
}) => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        {/* Featured Products Grid - Always 4 in a row on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 auto-rows-fr">
          {products.slice(0, 4).map(product => (
            <div key={product.id} className="h-full">
              <AnimatedCard className="h-full">
                <ProductCard product={product} />
              </AnimatedCard>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block bg-primary text-white hover:bg-primary-dark px-6 py-3 rounded-md font-medium transition-colors"
          >
            Смотреть все коллекции
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;