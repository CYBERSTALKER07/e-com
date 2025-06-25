import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Text, Button, Divider, List, Title, Chip, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Navbar from '../../components/Layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useOrder, OrderStatus } from '../../context/OrderContext';
import { supabase } from '../../context/AuthContext';

type AdminTab = 'dashboard' | 'orders' | 'products' | 'settings';

const AdminPage = () => {
  const { isAuthenticated, isAdmin, profile } = useAuth();
  const { userStores, selectedStore, selectStore, storeMetrics, fetchStoreMetrics } = useStore();
  const { orders, updateOrderStatus, refreshOrders } = useOrder();
  const navigation = useNavigation();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [storeUsers, setStoreUsers] = useState<any[]>([]);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigation.navigate('Login' as never);
    }
  }, [isAuthenticated, isAdmin, navigation]);

  // Fetch products for the selected store
  useEffect(() => {
    if (selectedStore) {
      fetchStoreProducts(selectedStore.id);
      fetchStoreUsers();
    }
  }, [selectedStore]);
  
  // Fetch metrics when dashboard tab is active
  useEffect(() => {
    if (activeTab === 'dashboard' && selectedStore) {
      fetchStoreMetrics(selectedStore.id);
    }
  }, [activeTab, selectedStore]);
  
  const fetchStoreProducts = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  
  const fetchStoreUsers = async () => {
    try {
      // In a real app, you would fetch users who have access to this store
      // For now, we'll just show the current user as an admin
      setStoreUsers([
        {
          id: profile?.id || '1',
          name: profile?.full_name || 'Admin User',
          email: profile?.email || 'admin@example.com',
          role: 'admin'
        }
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedStore) {
      await fetchStoreMetrics(selectedStore.id);
      await fetchStoreProducts(selectedStore.id);
    }
    await refreshOrders();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'processing': return '#0D6EFD';
      case 'shipped': return '#6F42C1';
      case 'delivered': return '#28A745';
      case 'cancelled': return '#DC3545';
      default: return '#6C757D';
    }
  };
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      await refreshOrders();
    }
  };

  // Filter orders based on status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Calculate statistics
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  
  // Calculate revenue from orders
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect to login
  }

  return (
    <View style={styles.container}>
      <Navbar title="Админ-панель" />
      
      <SegmentedButtons
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AdminTab)}
        style={styles.tabButtons}
        buttons={[
          { value: 'dashboard', label: 'Обзор', icon: 'chart-bar' },
          { value: 'orders', label: 'Заказы', icon: 'package' },
          { value: 'products', label: 'Товары', icon: 'shopping' },
          { value: 'settings', label: 'Настройки', icon: 'cog' }
        ]}
      />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'dashboard' && (
          <View>
            {/* Store Selection */}
            {userStores.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Выберите магазин</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {userStores.map(store => (
                      <TouchableOpacity 
                        key={store.id}
                        style={[
                          styles.storeChip,
                          selectedStore?.id === store.id && styles.selectedStoreChip
                        ]}
                        onPress={() => selectStore(store)}
                      >
                        <Text 
                          style={[
                            styles.storeChipText,
                            selectedStore?.id === store.id && styles.selectedStoreChipText
                          ]}
                        >
                          {store.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Card.Content>
              </Card>
            )}
            
            {/* Dashboard Stats */}
            <Text style={styles.sectionTitle}>Статистика</Text>
            
            <View style={styles.statsGrid}>
              <Card style={styles.statsCard}>
                <Card.Content style={styles.statsContent}>
                  <View style={[styles.statsIcon, { backgroundColor: '#FCEDD9' }]}>
                    <Icon name="shopping-bag" size={24} color="#6B4423" />
                  </View>
                  <View>
                    <Text style={styles.statsLabel}>Товары</Text>
                    <Text style={styles.statsValue}>{storeMetrics[selectedStore?.id || '']?.total_products || products.length}</Text>
                  </View>
                </Card.Content>
              </Card>
              
              <Card style={styles.statsCard}>
                <Card.Content style={styles.statsContent}>
                  <View style={[styles.statsIcon, { backgroundColor: '#E7F9ED' }]}>
                    <Icon name="package" size={24} color="#28A745" />
                  </View>
                  <View>
                    <Text style={styles.statsLabel}>Заказы</Text>
                    <Text style={styles.statsValue}>{storeMetrics[selectedStore?.id || '']?.total_orders || orders.length}</Text>
                  </View>
                </Card.Content>
              </Card>
              
              <Card style={styles.statsCard}>
                <Card.Content style={styles.statsContent}>
                  <View style={[styles.statsIcon, { backgroundColor: '#E6F6FF' }]}>
                    <Icon name="dollar-sign" size={24} color="#0D6EFD" />
                  </View>
                  <View>
                    <Text style={styles.statsLabel}>Доход</Text>
                    <Text style={styles.statsValue}>{formatPrice(storeMetrics[selectedStore?.id || '']?.revenue || totalRevenue)}</Text>
                  </View>
                </Card.Content>
              </Card>
              
              <Card style={styles.statsCard}>
                <Card.Content style={styles.statsContent}>
                  <View style={[styles.statsIcon, { backgroundColor: '#FFF3CD' }]}>
                    <Icon name="clock" size={24} color="#FFC107" />
                  </View>
                  <View>
                    <Text style={styles.statsLabel}>Ожидают</Text>
                    <Text style={styles.statsValue}>{storeMetrics[selectedStore?.id || '']?.pending_orders || pendingOrders}</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
            
            {/* Order Status Breakdown */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Статусы заказов</Text>
                <Divider style={styles.divider} />
                
                <View style={styles.statusRow}>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#FFF3CD' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#FFC107' }]}>{pendingOrders}</Text>
                    </View>
                    <Text style={styles.statusText}>Ожидают</Text>
                  </View>
                  
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#E6F6FF' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#0D6EFD' }]}>{processingOrders}</Text>
                    </View>
                    <Text style={styles.statusText}>В обработке</Text>
                  </View>
                  
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#F0E6FF' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#6F42C1' }]}>{shippedOrders}</Text>
                    </View>
                    <Text style={styles.statusText}>Отправлены</Text>
                  </View>
                </View>
                
                <View style={[styles.statusRow, { marginTop: 16 }]}>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#E7F9ED' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#28A745' }]}>{deliveredOrders}</Text>
                    </View>
                    <Text style={styles.statusText}>Доставлены</Text>
                  </View>
                  
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#FFEBEE' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#DC3545' }]}>{cancelledOrders}</Text>
                    </View>
                    <Text style={styles.statusText}>Отменены</Text>
                  </View>
                  
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#F5F5F5' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#6C757D' }]}>{orders.length}</Text>
                    </View>
                    <Text style={styles.statusText}>Всего</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
            
            {/* Recent Orders */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Последние заказы</Text>
                  <Button 
                    mode="text"
                    compact
                    onPress={() => setActiveTab('orders')}
                    textColor="#6B4423"
                  >
                    Все заказы
                  </Button>
                </View>
                <Divider style={styles.divider} />
                
                {orders.length === 0 ? (
                  <Text style={styles.emptyText}>Заказов пока нет</Text>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <Card key={order.id} style={styles.orderCard}>
                      <Card.Content>
                        <View style={styles.orderHeader}>
                          <Text style={styles.orderId}>Заказ #{order.id.substring(0, 8)}</Text>
                          <Text 
                            style={[
                              styles.statusBadge, 
                              { color: getStatusColor(order.status) }
                            ]}
                          >
                            {order.status === 'pending' ? 'Ожидает' :
                             order.status === 'processing' ? 'В обработке' :
                             order.status === 'shipped' ? 'Отправлен' :
                             order.status === 'delivered' ? 'Доставлен' : 'Отменен'}
                          </Text>
                        </View>
                        
                        <Divider style={styles.divider} />
                        
                        <View style={styles.orderInfo}>
                          <Text>Покупатель: {order.customer.name}</Text>
                          <Text>Дата: {order.date}</Text>
                          <Text>Сумма: {formatPrice(order.total)}</Text>
                        </View>
                      </Card.Content>
                      <Card.Actions>
                        <Button 
                          mode="text" 
                          onPress={() => navigation.navigate('OrderDetail' as never, { id: order.id } as never)}
                          textColor="#6B4423"
                        >
                          Подробнее
                        </Button>
                        <Button 
                          mode="text" 
                          onPress={() => {
                            // Show status change options (would use a modal or actionsheet in a real app)
                            if (order.status === 'pending') {
                              handleStatusChange(order.id, 'processing');
                            } else if (order.status === 'processing') {
                              handleStatusChange(order.id, 'shipped');
                            } else if (order.status === 'shipped') {
                              handleStatusChange(order.id, 'delivered');
                            }
                          }}
                          textColor="#0D6EFD"
                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          {order.status === 'pending' ? 'Принять' :
                           order.status === 'processing' ? 'Отправить' :
                           order.status === 'shipped' ? 'Доставлен' : 'Изменить статус'}
                        </Button>
                      </Card.Actions>
                    </Card>
                  ))
                )}
              </Card.Content>
            </Card>
          </View>
        )}
        
        {activeTab === 'orders' && (
          <View>
            <Text style={styles.sectionTitle}>Управление заказами</Text>
            
            {/* Status Filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              <Chip 
                selected={statusFilter === 'all'} 
                onPress={() => setStatusFilter('all')}
                style={styles.filterChip}
              >
                Все ({orders.length})
              </Chip>
              <Chip 
                selected={statusFilter === 'pending'} 
                onPress={() => setStatusFilter('pending')}
                style={styles.filterChip}
              >
                Ожидают ({pendingOrders})
              </Chip>
              <Chip 
                selected={statusFilter === 'processing'} 
                onPress={() => setStatusFilter('processing')}
                style={styles.filterChip}
              >
                В обработке ({processingOrders})
              </Chip>
              <Chip 
                selected={statusFilter === 'shipped'} 
                onPress={() => setStatusFilter('shipped')}
                style={styles.filterChip}
              >
                Отправлены ({shippedOrders})
              </Chip>
              <Chip 
                selected={statusFilter === 'delivered'} 
                onPress={() => setStatusFilter('delivered')}
                style={styles.filterChip}
              >
                Доставлены ({deliveredOrders})
              </Chip>
              <Chip 
                selected={statusFilter === 'cancelled'} 
                onPress={() => setStatusFilter('cancelled')}
                style={styles.filterChip}
              >
                Отменены ({cancelledOrders})
              </Chip>
            </ScrollView>
            
            {filteredOrders.length === 0 ? (
              <Text style={styles.emptyText}>Заказов с выбранным статусом нет</Text>
            ) : (
              filteredOrders.map(order => (
                <Card key={order.id} style={styles.orderCard}>
                  <Card.Content>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderId}>Заказ #{order.id.substring(0, 8)}</Text>
                      <Text 
                        style={[
                          styles.statusBadge, 
                          { color: getStatusColor(order.status) }
                        ]}
                      >
                        {order.status === 'pending' ? 'Ожидает' :
                         order.status === 'processing' ? 'В обработке' :
                         order.status === 'shipped' ? 'Отправлен' :
                         order.status === 'delivered' ? 'Доставлен' : 'Отменен'}
                      </Text>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.orderInfo}>
                      <Text>Покупатель: {order.customer.name}</Text>
                      <Text>Email: {order.customer.email}</Text>
                      <Text>Телефон: {order.customer.phone}</Text>
                      <Text>Дата: {order.date}</Text>
                      <Text>Способ оплаты: {order.payment.method}</Text>
                      <Text>Сумма: {formatPrice(order.total)}</Text>
                    </View>
                  </Card.Content>
                  <Card.Actions>
                    <Button 
                      mode="text" 
                      onPress={() => navigation.navigate('OrderDetail' as never, { id: order.id } as never)}
                      textColor="#6B4423"
                    >
                      Подробнее
                    </Button>
                    
                    <Button 
                      mode="text" 
                      onPress={() => {
                        // In a real app, show a dropdown menu with status options
                        if (order.status === 'pending') {
                          handleStatusChange(order.id, 'processing');
                        } else if (order.status === 'processing') {
                          handleStatusChange(order.id, 'shipped');
                        } else if (order.status === 'shipped') {
                          handleStatusChange(order.id, 'delivered');
                        }
                      }}
                      textColor="#0D6EFD"
                      disabled={order.status === 'delivered' || order.status === 'cancelled'}
                    >
                      {order.status === 'pending' ? 'Принять' :
                       order.status === 'processing' ? 'Отправить' :
                       order.status === 'shipped' ? 'Доставлен' : 'Изменить статус'}
                    </Button>
                    
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <Button 
                        mode="text" 
                        onPress={() => handleStatusChange(order.id, 'cancelled')}
                        textColor="#DC3545"
                      >
                        Отменить
                      </Button>
                    )}
                  </Card.Actions>
                </Card>
              ))
            )}
          </View>
        )}
        
        {activeTab === 'products' && (
          <View>
            <Text style={styles.sectionTitle}>Управление товарами</Text>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Товары</Text>
              <Button 
                mode="contained" 
                style={styles.addButton}
                onPress={() => {
                  // Navigate to product creation page
                  // In a real app, this would open a modal or navigate to a form
                  alert('В разработке: Создание нового товара');
                }}
              >
                Добавить
              </Button>
            </View>
            
            {products.length === 0 ? (
              <Text style={styles.emptyText}>Товаров пока нет</Text>
            ) : (
              products.map(product => (
                <Card key={product.id} style={styles.card}>
                  <Card.Content style={styles.productRow}>
                    <View>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                      <Text 
                        style={[
                          styles.stockBadge, 
                          { backgroundColor: product.stock_quantity > 0 ? '#E7F9ED' : '#FFEBEE' }
                        ]}
                      >
                        {product.stock_quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                      </Text>
                    </View>
                  </Card.Content>
                  <Card.Actions>
                    <Button 
                      mode="text" 
                      onPress={() => {
                        // Navigate to product edit page
                        // In a real app, this would open a modal or navigate to a form
                        alert('В разработке: Редактирование товара');
                      }}
                      textColor="#6B4423"
                    >
                      Изменить
                    </Button>
                    <Button 
                      mode="text" 
                      onPress={() => {
                        // Delete product confirmation
                        // In a real app, this would show a confirmation dialog
                        alert('В разработке: Удаление товара');
                      }}
                      textColor="#DC3545"
                    >
                      Удалить
                    </Button>
                  </Card.Actions>
                </Card>
              ))
            )}
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
                    onPress={() => {
                      // Navigate to store settings
                      alert('В разработке: Настройки магазина');
                    }}
                  />
                  <Divider />
                  <List.Item 
                    title="Управление пользователями" 
                    description="Администраторы и роли" 
                    left={props => <List.Icon {...props} icon="account-multiple" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => {
                      // Navigate to user management
                      alert('В разработке: Управление пользователями');
                    }}
                  />
                  <Divider />
                  <List.Item 
                    title="Способы оплаты" 
                    description="Настройка платежных систем" 
                    left={props => <List.Icon {...props} icon="credit-card" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => {
                      // Navigate to payment settings
                      alert('В разработке: Настройка способов оплаты');
                    }}
                  />
                  <Divider />
                  <List.Item 
                    title="Категории товаров" 
                    description="Управление категориями" 
                    left={props => <List.Icon {...props} icon="shape" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => {
                      // Navigate to category management
                      alert('В разработке: Управление категориями');
                    }}
                  />
                </List.Section>
              </Card.Content>
            </Card>
            
            <Text style={styles.sectionTitle}>Пользователи</Text>
            
            {storeUsers.map(user => (
              <Card key={user.id} style={styles.card}>
                <Card.Content>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text>{user.email}</Text>
                  <Chip style={styles.roleChip}>
                    {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </Chip>
                </Card.Content>
              </Card>
            ))}
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
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
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#6B4423',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    width: '48%',
    marginBottom: 12,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsLabel: {
    fontSize: 14,
    color: '#777777',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666666',
  },
  divider: {
    marginVertical: 10,
  },
  orderCard: {
    marginBottom: 12,
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
  orderInfo: {
    gap: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 8,
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
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  storeChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedStoreChip: {
    backgroundColor: '#6B4423',
  },
  storeChipText: {
    color: '#333333',
  },
  selectedStoreChipText: {
    color: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777777',
    padding: 20,
  }
});

export default AdminPage;