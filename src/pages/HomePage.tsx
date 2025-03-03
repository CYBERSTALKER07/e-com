import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import ProductGrid from '../components/Products/ProductGrid';
import { products } from '../data/products';

const HomePage: React.FC = () => {
  // Get featured products (first 4)
  const featuredProducts = products.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Премиальная мужская мода в Ташкенте
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-3xl">
            Откройте для себя нашу коллекцию высококачественной мужской одежды. От деловых костюмов до повседневной одежды, улучшите свой стиль с нами. Бесплатная доставка при заказе от $100!
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/products"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg transition-colors"
            >
              Купить сейчас
            </Link>
            <Link
              to="/products?category=suits"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-md font-medium text-lg transition-colors"
            >
              Смотреть костюмы
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-primary-light/20 p-3 rounded-full mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Отборная коллекция</h3>
              <p className="text-gray-600">
                Тщательно подобранная мужская одежда от премиальных брендов и местных узбекских дизайнеров.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-primary-light/20 p-3 rounded-full mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-gray-600">
                Доставка в тот же день по Ташкенту и экспресс-доставка по всей стране.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-primary-light/20 p-3 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Гарантия качества</h3>
              <p className="text-gray-600">
                Все наши товары проходят проверку подлинности и качества перед отправкой.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-primary-light/20 p-3 rounded-full mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Удобная оплата</h3>
              <p className="text-gray-600">
                Различные способы оплаты, включая наложенный платеж в Ташкенте.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Избранные коллекции</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Откройте для себя наши самые популярные предметы мужской одежды, идеально подходящие для климата и образа жизни Ташкента
            </p>
          </div>
          <ProductGrid products={featuredProducts} />
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block bg-primary text-white hover:bg-primary-dark px-6 py-3 rounded-md font-medium transition-colors"
            >
              Смотреть все коллекции
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Присоединяйтесь к нашему клубу стиля</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Подпишитесь, чтобы получать обновления о новых поступлениях, эксклюзивных предложениях и советах по стилю для современного ташкентского джентльмена
              </p>
            </div>
            <form className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Введите ваш email адрес"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary-dark px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Подписаться
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Подписываясь, вы соглашаетесь с нашей Политикой конфиденциальности и даете согласие на получение обновлений от нашей компании.
              </p>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;