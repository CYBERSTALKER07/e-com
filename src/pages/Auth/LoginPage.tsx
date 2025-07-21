import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Package } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      }
      // Successful login will trigger the useEffect above to redirect
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
      <div className="min-h-screen  flex flex-col md:flex-row items-center justify-center bg-gray-50">
     
        {/* Left: Login Form */}
        <div className="w-full md:w-1/2 max-w-3xl px-6 md:px-10 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
                <LogIn className="h-6 w-6 mr-2 text-primary" />
                Вход в систему
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Введите свои учетные данные для доступа к аккаунту
              </p>
            </div>
  
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
  
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Пароль
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                    Забыли пароль?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
  
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors flex justify-center items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : 'Войти'}
              </button>
            </form>
  
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
  
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-3 bg-gray-50 rounded-md text-xs text-gray-600 space-y-1">
                <p><strong>Тестирование:</strong> если вы регистрировались с email+timestamp, введите его точно.</p>
                <p>Пример: <code>user+1234567890@example.com</code></p>
              </div>
            )}
          </div>
        </div>
  
        {/* Right: Image */}
        <div className="hidden w-full md:block md:w-1/2 h-full">
          <img
            src="https://i.pinimg.com/736x/02/6d/50/026d50c426b1c334ba46c0f2ba1ac843.jpg"
            alt="Zara Login"
            className="object-cover rounded-[100px] w-full h-[700px]"
          />
        </div>
      </div>
    </Layout>
  );
};
  

export default LoginPage;