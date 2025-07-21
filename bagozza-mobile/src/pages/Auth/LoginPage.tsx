import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import Navbar from '../../components/Layout/Navbar';
import { supabase } from '../../lib/supabase';

const LoginPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Use Supabase auth directly
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        Alert.alert('Login Error', error.message);
      } else {
        // Navigate to main app on successful login
        navigation.navigate('Main');
      }
    } catch (error) {
      Alert.alert('Login Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={styles.container}>
      <Navbar title="Войти" showBackButton />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Buyursin</Text>
            </View>
            
            <Text style={styles.subtitle}>Войдите в свою учетную запись</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                error={!!errors.email}
                outlineColor="#D5C0A7"
                activeOutlineColor="#6B4423"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Пароль"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                style={styles.input}
                error={!!errors.password}
                outlineColor="#D5C0A7"
                activeOutlineColor="#6B4423"
                right={
                  <TextInput.Icon
                    icon={secureTextEntry ? "eye" : "eye-off"}
                    onPress={toggleSecureTextEntry}
                    color="#6B4423"
                  />
                }
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
            </TouchableOpacity>
            
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FCEDD9" size={20} />
              ) : (
                "Войти"
              )}
            </Button>
            
            <View style={styles.registerContainer}>
              <Text>Нет учетной записи? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <Text style={styles.registerText}>Зарегистрироваться</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.skipLogin}
            >
              <Text style={styles.skipLoginText}>Продолжить как гость</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4423',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FCFCFC',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6B4423',
    fontSize: 14,
  },
  button: {
    marginBottom: 20,
    paddingVertical: 8,
    backgroundColor: '#6B4423',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: '#6B4423',
    fontWeight: 'bold',
  },
  skipLogin: {
    alignItems: 'center',
  },
  skipLoginText: {
    color: '#888',
    fontSize: 14,
  },
});

export default LoginPage;