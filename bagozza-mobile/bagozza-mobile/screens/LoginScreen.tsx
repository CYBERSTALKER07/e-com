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
      className="flex-1 bg-white"
    >
      <View className="flex-1 p-6 justify-center">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 text-center">Sign In</Text>
          <Text className="mt-2 text-gray-600 text-center">
            Enter your credentials to access your account
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Email Address</Text>
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Mail size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 pl-10"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View>
            <View className="flex-row justify-between items-center mb-1">
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
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 pl-10"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#6B4423] py-3 rounded-md"
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text className="text-white text-center font-medium">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-[#6B4423] font-medium">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}