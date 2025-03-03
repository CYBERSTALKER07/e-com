import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email);
      
      if (!error) {
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Проверьте вашу почту</h1>
            <p className="text-gray-600 mb-6">
              Мы отправили инструкции по сбросу пароля на <span className="font-medium">{email}</span>. 
              Пожалуйста, проверьте вашу электронную почту.
            </p>
            <Link 
              to="/login" 
              className="text-primary hover:text-primary-dark flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к входу
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
              <KeyRound className="h-6 w-6 mr-2 text-primary" />
              Сброс пароля
            </h1>
            <p className="text-gray-600 mt-2">
              Введите ваш email, и мы отправим вам инструкции по сбросу пароля
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Электронная почта
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : 'Отправить инструкции'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-primary hover:text-primary-dark flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к входу
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;