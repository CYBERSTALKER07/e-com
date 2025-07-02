import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { ShippingAddress, BillingAddress } from '../../types';
import { initializeClickPayment, ClickPaymentParams } from '../../lib/clickPayment';

const steps = ['Доставка', 'Оплата', 'Подтверждение'];

const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrder();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

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

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [email, setEmail] = useState<string>('');

  // Shipping cost and tax calculation
  const shippingCost = totalPrice > 100 ? 0 : 10;
  const tax = totalPrice * 0.08; // 8% tax
  const orderTotal = totalPrice + shippingCost + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(1);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingOrder(true);

    try {
      // Create order with selected payment method
      const order = await createOrder(
        shippingAddress.fullName,
        email,
        shippingAddress.phone,
        cart,
        shippingAddress,
        null,
        paymentMethod, // 'card' or 'cash'
        orderTotal
      );

      if (order) {
        setOrderId(order.id);
        setOrderComplete(true);
        clearCart();
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsProcessingOrder(false);
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
        {/* Step 1: Shipping Information */}
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

        {/* Step 2: Payment */}
        {currentStep === 1 && (
          <form onSubmit={handlePaymentSubmit}>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Способ оплаты</h2>
            
            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Банковская карта</p>
                      <p className="text-sm text-gray-500">Оплата картой онлайн</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <img src="/visa-logo.png" alt="Visa" className="h-6 w-auto" />
                    <img src="/mastercard-logo.png" alt="Mastercard" className="h-6 w-auto" />
                  </div>
                </div>
              </div>

              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Оплата при получении</p>
                    <p className="text-sm text-gray-500">Наличными или картой курьеру</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details Form */}
            {paymentMethod === 'card' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-4">Данные карты</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Номер карты
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={cardDetails.cardNumber}
                      onChange={(e) => {
                        // Format card number with spaces
                        const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                        setCardDetails({...cardDetails, cardNumber: value});
                      }}
                      maxLength={19}
                      required={paymentMethod === 'card'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Срок действия
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        placeholder="MM/YY"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          // Format expiry date
                          const value = e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
                          setCardDetails({...cardDetails, expiryDate: value});
                        }}
                        maxLength={5}
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setCardDetails({...cardDetails, cvv: value});
                        }}
                        maxLength={4}
                        required={paymentMethod === 'card'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                      Имя владельца карты
                    </label>
                    <input
                      type="text"
                      id="cardholderName"
                      placeholder="IVAN PETROV"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value.toUpperCase()})}
                      required={paymentMethod === 'card'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Сумма к оплате</h3>
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
                onClick={() => setCurrentStep(0)}
                className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition-colors"
              >
                Назад
              </button>
              <button
                type="submit"
                className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
              >
                Продолжить к подтверждению
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Order Confirmation */}
        {currentStep === 2 && (
          <div className="text-center">
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
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;