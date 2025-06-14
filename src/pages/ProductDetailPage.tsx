import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, Store } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useCart } from '../context/CartContext';
import ProductGrid from '../components/Products/ProductGrid';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<{ name: string; description: string | null } | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Fetch product with store information
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            description,
            image,
            category,
            store_id,
            stock_quantity,
            is_visible,
            sku,
            store:store_id (
              name,
              description,
              is_active
            )
          `)
          .eq('id', id)
          .single();

        if (productError) throw productError;
        if (!productData) throw new Error('Product not found');

        // Transform the data to match our Product interface
        const product: Product = {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          description: productData.description,
          image: productData.image,
          category: productData.category,
          store_id: productData.store_id,
          specifications: {},  // Initialize empty since it's not in DB
          stock_quantity: productData.stock_quantity,
          is_visible: productData.is_visible,
          sku: productData.sku
        };

        setProduct(product);
        setStore(productData.store);

        // Fetch other products from the same store
        const { data: storeProducts, error: storeError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            description,
            image,
            category,
            store_id,
            stock_quantity,
            is_visible,
            sku
          `)
          .eq('store_id', productData.store_id)
          .neq('id', id)
          .limit(4);

        if (storeError) throw storeError;

        // Transform store products to match Product interface
        const transformedStoreProducts: Product[] = (storeProducts || []).map(p => ({
          ...p,
          specifications: {}  // Initialize empty since it's not in DB
        }));

        setStoreProducts(transformedStoreProducts);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      setQuantity(1);
      setAddedToCart(false);
      window.scrollTo(0, 0);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  if (isLoading) return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    </Layout>
  );

  if (!product || !store) return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h1>
        <Link to="/products" className="text-primary hover:text-primary-dark">
          Вернуться к товарам
        </Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-primary">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад к товарам
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-w-1 aspect-h-1">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-center object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div>
              {/* Store Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Store className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                </div>
                {store.description && (
                  <p className="text-gray-600 text-sm">{store.description}</p>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-6">
                ${product.price.toFixed(2)}
              </p>
              
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Specifications */}
              {product.specifications && Object.entries(product.specifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Характеристики</h3>
                  <dl className="grid grid-cols-1 gap-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex border-b border-gray-200 py-2">
                        <dt className="w-1/3 text-gray-500">{key}:</dt>
                        <dd className="w-2/3 text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <span className="mr-4 text-gray-700">Количество:</span>
                <button
                  onClick={decreaseQuantity}
                  className="p-2 border rounded-l hover:bg-gray-50"
                  aria-label="Уменьшить количество"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 border-t border-b">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="p-2 border rounded-r hover:bg-gray-50"
                  aria-label="Увеличить количество"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-md text-white 
                  ${addedToCart ? 'bg-green-500' : 'bg-primary hover:bg-primary-dark'} transition-colors`}
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
            </div>
          </div>
        </div>

        {/* Other Products from Store */}
        {storeProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Другие товары из {store.name}
            </h2>
            <ProductGrid products={storeProducts} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;