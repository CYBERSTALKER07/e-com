import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const handleIncreaseQuantity = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeFromCart(product.id);
    }
  };

  const handleRemove = () => {
    removeFromCart(product.id);
  };

  return (
    <div className="flex flex-col sm:flex-row py-6 border-b border-gray-200">
      <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-4 sm:mb-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="flex-1 ml-0 sm:ml-6">
        <div className="flex justify-between">
          <div>
            <Link to={`/products/${product.id}`} className="text-lg font-medium text-gray-900 hover:text-primary">
              {product.name}
            </Link>
            <p className="mt-1 text-sm text-gray-500 capitalize">{product.category}</p>
          </div>
          <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-primary"
              onClick={handleDecreaseQuantity}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-gray-900">{quantity}</span>
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-primary"
              onClick={handleIncreaseQuantity}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 flex items-center"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-sm">Удалить</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;