import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        navigation.replace('Home');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    className="flex-1 bg-white justify-center items-center px-6"
  >
    <View className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl space-y-8">
      {/* Header */}
      <View className="space-y-2">
        <Text className="text-3xl font-bold text-gray-900 text-center">Sign In</Text>
        <Text className="text-center text-gray-600">
          Enter your credentials to access your account
        </Text>
      </View>
  
      {/* Form Fields */}
      <View className="space-y-5">
        {/* Email */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Email Address</Text>
          <View className="relative">
            <View className="absolute left-3 top-3 z-10">
              <Mail size={20} color="#9CA3AF" />
            </View>
            <TextInput
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 bg-gray-50"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>
  
        {/* Password */}
        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">Password</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text className="text-sm text-[#6B4423]">Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <View className="relative">
            <View className="absolute left-3 top-3 z-10">
              <Lock size={20} color="#9CA3AF" />
            </View>
            <TextInput
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 bg-gray-50"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>
      </View>
  
      {/* Submit Button */}
      <TouchableOpacity
        className="bg-[#6B4423] py-3 rounded-full"
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text className="text-white text-center font-semibold text-base">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>
  
      {/* Bottom Link */}
      <View className="flex-row justify-center">
        <Text className="text-gray-600">Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-[#6B4423] font-semibold">Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAvoidingView>
  
  );
}