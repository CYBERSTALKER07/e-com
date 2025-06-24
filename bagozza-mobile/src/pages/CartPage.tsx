import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Divider, IconButton, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Layout/Navbar';
import Icon from 'react-native-vector-icons/Feather';

// Sample cart items with images
const cartItems = [
  {
    id: 1,
    name: 'Кожаная сумка Bagozza Premium',
    price: 250000,
    discountPrice: 220000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=870&auto=format&fit=crop',
    color: '#6B4423'
  },
  {
    id: 2,
    name: 'Кошелек Bagozza Elegance',
    price: 120000,
    discountPrice: null,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=387&auto=format&fit=crop',
    color: '#000000'
  }
];

const CartPage = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState(cartItems);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };
  
  const updateQuantity = (id, action) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          if (action === 'increase') {
            return { ...item, quantity: item.quantity + 1 };
          } else if (action === 'decrease' && item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 };
          }
        }
        return item;
      })
    );
  };
  
  const removeItem = (id) => {
    Alert.alert(
      "Удаление товара",
      "Вы уверены, что хотите удалить этот товар из корзины?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Удалить", 
          style: "destructive",
          onPress: () => {
            setItems(prevItems => prevItems.filter(item => item.id !== id));
          }
        }
      ]
    );
  };
  
  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'bagozza') {
      setPromoApplied(true);
    } else {
      Alert.alert("Ошибка", "Промокод недействителен");
    }
  };
  
  // Calculate totals
  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal > 0 ? 20000 : 0;
  const total = subtotal - discount + shipping;
  
  const handleCheckout = () => {
    navigation.navigate('Checkout' as never);
  };

  return (
    <View style={styles.container}>
      <Navbar title="Корзина" showBackButton />
      
      {items.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Icon name="shopping-cart" size={70} color="#CCCCCC" />
          <Text style={styles.emptyCartText}>Ваша корзина пуста</Text>
          <Text style={styles.emptyCartSubtext}>
            Добавьте товары для оформления заказа
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Products' as never)}
            style={styles.shopButton}
            icon="shopping"
          >
            Перейти в магазин
          </Button>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Cart Items */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Товары в корзине ({items.length})</Text>
            
            {items.map((item) => (
              <Card key={item.id} style={styles.cartItemCard}>
                <View style={styles.cartItemContent}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.itemDetails}>
                    <View style={styles.itemNameRow}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <IconButton
                        icon="close"
                        size={20}
                        color="#888"
                        onPress={() => removeItem(item.id)}
                      />
                    </View>
                    
                    <View style={styles.colorContainer}>
                      <Text style={styles.colorLabel}>Цвет:</Text>
                      <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                    </View>
                    
                    <View style={styles.priceQuantityRow}>
                      <View>
                        {item.discountPrice ? (
                          <View>
                            <Text style={styles.discountPrice}>{formatPrice(item.discountPrice)}</Text>
                            <Text style={styles.originalPrice}>{formatPrice(item.price)}</Text>
                          </View>
                        ) : (
                          <Text style={styles.price}>{formatPrice(item.price)}</Text>
                        )}
                      </View>
                      
                      <View style={styles.quantityControl}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.id, 'decrease')}
                        >
                          <Icon name="minus" size={16} color="#6B4423" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.id, 'increase')}
                        >
                          <Icon name="plus" size={16} color="#6B4423" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
          
          {/* Promo Code */}
          <View style={styles.promoContainer}>
            <Text style={styles.sectionTitle}>Промокод</Text>
            <View style={styles.promoInputContainer}>
              <TextInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Введите промокод"
                mode="outlined"
                disabled={promoApplied}
                style={styles.promoInput}
                outlineColor="#D5C0A7"
                activeOutlineColor="#6B4423"
                right={
                  promoApplied ? 
                  <TextInput.Icon icon="check" color="#28A745" /> : null
                }
              />
              <Button 
                mode="contained" 
                onPress={applyPromoCode}
                disabled={promoApplied || !promoCode}
                style={[styles.promoButton, promoApplied && styles.promoAppliedButton]}
              >
                {promoApplied ? "Применен" : "Применить"}
              </Button>
            </View>
            {promoApplied && (
              <Text style={styles.promoAppliedText}>
                Промокод применен! Скидка 10%
              </Text>
            )}
          </View>
          
          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Итого заказа</Text>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Товары ({items.length}):</Text>
                  <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                </View>
                
                {promoApplied && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Скидка (10%):</Text>
                    <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
                  </View>
                )}
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Доставка:</Text>
                  <Text style={styles.summaryValue}>{formatPrice(shipping)}</Text>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Итоговая сумма:</Text>
                  <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
          
          {/* Continue Shopping */}
          <TouchableOpacity 
            style={styles.continueShopping}
            onPress={() => navigation.navigate('Products' as never)}
          >
            <Icon name="arrow-left" size={18} color="#6B4423" />
            <Text style={styles.continueShoppingText}>Продолжить покупки</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      
      {items.length > 0 && (
        <View style={styles.checkoutContainer}>
          <Button 
            mode="contained" 
            onPress={handleCheckout}
            style={styles.checkoutButton}
            labelStyle={styles.checkoutButtonLabel}
            icon="credit-card"
          >
            Оформить заказ
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  emptyCartSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#777',
    paddingHorizontal: 20,
  },
  shopButton: {
    backgroundColor: '#6B4423',
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  sectionContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  cartItemCard: {
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  cartItemContent: {
    flexDirection: 'row',
    padding: 10,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
    width: '80%',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorLabel: {
    fontSize: 14,
    color: '#777',
    marginRight: 8,
  },
  colorCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5C0A7',
    borderRadius: 5,
  },
  quantityButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  promoContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FCEDD9',
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  promoButton: {
    marginLeft: 10,
    backgroundColor: '#6B4423',
  },
  promoAppliedButton: {
    backgroundColor: '#28A745',
  },
  promoAppliedText: {
    color: '#28A745',
    marginTop: 8,
    fontWeight: '500',
  },
  summaryContainer: {
    padding: 15,
  },
  summaryCard: {
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#28A745',
  },
  divider: {
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  continueShopping: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  continueShoppingText: {
    color: '#6B4423',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '500',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    padding: 15,
    elevation: 5,
  },
  checkoutButton: {
    backgroundColor: '#6B4423',
  },
  checkoutButtonLabel: {
    fontSize: 16,
    paddingVertical: 2,
  },
});

export default CartPage;