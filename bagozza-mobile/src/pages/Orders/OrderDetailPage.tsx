import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Card, Chip, Divider, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import Navbar from '../../components/Layout/Navbar';
import { RootStackParamList } from '../../types/navigation';

type OrderDetailRouteProps = RouteProp<RootStackParamList, 'OrderDetail'>;

// Mock order data
const mockOrder = {
  id: '001',
  date: '22.06.2025',
  status: 'Доставлен',
  total: 250000,
  deliveryFee: 15000,
  items: [
    { id: 1, name: 'Сумка 1', price: 250000, quantity: 1 }
  ],
  customer: {
    name: 'Анна Смирнова',
    phone: '+998 90 123 45 67',
    email: 'anna@example.com'
  },
  delivery: {
    address: 'ул. Мирабадская 41, кв 15, Ташкент',
    method: 'Стандартная доставка'
  },
  payment: {
    method: 'Картой онлайн',
    status: 'Оплачено'
  },
  timeline: [
    { status: 'Заказ размещен', date: '22.06.2025, 10:15' },
    { status: 'Заказ подтвержден', date: '22.06.2025, 10:30' },
    { status: 'Заказ отправлен', date: '22.06.2025, 14:45' },
    { status: 'Заказ доставлен', date: '22.06.2025, 16:20' }
  ]
};

const OrderDetailPage = () => {
  const route = useRoute<OrderDetailRouteProps>();
  const { id } = route.params;
  
  // In a real app, you would fetch order data based on the ID
  const order = mockOrder;
  
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

  const statusColor = getStatusColor(order.status);

  return (
    <View style={styles.container}>
      <Navbar title={`Заказ #${order.id}`} showBackButton />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.sectionTitle}>Статус заказа</Text>
                <Text style={styles.dateText}>от {order.date}</Text>
              </View>
              <Chip 
                style={[styles.statusChip, { backgroundColor: statusColor.bg }]}
              >
                <Text style={[{ color: statusColor.text }]}>{order.status}</Text>
              </Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            {/* Order Timeline */}
            {order.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                  {index === order.timeline.length - 1 ? (
                    <Icon name="check" size={12} color="#fff" />
                  ) : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{event.status}</Text>
                  <Text style={styles.timelineDate}>{event.date}</Text>
                </View>
                {index < order.timeline.length - 1 && (
                  <View style={styles.timelineConnector} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
        
        {/* Items Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Ваш заказ</Text>
            <Divider style={styles.divider} />
            
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemContent}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryItem}>
              <Text>Товары</Text>
              <Text>{formatPrice(order.total - order.deliveryFee)}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text>Доставка</Text>
              <Text>{formatPrice(order.deliveryFee)}</Text>
            </View>
            
            <View style={[styles.summaryItem, styles.totalItem]}>
              <Text style={styles.totalText}>Итого</Text>
              <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Информация о получателе</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title={order.customer.name}
              description="ФИО"
              left={props => <List.Icon {...props} icon="account" color="#6B4423" />}
            />
            
            <List.Item
              title={order.customer.phone}
              description="Телефон"
              left={props => <List.Icon {...props} icon="phone" color="#6B4423" />}
            />
            
            <List.Item
              title={order.customer.email}
              description="Email"
              left={props => <List.Icon {...props} icon="email" color="#6B4423" />}
            />
          </Card.Content>
        </Card>
        
        {/* Delivery Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Информация о доставке</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title={order.delivery.address}
              description="Адрес доставки"
              left={props => <List.Icon {...props} icon="map-marker" color="#6B4423" />}
            />
            
            <List.Item
              title={order.delivery.method}
              description="Способ доставки"
              left={props => <List.Icon {...props} icon="truck-delivery" color="#6B4423" />}
            />
          </Card.Content>
        </Card>
        
        {/* Payment Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Информация об оплате</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title={order.payment.method}
              description="Способ оплаты"
              left={props => <List.Icon {...props} icon="credit-card" color="#6B4423" />}
            />
            
            <List.Item
              title={order.payment.status}
              description="Статус оплаты"
              left={props => <List.Icon {...props} icon="check-circle" color="#28A745" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    marginBottom: 15,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  dateText: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },
  statusChip: {
    height: 32,
    justifyContent: 'center',
  },
  divider: {
    marginVertical: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
    position: 'relative',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B4423',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineConnector: {
    position: 'absolute',
    left: 9,
    top: 20,
    bottom: -15,
    width: 2,
    backgroundColor: '#D5C0A7',
  },
  timelineContent: {
    marginLeft: 15,
    flex: 1,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  timelineDate: {
    fontSize: 14,
    color: '#777777',
    marginTop: 2,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#777777',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalItem: {
    marginTop: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4423',
  },
});

export default OrderDetailPage;