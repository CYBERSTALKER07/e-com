import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Chip, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import Navbar from '../components/Layout/Navbar';

// Mock data for order history
const mockOrders = [
  { 
    id: '001', 
    date: '22.06.2025', 
    status: 'Доставлен',
    total: 250000,
    items: [
      { id: 1, name: 'Сумка 1', quantity: 1 }
    ]
  },
  { 
    id: '002', 
    date: '15.06.2025', 
    status: 'В процессе',
    total: 520000,
    items: [
      { id: 2, name: 'Сумка 2', quantity: 1 },
      { id: 3, name: 'Рюкзак 1', quantity: 1 }
    ]
  },
  { 
    id: '003', 
    date: '01.06.2025', 
    status: 'Отменен',
    total: 270000,
    items: [
      { id: 4, name: 'Кошелек 1', quantity: 1 }
    ]
  }
];

const OrdersPage = () => {
  const navigation = useNavigation();

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Доставлен': return { bg: '#E7F9ED', text: '#28A745' };
      case 'В процессе': return { bg: '#E6F6FF', text: '#0D6EFD' };
      case 'Отменен': return { bg: '#FFEBEE', text: '#DC3545' };
      default: return { bg: '#F8F9FA', text: '#6C757D' };
    }
  };

  const renderOrder = ({ item }: { item: typeof mockOrders[0] }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <Card 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { id: item.id } as never)}
      >
        <Card.Content>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Заказ #{item.id}</Text>
              <Text style={styles.orderDate}>{item.date}</Text>
            </View>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusColor.bg }]}
            >
              <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.itemsContainer}>
            {item.items.map((orderItem, index) => (
              <Text key={orderItem.id} style={styles.itemText}>
                {orderItem.name} × {orderItem.quantity}
                {index < item.items.length - 1 && ', '}
              </Text>
            ))}
          </View>
          
          <View style={styles.orderFooter}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalPrice}>{formatPrice(item.total)}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Navbar title="Мои заказы" />
      
      {mockOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-bag" size={80} color="#CCCCCC" />
          <Text style={styles.emptyText}>У вас пока нет заказов</Text>
        </View>
      ) : (
        <FlatList
          data={mockOrders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
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
    marginTop: 20,
  },
  listContent: {
    padding: 15,
  },
  orderCard: {
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#777777',
    marginTop: 4,
  },
  statusChip: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#555555',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
  },
});

export default OrdersPage;