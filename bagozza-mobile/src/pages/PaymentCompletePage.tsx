import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const PaymentCompletePage = () => {
  const navigation = useNavigation();

  // In a real app, this data would come from the order processing
  const mockOrderId = '00241';
  
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.successIconContainer}>
          <Icon name="check" size={50} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>Заказ оформлен!</Text>
        
        <Text style={styles.subtitle}>
          Спасибо за ваш заказ. Ваш заказ №{mockOrderId} успешно оформлен.
        </Text>
        
        <Image
          source={require('../../assets/icon.png')}
          style={styles.image}
          resizeMode="contain"
        />
        
        <Text style={styles.infoText}>
          Мы отправили вам электронное письмо с подтверждением заказа и информацией о доставке.
        </Text>
        
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Orders' as never)}
          style={styles.orderButton}
        >
          Мои заказы
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Home' as never)}
          style={styles.homeButton}
          textColor="#6B4423"
        >
          Вернуться на главную
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 30,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  orderButton: {
    backgroundColor: '#6B4423',
    paddingVertical: 8,
    width: '100%',
    marginBottom: 15,
  },
  homeButton: {
    borderColor: '#6B4423',
    paddingVertical: 8,
    width: '100%',
  },
});

export default PaymentCompletePage;