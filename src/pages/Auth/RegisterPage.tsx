import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Package } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Add admin toggle
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
      // For testing purposes, add a timestamp to email to avoid "user already exists" errors
      // In production, you would remove this and handle duplicate emails properly
      const testEmail = process.env.NODE_ENV === 'development' 
        ? `${email.split('@')[0]}+${Date.now()}@${email.split('@')[1]}`
        : email;
        
      const { error } = await signUp(testEmail, password, fullName, isAdmin ? 'admin' : 'user');
      
      if (!error) {
        // Redirect to login page after successful registration
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout authOnly>
       <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="ml-2 text-xl font-bold text-gray-900">Buyursin</span>
            </Link>
          </div>
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50">
      {/* Left: Registration Form */}
      <div className="w-full md:w-1/2 max-w-3xl px-6 md:px-10 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
              <UserPlus className="h-6 w-6 mr-2 text-primary" />
              Создать аккаунт
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Зарегистрируйтесь, чтобы начать покупки
            </p>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Полное имя
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
  
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Электронная почта
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 pointer-events-none">
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
  
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  className={`w-full pl-10 pr-3 py-2 border ${
                    passwordError && password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Минимум 8 символов</p>
            </div>
  
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Подтвердите пароль
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`w-full pl-10 pr-3 py-2 border ${
                    passwordError && confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
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
  
            {/* Admin Toggle */}
            {process.env.NODE_ENV === 'development' && (
              <div>
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                  <span className="ml-2">Зарегистрироваться как админ</span>
                </label>
              </div>
            )}
  
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : 'Создать аккаунт'}
            </button>
          </form>
  
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
  
      {/* Right: Image */}
      <div className="hidden w-full md:block md:w-1/2 h-full">
        <img
          src="https://i.pinimg.com/736x/30/a3/55/30a355d42f5a0235cf74d7000f2d4108.jpg"
          alt="Zara Style"
          className="object-cover rounded-[100px] shadow-2xl w-full h-[700px]"
        />
      </div>
    </div>
  </Layout>
  
  );
};

export default RegisterPage;