import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartSummaryProps {
  onCheckout?: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ onCheckout }) => {
  const { totalItems, totalPrice, cart } = useCart();

  const shippingCost = totalPrice > 100 ? 0 : 10;
  const tax = totalPrice * 0.08; // 8% tax
  const orderTotal = totalPrice + shippingCost + tax;

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-fit">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Итого</h2>
        <div className="flex flex-col items-center justify-center py-8">
          <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Ваша корзина пуста</p>
          <Link
            to="/products"
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Итого</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Подытог ({totalItems} товаров)</span>
          <span className="text-gray-900 font-medium">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Доставка</span>
          {shippingCost === 0 ? (
            <span className="text-green-600">Бесплатно</span>
          ) : (
            <span className="text-gray-900 font-medium">${shippingCost.toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Налог (8%)</span>
          <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-4 flex justify-between">
          <span className="text-lg font-medium text-gray-900">Всего к оплате</span>
          <span className="text-lg font-bold text-primary">${orderTotal.toFixed(2)}</span>
        </div>
      </div>
      {shippingCost > 0 && (
        <p className="text-sm text-green-600 mt-4">
          Добавьте товаров на ${(100 - totalPrice).toFixed(2)}, чтобы получить бесплатную доставку!
        </p>
      )}
      <div className="mt-6">
        {onCheckout ? (
          <button
            type="button"
            className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors"
            onClick={onCheckout}
          >
            Перейти к оформлению
          </button>
        ) : (
          <Link
            to="/checkout"
            className="block w-full bg-primary text-white text-center py-3 px-4 rounded-md hover:bg-primary-dark transition-colors"
          >
            Перейти к оформлению
          </Link>
        )}
        <Link
          to="/products"
          className="block w-full text-center text-primary hover:text-primary-dark mt-4"
        >
          Продолжить покупки
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;