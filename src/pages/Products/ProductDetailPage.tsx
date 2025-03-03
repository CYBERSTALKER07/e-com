import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import ProductGrid from '../../components/Products/ProductGrid';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const product = products.find(p => p.id === id);
  
  // Get related products (same category, excluding current product)
  const relatedProducts = product 
    ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  useEffect(() => {
    // Reset state when product changes
    setQuantity(1);
    setAddedToCart(false);
    
    // Scroll to top when navigating between products
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      
      // Reset the "Added to cart" message after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h1>
          <p className="text-gray-600 mb-8">Товар, который вы ищете, не существует или был удален.</p>
          <Link
            to="/products"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Вернуться к товарам
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-primary">Главная</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link to="/products" className="hover:text-primary">Товары</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link 
                to={`/products?category=${product.category}`} 
                className="hover:text-primary capitalize"
              >
                {product.category}
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-xl font-bold text-primary mb-4">${product.price.toFixed(2)}</p>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Описание</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Характеристики</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <dl className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Количество</h2>
              <div className="flex items-center">
                <button
                  type="button"
                  className="p-2 border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-100"
                  onClick={decreaseQuantity}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 border-t border-b border-gray-300 text-center min-w-[3rem]">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="p-2 border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-100"
                  onClick={increaseQuantity}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors ${
                  addedToCart
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Добавлено в корзину
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Добавить в корзину
                  </>
                )}
              </button>
              <Link
                to="/products"
                className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие товары</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;