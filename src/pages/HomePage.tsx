import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import ProductGrid from '../components/Products/ProductGrid';
import { products } from '../data/products';

const HomePage: React.FC = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-r from-primary/5 to-secondary-dark/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left" data-aos="fade-right">
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-dark">
                Discover Your Signature Style
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                Curated collections of premium menswear that blend contemporary design with timeless elegance. Each piece tells a story of craftsmanship and style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/products" className="inline-flex items-center px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-all transform hover:scale-105">
                  Shop Collection
                  <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center px-8 py-3 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-all">
                  Learn More
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2000+</div>
                  <div className="text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">150+</div>
                  <div className="text-gray-600">Brands</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50k+</div>
                  <div className="text-gray-600">Customers</div>
                </div>
              </div>
            </div>
            <div className="relative" data-aos="fade-left">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src="/hero-image.jpg" 
                  alt="Featured Collection" 
                  className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 animate-bounce-slow">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-500 h-2 w-2 rounded-full"></div>
                  <span className="text-sm font-medium">1,234 people shopping now</span>
                </div>
              </div>
            </div>
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