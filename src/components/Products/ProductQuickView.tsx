import React, { useEffect, useRef, useState } from 'react';
import { X, ShoppingCart, Heart, Star, Zap, Shield, Truck, Plus, Minus } from 'lucide-react';
import { gsap } from 'gsap';
import { Product } from '../../services/api/products';

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock additional images for demonstration
  const productImages = [
    product.image,
    product.image, // In a real app, you'd have multiple product images
    product.image
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      if (overlayRef.current && contentRef.current) {
        gsap.set(overlayRef.current, { opacity: 0 });
        gsap.set(contentRef.current, { scale: 0.8, opacity: 0, y: 50 });
        
        const tl = gsap.timeline();
        tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
          .to(contentRef.current, { 
            scale: 1, 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            ease: 'back.out(1.4)' 
          }, 0.1);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (overlayRef.current && contentRef.current) {
      const tl = gsap.timeline();
      tl.to(contentRef.current, { 
        scale: 0.8, 
        opacity: 0, 
        y: 50, 
        duration: 0.3, 
        ease: 'power2.in' 
      })
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, 0.1)
      .call(() => onClose());
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    handleClose();
  };

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />
      
      {/* Modal Content */}
      <div 
        ref={contentRef}
        className="relative w-full max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-all duration-300 group"
        >
          <X className="h-5 w-5 text-gray-600 group-hover:text-red-500 group-hover:scale-110 transition-all" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left Column - Images */}
          <div className="relative p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                  In Stock
                </span>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                  Premium
                </span>
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 group"
              >
                <Heart className={`h-5 w-5 transition-all group-hover:scale-110 ${
                  isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
                }`} />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 justify-center">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === index 
                      ? 'border-indigo-500 shadow-lg scale-110' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="p-8">
            {/* Product Info */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) • 127 reviews</span>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-indigo-600">
                  ${product.price}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {product.stock_quantity} in stock
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <Truck className="h-5 w-5 text-indigo-600 mb-1" />
                <span className="text-xs font-medium text-gray-700">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <Shield className="h-5 w-5 text-green-600 mb-1" />
                <span className="text-xs font-medium text-gray-700">Secure</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <Zap className="h-5 w-5 text-purple-600 mb-1" />
                <span className="text-xs font-medium text-gray-700">Fast Delivery</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-8">
              <label className="text-sm font-semibold text-gray-700">Quantity:</label>
              <div className="flex items-center space-x-3 bg-gray-100 rounded-xl p-2">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-1 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="text-lg font-semibold text-gray-900 px-3">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock_quantity}
                  className="p-1 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart • ${(product.price * quantity).toFixed(2)}</span>
              </button>
              
              <button
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold border-2 border-gray-200 hover:border-gray-300"
              >
                View Full Details
              </button>
            </div>

            {/* Trust Signals */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <span>Free Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;