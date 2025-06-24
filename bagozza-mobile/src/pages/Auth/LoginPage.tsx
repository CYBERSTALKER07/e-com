import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Layout/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleLogin = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to home or previous screen
      navigation.navigate('Home' as never);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Navbar title="Войти" showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Bagozza</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />

          <TextInput
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!isPasswordVisible}
            style={styles.input}
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
            right={
              <TextInput.Icon
                icon={isPasswordVisible ? "eye-off" : "eye"}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                color="#6B4423"
              />
            }
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
            labelStyle={styles.loginButtonText}
          >
            Войти
          </Button>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ИЛИ</Text>
            <View style={styles.divider} />
          </View>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Register' as never)}
            style={styles.registerButton}
            labelStyle={styles.registerButtonText}
          >
            Регистрация
          </Button>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4423',
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6B4423',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#6B4423',
    paddingVertical: 8,
    borderRadius: 5,
  },
  loginButtonText: {
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D5C0A7',
  },
  dividerText: {
    color: '#6B4423',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  registerButton: {
    borderColor: '#6B4423',
    paddingVertical: 8,
    borderRadius: 5,
  },
  registerButtonText: {
    color: '#6B4423',
    fontSize: 16,
  },
});

export default LoginPage;