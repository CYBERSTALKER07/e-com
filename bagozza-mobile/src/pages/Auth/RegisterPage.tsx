import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import Navbar from '../../components/Layout/Navbar';
import { supabase } from '../../lib/supabase';

const RegisterPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Имя обязательно';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email некорректный';
    }
    
    if (!password) {
      newErrors.password = 'Пароль обязателен';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Use Supabase auth directly for registration
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        Alert.alert('Registration Error', error.message);
      } else {
        // Create profile in database after signup
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: 'user',
              plan: 'free',
              max_stores: 1
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
        
        Alert.alert(
          'Registration Successful', 
          'Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Registration Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleConfirmSecureTextEntry = () => {
    setConfirmSecureTextEntry(!confirmSecureTextEntry);
  };

  return (
    <View style={styles.container}>
      <Navbar title="Регистрация" showBackButton />
      
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
              <Text style={styles.logoText}>Bagozza</Text>
            </View>
            
            <Text style={styles.subtitle}>Создайте новую учетную запись</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Полное имя"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                error={!!errors.fullName}
                outlineColor="#D5C0A7"
                activeOutlineColor="#6B4423"
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>
            
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
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Подтвердите пароль"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={confirmSecureTextEntry}
                style={styles.input}
                error={!!errors.confirmPassword}
                outlineColor="#D5C0A7"
                activeOutlineColor="#6B4423"
                right={
                  <TextInput.Icon
                    icon={confirmSecureTextEntry ? "eye" : "eye-off"}
                    onPress={toggleConfirmSecureTextEntry}
                    color="#6B4423"
                  />
                }
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
            
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FCEDD9" size={20} />
              ) : (
                "Зарегистрироваться"
              )}
            </Button>
            
            <View style={styles.loginContainer}>
              <Text>Уже есть аккаунт? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                <Text style={styles.loginText}>Войти</Text>
              </TouchableOpacity>
            </View>
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
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 24,
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
  button: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 8,
    backgroundColor: '#6B4423',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#6B4423',
    fontWeight: 'bold',
  },
});

export default RegisterPage;