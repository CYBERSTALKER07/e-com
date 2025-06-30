import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, CreditCard, ArrowRight, Star, Users, Gift, Heart, ShoppingCart } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import ProductGrid from '../components/Products/ProductGrid';
import { getAllProducts, Product } from '../services/api/products';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const heroImages = [
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
];

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        
        // Get featured products (first 8 products)
        setFeaturedProducts(products.slice(0, 8));
        
        // Get new arrivals (most recent products)
        const sortedByDate = products.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNewArrivals(sortedByDate.slice(0, 6));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 overflow-hidden">
          {heroImages.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentHeroImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={img}
                alt="Hero background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50" />
            </div>
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left text-white" data-aos="fade-right">
              <h1 className="text-5xl font-bold leading-tight mb-6">
                Discover Your Style <br />
                With Our Collection
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                Shop the latest trends in fashion with our curated selection of premium clothing and accessories.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="mt-4 text-xl text-gray-600">Experience shopping excellence with our premium services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="0">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Premium Selection</h3>
              <p className="text-gray-600">Curated collection of high-quality fashion items.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable shipping to your doorstep.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Shopping</h3>
              <p className="text-gray-600">Safe and protected online shopping experience.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Payment</h3>
              <p className="text-gray-600">Multiple secure payment options available.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Products Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium products from top-rated stores
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Featured Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {featuredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    data-aos="fade-up" 
                    data-aos-delay={index * 100}
                  >
                    <div className="relative overflow-hidden aspect-w-4 aspect-h-5">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Product Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-2 bg-white/90 rounded-full hover:bg-white shadow-md">
                          <Heart className="h-5 w-5 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => addToCart(product, 1)}
                          className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark shadow-md"
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Product Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Link to={`/products/${product.id}`}>
                          <h3 className="text-white font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-xl">${product.price}</span>
                            <span className="text-white/80 text-sm">In Stock: {product.stock_quantity}</span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                      <Link to={`/products/${product.id}`} className="block mb-3">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary">${product.price}</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                          ))}
                          <span className="text-gray-500 text-sm ml-1">(4.8)</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => addToCart(product, 1)}
                        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Arrivals Section */}
              <div className="border-t border-gray-200 pt-16">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">New Arrivals</h3>
                  <p className="text-lg text-gray-600">Fresh additions to our collection</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {newArrivals.map((product, index) => (
                    <div 
                      key={product.id}
                      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                      data-aos="fade-up" 
                      data-aos-delay={index * 100}
                    >
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            New
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <Link to={`/products/${product.id}`}>
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        <p className="text-primary font-bold mt-2">${product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* View More Buttons */}
          <div className="text-center space-y-4">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-primary rounded-full hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <div className="block">
              <Link
                to="/gallery"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-primary border-2 border-primary rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                Browse Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="mt-4 text-xl text-gray-600">Read testimonials from our satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="flex items-center mb-4">
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  "Amazing quality and service! The products exceeded my expectations, and the delivery was super fast."
                </p>
                <div className="flex items-center">
                  <img
                    src={`https://i.pravatar.cc/150?img=${i + 10}`}
                    alt="Customer"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">John Doe</h4>
                    <p className="text-gray-500 text-sm">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Join Our Community</h2>
            <p className="mt-4 text-xl text-gray-600">Be part of our growing fashion community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center" data-aos="fade-up">
              <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">10K+</h3>
              <p className="text-gray-600">Active Members</p>
            </div>
            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Star className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">4.8/5</h3>
              <p className="text-gray-600">Customer Rating</p>
            </div>
            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Gift className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">15K+</h3>
              <p className="text-gray-600">Products Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Stay Updated</h2>
            <p className="text-xl text-gray-600 mb-8">
              Subscribe to our newsletter to receive updates about new products, special offers, and fashion tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;