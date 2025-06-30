import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout/Layout';

const OrderCompletePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Redirect to home if no order info
    if (!orderId) {
      navigate('/', { replace: true });
    }
  }, [orderId, navigate]);

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {success ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Заказ оформлен!</h2>
              <p className="text-gray-600 mb-6">
                Ваш заказ успешно принят. Мы свяжемся с вами для подтверждения и доставки.
              </p>
              {orderId && (
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <p className="text-gray-700">
                    Номер заказа: <span className="font-medium">{orderId}</span>
                  </p>
                  <p className="text-gray-700 mt-1">
                    Способ оплаты: <span className="font-medium">Оплата при получении</span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка заказа</h2>
              <p className="text-gray-600 mb-6">
                К сожалению, произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {success && orderId ? (
              <button
                type="button"
                className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
                onClick={() => navigate('/orders')}
              >
                Мои заказы
              </button>
            ) : (
              <button
                type="button"
                className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
                onClick={() => navigate('/cart')}
              >
                Вернуться в корзину
              </button>
            )}
            <button
              type="button"
              className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/')}
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderCompletePage;