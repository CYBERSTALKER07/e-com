import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../App';

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export default function FavoritesScreen({ navigation }) {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          product_id,
          products (
            id,
            name,
            price,
            description,
            image,
            category
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const favoriteProducts = data
        .map(item => item.products)
        .filter(product => product !== null);
      
      setFavorites(favoriteProducts);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('product_id', productId);

      if (error) throw error;

      setFavorites(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteProduct }) => (
    <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 mx-2">
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
      >
        <Image
          source={{ uri: item.image }}
          className="w-full h-48"
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View className="p-4">
        <Text className="text-lg font-medium text-gray-900 mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-[#6B4423]">
            ${item.price.toFixed(2)}
          </Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => removeFavorite(item.id)}
              className="bg-red-50 p-2 rounded-full"
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
              className="bg-[#6B4423] p-2 rounded-full"
            >
              <ShoppingCart size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Heart size={64} color="#6B4423" />
        <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">
          Your Favorites
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Sign in to save your favorite products and access them anytime
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-[#6B4423] w-full py-3 rounded-full"
        >
          <Text className="text-white text-center font-medium">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6B4423" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Heart size={64} color="#6B4423" />
        <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">
          No Favorites Yet
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Start exploring and save your favorite products here
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductsTab')}
          className="bg-[#6B4423] w-full py-3 rounded-full"
        >
          <Text className="text-white text-center font-medium">Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}