import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();

  // Check if user is in a password recovery session
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      navigate('/login');
    }
  }, [navigate]);

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Пароль должен содержать не менее 8 символов');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(password);
      
      if (!error) {
        // Redirect to login page after successful password reset
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
              <KeyRound className="h-6 w-6 mr-2 text-primary" />
              Установить новый пароль
            </h1>
            <p className="text-gray-600 mt-2">
              Создайте новый пароль для вашего аккаунта
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Новый пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  className={`w-full pl-10 pr-3 py-2 border ${passwordError && password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Пароль должен содержать не менее 8 символов
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Подтвердите пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`w-full pl-10 pr-3 py-2 border ${passwordError && confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : 'Сбросить пароль'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;