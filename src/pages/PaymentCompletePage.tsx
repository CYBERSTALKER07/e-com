import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { verifyClickPayment } from '../lib/clickPayment';

const PaymentCompletePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get('payment_id');
      const orderId = searchParams.get('order_id');
      
      if (!paymentId || !orderId) {
        setIsVerifying(false);
        return;
      }

      try {
        const result = await verifyClickPayment(paymentId);
        setIsSuccess(result.status === 'success' && result.payment_status === 'completed');
      } catch (error) {
        console.error('Payment verification error:', error);
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Проверка платежа</h2>
          <p className="text-gray-600">Пожалуйста, подождите...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {isSuccess ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Оплата прошла успешно!</h2>
              <p className="text-gray-600 mb-6">
                Ваш заказ успешно оплачен и будет обработан в ближайшее время.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка оплаты</h2>
              <p className="text-gray-600 mb-6">
                К сожалению, произошла ошибка при обработке платежа. Пожалуйста, попробуйте еще раз.
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {isSuccess ? (
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

export default PaymentCompletePage;