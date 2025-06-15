import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  return (
    <Link 
      to={`/products/${product.id}`}
      className="block"
    >
      <div 
        className="group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
          />
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              className="bg-primary text-white hover:bg-primary-dark p-3 rounded-full transform hover:scale-110 transition-all"
              title="Добавить в корзину"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>
          {/* Labels */}
          {product.stock_quantity === 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Out of Stock
            </div>
          )}
          {product.is_visible === false && (
            <div className="absolute top-4 right-4 bg-gray-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Скрыто
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;