import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Navbar from '../components/Layout/Navbar';

// Mock data - will be replaced with actual context/API later
const cartItems = [
  { id: 1, name: 'Сумка 1', price: 250000, quantity: 1, image: '../../assets/icon.png' },
  { id: 2, name: 'Сумка 2', price: 270000, quantity: 2, image: '../../assets/icon.png' },
];

const CartPage = () => {
  const navigation = useNavigation();

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isEmpty = cartItems.length === 0;

  return (
    <View style={styles.container}>
      <Navbar title="Корзина" />

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-bag" size={80} color="#CCCCCC" />
          <Text style={styles.emptyText}>Ваша корзина пуста</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Products' as never)}
            style={styles.shopButton}
          >
            Перейти в магазин
          </Button>
        </View>
      ) : (
        <>
          <ScrollView style={styles.itemsContainer}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image 
                  source={require('../../assets/icon.png')} 
                  style={styles.itemImage} 
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton}>
                      <Icon name="minus" size={16} color="#6B4423" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton}>
                      <Icon name="plus" size={16} color="#6B4423" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.removeButton}>
                  <Icon name="trash-2" size={22} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Итого:</Text>
              <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
            </View>
            <Divider style={styles.divider} />
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Checkout' as never)}
              style={styles.checkoutButton}
              labelStyle={{ fontSize: 16 }}
            >
              Оформить заказ
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#888888',
    marginVertical: 20,
  },
  shopButton: {
    backgroundColor: '#6B4423',
  },
  itemsContainer: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    justifyContent: 'center',
    paddingLeft: 15,
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#FCEDD9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  divider: {
    backgroundColor: '#D5C0A7',
    height: 1,
    marginBottom: 15,
  },
  checkoutButton: {
    backgroundColor: '#6B4423',
    paddingVertical: 8,
  },
});

export default CartPage;