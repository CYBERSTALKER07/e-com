import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { ShippingAddress, BillingAddress } from '../../types';

const steps = ['Доставка', 'Подтверждение'];

const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrder();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  });

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  const [sameAsShipping, setSameAsShipping] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');

  // Shipping cost and tax calculation
  const shippingCost = totalPrice > 100 ? 0 : 10;
  const tax = totalPrice * 0.08; // 8% tax
  const orderTotal = totalPrice + shippingCost + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(1);
    if (sameAsShipping) {
      setBillingAddress({
        fullName: shippingAddress.fullName,
        streetAddress: shippingAddress.streetAddress,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country
      });
    }
  };

  const handleConfirmationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the order
    const order = await createOrder(
      shippingAddress.fullName,
      email,
      cart,
      shippingAddress,
      billingAddress,
      'credit-card', // Assuming a default payment method
      orderTotal
    );

    if (order) {
      setOrderId(order.id);
      setOrderComplete(true);
      clearCart();
    } else {
      // Handle the case where the order creation failed
      console.error("Order creation failed");
    }
  };

  const handleSameAsShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsShipping(e.target.checked);
    if (e.target.checked) {
      setBillingAddress({
        fullName: shippingAddress.fullName,
        streetAddress: shippingAddress.streetAddress,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country
      });
    } else {
      setBillingAddress({
        fullName: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      });
    }
  };

  if (orderComplete && orderId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Заказ подтвержден!</h2>
        <p className="text-gray-600 mb-6">
          Спасибо за вашу покупку. Ваш заказ успешно оформлен.
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-gray-700">Номер заказа: <span className="font-medium">{orderId}</span></p>
          <p className="text-gray-700 mt-1">
            Подтверждение отправлено на <span className="font-medium">{email}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            Просмотреть детали заказа
          </button>
          <button
            type="button"
            className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/')}
          >
            Продолжить покупки
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Progress steps */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <nav className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${
                    index < currentStep
                      ? 'bg-primary text-white'
                      : index === currentStep
                      ? 'border-2 border-primary text-primary'
                      : 'border border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Form content */}
      <div className="p-6">
        {currentStep === 0 && (
          <form onSubmit={handleShippingSubmit}>
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-primary" />
              Информация о доставке
            </h2>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email адрес
              </label>
              <input
                type="email"
                id="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                ФИО
              </label>
              <input
                type="text"
                id="fullName"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <input
                type="text"
                id="streetAddress"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={shippingAddress.streetAddress}
                onChange={(e) => setShippingAddress({...shippingAddress, streetAddress: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Город
                </label>
                <input
                  type="text"
                  id="city"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  Область / Регион
                </label>
                <input
                  type="text"
                  id="state"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Почтовый индекс
                </label>
                <input
                  type="text"
                  id="postalCode"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Страна
                </label>
                <input
                  type="text"
                  id="country"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Номер телефона
              </label>
              <input
                type="tel"
                id="phone"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
              >
                Продолжить к подтверждению
              </button>
            </div>
          </form>
        )}

        {currentStep === 1 && (
          <form onSubmit={handleConfirmationSubmit}>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Подтверждение заказа</h2>
            
            <div className="mb-4">
              <p className="text-gray-700">ФИО: {shippingAddress.fullName}</p>
              <p className="text-gray-700">Email: {email}</p>
              <p className="text-gray-700">Адрес доставки: {shippingAddress.streetAddress}, {shippingAddress.city}, {shippingAddress.state}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
              <p className="text-gray-700">Номер телефона: {shippingAddress.phone}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Сводка заказа</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Подытог</span>
                  <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Доставка</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Бесплатно</span>
                  ) : (
                    <span className="text-gray-900">${shippingCost.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Налог</span>
                  <span className="text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">Итого</span>
                  <span className="font-bold text-primary">${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setCurrentStep(0)}
              >
                Назад
              </button>
              <button
                type="submit"
                className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
              >
                Оформить заказ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;