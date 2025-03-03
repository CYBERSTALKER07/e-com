import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import CartItem from '../components/Cart/CartItem';
import CartSummary from '../components/Cart/CartSummary';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { cart } = useCart();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2" />
          Ваша корзина
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Ваша корзина пуста</h2>
            <p className="text-gray-600 mb-6">
              Похоже, вы еще не добавили товары в корзину.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Продолжить покупки
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {cart.map((item) => (
                        <li key={item.product.id} className="py-6">
                          <CartItem item={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;