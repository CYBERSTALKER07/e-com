import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';

const UpgradePlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleUpgrade = () => {
    // Normally this would integrate with a payment provider like Stripe
    // For now, we'll just redirect to a mock payment page
    window.location.href = 'https://payment-provider.com/checkout?plan=premium';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Upgrade Your Plan</h1>
          <p className="mt-4 text-lg text-gray-600">
            Get access to unlimited stores and exclusive features
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Free Plan</h3>
                <span className="text-gray-500">Current Plan</span>
              </div>
              <p className="text-3xl font-bold mb-6">$0<span className="text-gray-500 text-base font-normal">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  1 Store
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Basic Analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Standard Support
                </li>
              </ul>
              <button
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md"
                disabled
              >
                Current Plan
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-primary/5 p-8 rounded-lg shadow-md border-2 border-primary relative">
              <div className="absolute -top-4 right-4 bg-primary text-white px-4 py-1 rounded-full text-sm flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                Recommended
              </div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Premium Plan</h3>
              </div>
              <p className="text-3xl font-bold mb-6">$29<span className="text-gray-500 text-base font-normal">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Unlimited Stores
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Advanced Analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Priority Support
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Custom Domain
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  API Access
                </li>
              </ul>
              <button
                onClick={handleUpgrade}
                className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h4 className="text-lg font-medium text-gray-900 mb-4">All Premium Features Include:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4">
                <h5 className="font-medium text-gray-900 mb-2">Unlimited Stores</h5>
                <p className="text-gray-600">Create and manage as many stores as you need</p>
              </div>
              <div className="p-4">
                <h5 className="font-medium text-gray-900 mb-2">Advanced Analytics</h5>
                <p className="text-gray-600">Detailed insights about your stores and customers</p>
              </div>
              <div className="p-4">
                <h5 className="font-medium text-gray-900 mb-2">Priority Support</h5>
                <p className="text-gray-600">Get help when you need it most</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpgradePlanPage;