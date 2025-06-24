import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Layout/Navbar';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleRegister = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to home or login screen
      navigation.navigate('Login' as never);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Navbar title="Регистрация" showBackButton />

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
            label="ФИО"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            mode="outlined"
            style={styles.input}
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />

          <TextInput
            label="Телефон"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />

          <TextInput
            label="Пароль"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
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

          <TextInput
            label="Подтвердите пароль"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            mode="outlined"
            secureTextEntry={!isConfirmPasswordVisible}
            style={styles.input}
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
            right={
              <TextInput.Icon
                icon={isConfirmPasswordVisible ? "eye-off" : "eye"}
                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                color="#6B4423"
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
            labelStyle={styles.buttonText}
          >
            Зарегистрироваться
          </Button>

          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.loginLink}>Войти</Text>
            </TouchableOpacity>
          </View>
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
    marginVertical: 30,
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
  registerButton: {
    backgroundColor: '#6B4423',
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  promptText: {
    color: '#777777',
  },
  loginLink: {
    color: '#6B4423',
    fontWeight: 'bold',
  },
});

export default RegisterPage;