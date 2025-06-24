import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, SegmentedButtons, List, Divider } from 'react-native-paper';
import Navbar from '../../components/Layout/Navbar';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  
  // Mock data
  const mockProducts = Array(5).fill(null).map((_, index) => ({
    id: index + 1,
    name: `Сумка ${index + 1}`,
    price: 250000 + index * 10000,
    stock: index % 2 === 0 ? Math.floor(Math.random() * 10) + 1 : 0,
  }));
  
  const mockOrders = Array(3).fill(null).map((_, index) => ({
    id: `00${index + 1}`,
    customer: `Покупатель ${index + 1}`,
    date: `${22 - index}.06.2025`,
    status: index === 0 ? 'Новый' : index === 1 ? 'В процессе' : 'Доставлен',
    total: 250000 + index * 100000,
  }));

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новый': return '#0D6EFD';
      case 'В процессе': return '#FFC107';
      case 'Доставлен': return '#28A745';
      case 'Отменен': return '#DC3545';
      default: return '#6C757D';
    }
  };

  return (
    <View style={styles.container}>
      <Navbar title="Панель администратора" />
      
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'products', label: 'Товары' },
          { value: 'orders', label: 'Заказы' },
          { value: 'settings', label: 'Настройки' },
        ]}
        style={styles.tabButtons}
      />
      
      <ScrollView style={styles.content}>
        {activeTab === 'products' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Управление товарами</Text>
              <Button 
                mode="contained" 
                icon="plus"
                style={styles.addButton}
              >
                Добавить
              </Button>
            </View>
            
            {mockProducts.map(product => (
              <Card key={product.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.productRow}>
                    <View>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                    </View>
                    <Text 
                      style={[
                        styles.stockBadge, 
                        { backgroundColor: product.stock > 0 ? '#E7F9ED' : '#FFEBEE' }
                      ]}
                    >
                      {product.stock > 0 ? 'В наличии' : 'Нет в наличии'}
                    </Text>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button mode="text" textColor="#6B4423">Изменить</Button>
                  <Button mode="text" textColor="#DC3545">Удалить</Button>
                </Card.Actions>
              </Card>
            ))}
          </View>
        )}
        
        {activeTab === 'orders' && (
          <View>
            <Text style={styles.sectionTitle}>Управление заказами</Text>
            
            {mockOrders.map(order => (
              <Card key={order.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Заказ #{order.id}</Text>
                    <Text 
                      style={[
                        styles.statusBadge, 
                        { color: getStatusColor(order.status) }
                      ]}
                    >
                      {order.status}
                    </Text>
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  <View style={styles.orderInfo}>
                    <Text>Покупатель: {order.customer}</Text>
                    <Text>Дата: {order.date}</Text>
                    <Text>Сумма: {formatPrice(order.total)}</Text>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button mode="text" textColor="#6B4423">Подробнее</Button>
                  <Button mode="text" textColor="#0D6EFD">Изменить статус</Button>
                </Card.Actions>
              </Card>
            ))}
          </View>
        )}
        
        {activeTab === 'settings' && (
          <View>
            <Text style={styles.sectionTitle}>Настройки магазина</Text>
            
            <Card style={styles.card}>
              <Card.Content>
                <List.Section>
                  <List.Item 
                    title="Информация о магазине" 
                    description="Название, описание, контакты" 
                    left={props => <List.Icon {...props} icon="store" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                  />
                  <Divider />
                  <List.Item 
                    title="Управление пользователями" 
                    description="Администраторы и роли" 
                    left={props => <List.Icon {...props} icon="account-multiple" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                  />
                  <Divider />
                  <List.Item 
                    title="Способы оплаты" 
                    description="Настройка платежных систем" 
                    left={props => <List.Icon {...props} icon="credit-card" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                  />
                  <Divider />
                  <List.Item 
                    title="Категории товаров" 
                    description="Управление категориями" 
                    left={props => <List.Icon {...props} icon="shape" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                  />
                </List.Section>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabButtons: {
    margin: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#6B4423',
  },
  card: {
    marginBottom: 16,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
    marginTop: 4,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
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
  statusBadge: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 10,
  },
  orderInfo: {
    gap: 4,
  },
});

export default AdminPage;