import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Filter, Grid, List } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { getAllProducts, Product } from '../services/api/products';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Link } from 'react-router-dom';
import { 
  oldMoneyAestheticImages, 
  fashionImages, 
  lifestyleImages,
  frenchHairSecrets,
  momSummerWardrobe,
  oldMoneyMensOutfits,
  professionalBlend,
  luxuriousPolo,
  understatedOpulence,
  premiumSweater,
  timelessElegance,
  quietLuxury,
  engagementRing,
  bookLovers,
  loafers,
  sweater,
  product1,
  product2,
  product3,
  product4,
  product5,
  productStyle
} from '../assets/images';

// Your curated old money aesthetic collection using your uploaded images
export const oldMoneyImages = [
  // Import your uploaded images
  frenchHairSecrets,
  momSummerWardrobe,
  oldMoneyMensOutfits,
  professionalBlend,
  luxuriousPolo,
  understatedOpulence,
  premiumSweater,
  timelessElegance,
  quietLuxury,
  engagementRing,
  bookLovers,
  loafers,
  sweater,
  product1,
  product2,
  product3,
  product4,
  product5,
  productStyle,
  
  // Keep some Unsplash images to fill out the gallery
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&h=700&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=650&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=700&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=500&h=650&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=500&h=800&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3e8a?w=500&h=750&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=700&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=650&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=750&fit=crop&crop=entropy',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&h=700&fit=crop&crop=entropy'
];

const GalleryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [galleryMode, setGalleryMode] = useState<'products' | 'aesthetic'>('aesthetic');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getAllProducts();
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === category));
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const toggleFavoriteImage = (imageIndex: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      const imageId = `aesthetic-${imageIndex}`;
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
      } else {
        newFavorites.add(imageId);
      }
      return newFavorites;
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover curated collections in a beautiful Pinterest-style layout
          </p>
        </div>

        {/* Gallery Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setGalleryMode('aesthetic')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                galleryMode === 'aesthetic'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Old Money Aesthetic
            </button>
            <button
              onClick={() => setGalleryMode('products')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                galleryMode === 'products'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Product Gallery
            </button>
          </div>
        </div>

        {galleryMode === 'aesthetic' ? (
          /* Old Money Aesthetic Gallery */
          <div className="columns-2 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4">
            {oldMoneyImages.map((imageUrl, index) => {
              const imageId = `aesthetic-${index}`;
              return (
                <div
                  key={index}
                  className="break-inside-avoid group mb-4 relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 20}
                >
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Minimal overlay on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => toggleFavoriteImage(index)}
                      className={`p-3 rounded-full transition-all duration-300 ${
                        favorites.has(imageId)
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                      }`}
                    >
                      <Heart className="h-5 w-5" fill={favorites.has(imageId) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Original Product Gallery */
          <>
            {/* Filters and Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8 space-y-4 lg:space-y-0">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'masonry' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Pinterest-style Masonry Grid */}
            {viewMode === 'masonry' ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {filteredProducts.map((product, index) => {
                  const randomHeight = [250, 300, 350, 400][Math.floor(Math.random() * 4)];
                  return (
                    <div
                      key={product.id}
                      className="break-inside-avoid group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
                      data-aos="fade-up"
                      data-aos-delay={index * 50}
                    >
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          style={{ height: `${randomHeight}px` }}
                        />
                        
                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => toggleFavorite(product.id)}
                              className={`p-3 rounded-full transition-colors ${
                                favorites.has(product.id)
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white/90 text-gray-700 hover:bg-white'
                              }`}
                            >
                              <Heart className="h-5 w-5" fill={favorites.has(product.id) ? 'currentColor' : 'none'} />
                            </button>
                            
                            <Link
                              to={`/products/${product.id}`}
                              className="p-3 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            
                            <button
                              onClick={() => addToCart(product, 1)}
                              className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                            >
                              <ShoppingCart className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Price badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                            ${product.price}
                          </span>
                        </div>

                        {/* Category badge */}
                        <div className="absolute top-4 right-4">
                          <span className="bg-primary/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        </div>
                      </div>

                      {/* Product info */}
                      <div className="p-4">
                        <Link to={`/products/${product.id}`}>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                          {product.description}
                        </p>
                        
                        {/* Quick stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Stock: {product.stock_quantity}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">★</span>
                            <span>4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Regular Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => toggleFavorite(product.id)}
                            className={`p-3 rounded-full transition-colors ${
                              favorites.has(product.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 text-gray-700 hover:bg-white'
                            }`}
                          >
                            <Heart className="h-5 w-5" fill={favorites.has(product.id) ? 'currentColor' : 'none'} />
                          </button>
                          
                          <Link
                            to={`/products/${product.id}`}
                            className="p-3 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                          >
                            <ShoppingCart className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Price badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                          ${product.price}
                        </span>
                      </div>
                    </div>

                    {/* Product info */}
                    <div className="p-6">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">${product.price}</span>
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No products message */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try selecting a different category or check back later.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default GalleryPage;