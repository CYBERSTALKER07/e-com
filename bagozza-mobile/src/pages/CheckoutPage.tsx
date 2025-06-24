import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { TextInput, Button, RadioButton, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Navbar from '../components/Layout/Navbar';

// Mock cart data
const mockCartItems = [
  { id: 1, name: 'Сумка 1', price: 250000, quantity: 1 },
  { id: 2, name: 'Сумка 2', price: 270000, quantity: 2 }
];

const CheckoutPage = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card'
  });
  const [loading, setLoading] = useState(false);

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };

  const subtotal = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 15000;
  const total = subtotal + deliveryFee;

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('PaymentComplete' as never);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Navbar title="Оформление заказа" showBackButton />
      
      <ScrollView style={styles.scrollView}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ваш заказ</Text>
          
          {mockCartItems.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.name} <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
          
          <Divider style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text>Товары</Text>
            <Text>{formatPrice(subtotal)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text>Доставка</Text>
            <Text>{formatPrice(deliveryFee)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalText}>Итого</Text>
            <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
          </View>
        </View>
        
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактная информация</Text>
          
          <TextInput
            label="ФИО"
            value={formData.name}
            onChangeText={(text) => updateForm('name', text)}
            style={styles.input}
            mode="outlined"
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />
          
          <TextInput
            label="Телефон"
            value={formData.phone}
            onChangeText={(text) => updateForm('phone', text)}
            style={styles.input}
            keyboardType="phone-pad"
            mode="outlined"
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />
          
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => updateForm('email', text)}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />
        </View>
        
        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Адрес доставки</Text>
          
          <TextInput
            label="Адрес"
            value={formData.address}
            onChangeText={(text) => updateForm('address', text)}
            style={styles.input}
            mode="outlined"
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />
          
          <TextInput
            label="Город"
            value={formData.city}
            onChangeText={(text) => updateForm('city', text)}
            style={styles.input}
            mode="outlined"
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />
          
          <TextInput
            label="Индекс"
            value={formData.zipCode}
            onChangeText={(text) => updateForm('zipCode', text)}
            style={styles.input}
            keyboardType="number-pad"
            mode="outlined"
            outlineColor="#D5C0A7"
            activeOutlineColor="#6B4423"
          />
        </View>
        
        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Способ оплаты</Text>
          
          <RadioButton.Group
            onValueChange={(value) => updateForm('paymentMethod', value)}
            value={formData.paymentMethod}
          >
            <View style={styles.radioItem}>
              <RadioButton.Android value="card" color="#6B4423" />
              <View style={styles.radioLabel}>
                <Icon name="credit-card" size={20} color="#6B4423" style={styles.radioIcon} />
                <Text>Оплата картой онлайн</Text>
              </View>
            </View>
            
            <View style={styles.radioItem}>
              <RadioButton.Android value="cash" color="#6B4423" />
              <View style={styles.radioLabel}>
                <Icon name="dollar-sign" size={20} color="#6B4423" style={styles.radioIcon} />
                <Text>Оплата при получении</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
          labelStyle={{ fontSize: 16 }}
        >
          Подтвердить заказ
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
  },
  itemQuantity: {
    color: '#777777',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  radioLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioIcon: {
    marginRight: 10,
  },
  submitButton: {
    margin: 16,
    paddingVertical: 8,
    backgroundColor: '#6B4423',
  },
});

export default CheckoutPage;