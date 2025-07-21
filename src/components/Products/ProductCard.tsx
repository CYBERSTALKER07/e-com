import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, StarHalf } from 'lucide-react';
import { Product } from '../../services/api/products';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import { buttonTap } from '../../lib/animations';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      specifications: {}
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Wishlist functionality would go here
  };

  // Mock rating data - replace with actual ratings from your database
  const mockRating = 4.2;
  const mockReviewCount = Math.floor(Math.random() * 1000) + 50;
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-orange-400 text-orange-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-3 w-3 fill-orange-400 text-orange-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }
    
    return stars;
  };

  // List view - horizontal "lying flat" cards
  if (viewMode === 'list') {
    return (
      <motion.div
        className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex h-48 md:h-56 lg:h-64">
          {/* Image Section - Left side */}
          <div className="relative w-48 md:w-56 lg:w-64 flex-shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.stock_quantity > 0 ? (
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                  In Stock
                </span>
              ) : (
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <motion.button
              onClick={handleWishlist}
              className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all ${
                isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
              }`}
              whileTap={buttonTap}
            >
              <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
            </motion.button>
          </div>

          {/* Content Section - Right side */}
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
            <div>
              <Link to={`/products/${product.id}`}>
                <h4 className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
                  {product.name}
                </h4>
              </Link>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {renderStars(mockRating).map((star, index) => (
                    <span key={index}>
                      {React.cloneElement(star, { className: "h-3 w-3 fill-current text-orange-400" })}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({mockReviewCount})
                </span>
              </div>

              <p className="text-gray-600 text-sm md:text-base line-clamp-2 mb-4">
                {product.description}
              </p>
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  ${product.price}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
              </div>
              
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                whileTap={buttonTap}
                whileHover={{ scale: 1.05 }}
              >
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view - vertical cards with New Arrivals styling
  return (
    <Link to={`/products/${product.id}`} className="block h-full">
      <motion.div 
        className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Image Container */}
        <div className="relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-t-xl" />
          )}
          <img 
            src={product.image} 
            alt={product.name}
            className={`w-full h-48 md:h-56 lg:h-64 object-contain group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.stock_quantity > 0 ? (
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                Available
              </span>
            ) : (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <motion.button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all ${
              isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
            }`}
            whileTap={buttonTap}
          >
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
          </motion.button>

          {/* Quick add to cart overlay */}
          <motion.div
            className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <motion.button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="bg-white text-gray-900 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium shadow-lg hover:bg-gray-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              whileTap={buttonTap}
              whileHover={{ scale: 1.05 }}
            >
              Quick Add
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex-1 flex flex-col">
          <h4 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {product.name}
          </h4>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {renderStars(mockRating).slice(0, 5).map((star, index) => (
                <span key={index}>
                  {React.cloneElement(star, { className: "h-3 w-3 fill-current text-orange-400" })}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({mockReviewCount})
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-bold text-primary">
                ${product.price}
              </span>
              <span className="text-xs md:text-sm text-gray-500 line-through">
                ${(product.price * 1.2).toFixed(2)}
              </span>
            </div>
            
            <motion.button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 md:px-4 md:py-2 rounded-md text-sm font-medium transition-colors"
              whileTap={buttonTap}
            >
              Add
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;