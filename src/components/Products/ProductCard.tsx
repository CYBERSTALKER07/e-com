import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product & {
    stores?: {
      name: string;
      description: string | null;
    };
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      className="group"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1">
        <div className="relative aspect-w-1 aspect-h-1">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-2 right-2">
            <button
              onClick={handleAddToCart}
              className="p-2 bg-white rounded-full shadow-md hover:bg-primary hover:text-white transition-colors"
              aria-label="Добавить в корзину"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {product.stores && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Store className="h-4 w-4 mr-1" />
              <span>{product.stores.name}</span>
            </div>
          )}
          
          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 capitalize">{product.category}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;