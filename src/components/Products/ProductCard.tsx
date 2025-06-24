import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../../services/api/products';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import { buttonTap } from '../../lib/animations';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      className="block h-full"
    >
      <div 
        className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Hover Overlay */}
          <div 
            className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <motion.button
              onClick={handleAddToCart}
              className="bg-primary text-white hover:bg-primary-dark p-3 rounded-full transition-all"
              title="Добавить в корзину"
              whileTap={buttonTap}
            >
              <ShoppingCart className="h-5 w-5" />
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                // Favorite feature would go here
              }}
              className="bg-white text-primary hover:bg-gray-100 p-3 rounded-full transition-all"
              title="Добавить в избранное"
              whileTap={buttonTap}
            >
              <Heart className="h-5 w-5" />
            </motion.button>
          </div>
          
          {/* Labels */}
          {product.stock_quantity === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full"
            >
              Out of Stock
            </motion.div>
          )}
          {product.is_visible === false && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 bg-gray-500 text-white text-sm font-medium px-3 py-1 rounded-full"
            >
              Скрыто
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2 flex-grow">{product.description}</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500">
              {product.category && (
                <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-medium text-gray-800 mr-1">
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;