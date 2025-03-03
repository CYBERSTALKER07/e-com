import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import CheckoutForm from '../components/Checkout/CheckoutForm';
import { useCart } from '../context/CartContext';

const CheckoutPage: React.FC = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  if (cart.length === 0) {
    return null; // Will redirect to cart
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Оформление заказа</h1>
        <CheckoutForm />
      </div>
    </Layout>
  );
};

export default CheckoutPage;