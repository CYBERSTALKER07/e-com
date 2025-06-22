import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Mail, Lock, User, UserPlus } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();

  const validatePassword = () => {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleSubmit = async () => {
    const passwordError = validatePassword();
    if (passwordError) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: passwordError
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUp(email, password, fullName);
      if (!error) {
        // Registration successful, navigate to login
        navigation.replace('Login');
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
      <ScrollView className="flex-1 p-6">
        <View className="mb-8">
          <View className="items-center mb-6">
            <UserPlus size={64} color="#6B4423" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">
            Create Account
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            Join our community of fashion enthusiasts
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <User size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 pl-10"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

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
            <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 pl-10"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Confirm Password</Text>
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 pl-10"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#6B4423] py-3 rounded-full"
          >
            <Text className="text-white text-center font-medium">
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#6B4423] font-medium">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}