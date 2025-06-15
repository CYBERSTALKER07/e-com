import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react-native';

const features = [
  {
    icon: ShoppingBag,
    title: 'Premium Selection',
    description: 'Curated collection of high-quality fashion items.'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick and reliable shipping to your doorstep.'
  },
  {
    icon: Shield,
    title: 'Secure Shopping',
    description: 'Safe and protected online shopping experience.'
  },
  {
    icon: CreditCard,
    title: 'Easy Payment',
    description: 'Multiple secure payment options available.'
  }
];

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <View className="h-80 bg-[#6B4423] relative">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04' }}
          className="absolute inset-0 w-full h-full opacity-40"
        />
        <View className="flex-1 justify-center p-6 z-10">
          <Text className="text-3xl font-bold text-white mb-4">
            Discover Your Style With Our Collection
          </Text>
          <Text className="text-lg text-gray-100 mb-6">
            Shop the latest trends in fashion with our curated selection
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductsTab')}
            className="bg-white py-3 px-6 rounded-full w-40 flex-row items-center justify-center"
          >
            <Text className="text-[#6B4423] font-medium mr-2">Shop Now</Text>
            <ShoppingBag size={20} color="#6B4423" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Section */}
      <View className="py-12 px-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 text-center">
            Why Choose Us
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            Experience shopping excellence with our premium services
          </Text>
        </View>

        <View className="space-y-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <View className="bg-[#6B4423]/10 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
                  <Icon size={24} color="#6B4423" />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </Text>
                <Text className="text-gray-600">{feature.description}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Featured Categories */}
      <View className="pb-12 px-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 text-center">
            Featured Categories
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            Browse our most popular collections
          </Text>
        </View>

        <View className="space-y-4">
          {['Men', 'Women', 'Accessories'].map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate('ProductsTab', { category })}
              className="bg-gray-100 p-6 rounded-xl"
            >
              <Text className="text-lg font-medium text-gray-900">{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}