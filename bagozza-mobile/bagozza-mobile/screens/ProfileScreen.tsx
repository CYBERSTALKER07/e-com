import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LogOut, User, Clock, Store, Shield, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { isAuthenticated, profile, signOut } = useAuth();

  const menuItems = [
    {
      icon: Clock,
      title: 'My Orders',
      screen: 'OrdersTab',
      requiresAuth: true
    },
    {
      icon: Store,
      title: 'My Store',
      screen: 'StoreManagement',
      requiresAuth: true
    },
    {
      icon: Shield,
      title: 'Account Settings',
      screen: 'AccountSettings',
      requiresAuth: true
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <User size={64} color="#6B4423" />
        <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">
          Welcome to Bagozza
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Sign in to manage your orders, favorites and more
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

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-white p-6">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-[#6B4423]/10 items-center justify-center">
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <User size={32} color="#6B4423" />
            )}
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-gray-900">
              {profile?.full_name}
            </Text>
            <Text className="text-gray-600">{profile?.email}</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View className="mt-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
            className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#6B4423]/10 items-center justify-center">
                <item.icon size={20} color="#6B4423" />
              </View>
              <Text className="ml-3 text-gray-900 font-medium">
                {item.title}
              </Text>
            </View>
            <ChevronRight size={20} color="#6B4423" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <View className="p-6">
        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center justify-center space-x-2 bg-red-50 py-3 rounded-full"
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-500 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}