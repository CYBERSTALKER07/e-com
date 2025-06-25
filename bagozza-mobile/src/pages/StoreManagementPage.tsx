import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { Text, Button, Card, Title, Paragraph, Divider, List, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../hooks/useAuth';
import { useStore, Store, CreateStoreDTO } from '../context/StoreContext';
import { RootStackParamList } from '../types/navigation';
import { supabase } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  store_id: string;
  stock_quantity: number;
  created_at: string;
}

interface StoreOrder {
  id: string;
  created_at: string;
  status: string;
  total: number;
  customer: {
    name: string;
  };
  items: any[];
}

const StoreManagementPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { userStores, loading, createStore, updateStore, deleteStore } = useStore();

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newStore, setNewStore] = useState<CreateStoreDTO>({ name: '', description: '' });
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  const [storeProducts, setStoreProducts] = useState<Record<string, Product[]>>({});
  const [storeOrders, setStoreOrders] = useState<Record<string, StoreOrder[]>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch products for a store
  const fetchStoreProducts = async (storeId: string) => {
    if (!storeId) return;
    
    setIsLoadingProducts(true);
    try {
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);
      
      if (error) throw error;

      const typedProducts: Product[] = productData || [];
      setStoreProducts(prev => ({ ...prev, [storeId]: typedProducts }));
    } catch (error) {
      console.error('Error fetching store products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch orders for a store
  const fetchStoreOrders = async (storeId: string) => {
    if (!storeId) return;
    
    setIsLoadingOrders(true);
    try {
      // Fetch orders that have items from this store
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .contains('items', [{ product: { store_id: storeId } }]);

      if (error) throw error;

      // Transform orders for our UI
      const typedOrders = orders?.map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total: order.total,
        customer: {
          name: order.shipping_address?.fullName || 'Customer'
        },
        items: order.items || []
      })) || [];

      setStoreOrders(prev => ({ ...prev, [storeId]: typedOrders }));
    } catch (error) {
      console.error('Error fetching store orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // When a store is selected, fetch its products and orders
  useEffect(() => {
    if (selectedStore) {
      fetchStoreProducts(selectedStore.id);
      fetchStoreOrders(selectedStore.id);
    }
  }, [selectedStore]);

  // If user has only one store, select it automatically
  useEffect(() => {
    if (userStores.length === 1 && !selectedStore) {
      setSelectedStore(userStores[0]);
    }
  }, [userStores]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedStore) {
      await fetchStoreProducts(selectedStore.id);
      await fetchStoreOrders(selectedStore.id);
    }
    setRefreshing(false);
  };

  const handleCreateSubmit = async () => {
    if (!newStore.name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }
    
    const store = await createStore(newStore);
    if (store) {
      setIsCreating(false);
      setNewStore({ name: '', description: '' });
      setSelectedStore(store);
      Alert.alert('Success', 'Store created successfully');
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editingStore) return;
    
    if (!editingStore.name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }
    
    const success = await updateStore(editingStore.id, {
      name: editingStore.name,
      description: editingStore.description || '',
      contact_email: editingStore.contact_email,
      contact_phone: editingStore.contact_phone,
      address: editingStore.address,
      is_active: editingStore.is_active
    });
    
    if (success) {
      setEditingStore(null);
      // Update selected store if it's the one we just edited
      if (selectedStore?.id === editingStore.id) {
        const updatedStore = userStores.find(store => store.id === editingStore.id);
        if (updatedStore) {
          setSelectedStore(updatedStore);
        }
      }
      Alert.alert('Success', 'Store updated successfully');
    }
  };

  const handleDeleteStore = async (id: string) => {
    Alert.alert(
      "Delete Store",
      "Are you sure you want to delete this store? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          const success = await deleteStore(id);
          if (success) {
            if (selectedStore?.id === id) {
              setSelectedStore(userStores.length > 0 ? userStores[0] : null);
            }
            Alert.alert('Success', 'Store deleted successfully');
          }
        }}
      ]
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!selectedStore) return;
    
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            const { error } = await supabase
              .from('products')
              .delete()
              .eq('id', productId);

            if (error) throw error;

            // Update local state
            setStoreProducts(prev => ({
              ...prev,
              [selectedStore.id]: prev[selectedStore.id].filter(p => p.id !== productId)
            }));
            
            Alert.alert('Success', 'Product deleted successfully');
          } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Failed to delete product');
          }
        }}
      ]
    );
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

  // Render store creation form
  const renderCreateStoreForm = () => (
    <Card style={styles.card}>
      <Card.Title title="Create New Store" />
      <Card.Content>
        <TextInput
          style={styles.input}
          placeholder="Store name"
          value={newStore.name}
          onChangeText={text => setNewStore({ ...newStore, name: text })}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Store description"
          multiline
          numberOfLines={4}
          value={newStore.description || ''}
          onChangeText={text => setNewStore({ ...newStore, description: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Email"
          keyboardType="email-address"
          value={newStore.contact_email || ''}
          onChangeText={text => setNewStore({ ...newStore, contact_email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Phone"
          keyboardType="phone-pad"
          value={newStore.contact_phone || ''}
          onChangeText={text => setNewStore({ ...newStore, contact_phone: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Store Address"
          value={newStore.address || ''}
          onChangeText={text => setNewStore({ ...newStore, address: text })}
        />
        <View style={styles.buttonRow}>
          <Button 
            mode="contained" 
            onPress={handleCreateSubmit}
            style={styles.primaryButton}
          >
            Create
          </Button>
          <Button 
            mode="outlined"
            onPress={() => setIsCreating(false)}
            style={styles.secondaryButton}
          >
            Cancel
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Render store edit form
  const renderEditStoreForm = () => (
    <Card style={styles.card}>
      <Card.Title title="Edit Store" />
      <Card.Content>
        <TextInput
          style={styles.input}
          placeholder="Store name"
          value={editingStore?.name || ''}
          onChangeText={text => setEditingStore(prev => prev ? { ...prev, name: text } : null)}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Store description"
          multiline
          numberOfLines={4}
          value={editingStore?.description || ''}
          onChangeText={text => setEditingStore(prev => prev ? { ...prev, description: text } : null)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Email"
          keyboardType="email-address"
          value={editingStore?.contact_email || ''}
          onChangeText={text => setEditingStore(prev => prev ? { ...prev, contact_email: text } : null)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Phone"
          keyboardType="phone-pad"
          value={editingStore?.contact_phone || ''}
          onChangeText={text => setEditingStore(prev => prev ? { ...prev, contact_phone: text } : null)}
        />
        <TextInput
          style={styles.input}
          placeholder="Store Address"
          value={editingStore?.address || ''}
          onChangeText={text => setEditingStore(prev => prev ? { ...prev, address: text } : null)}
        />
        
        <List.Item
          title="Store Status"
          description="Enable or disable your store"
          right={() => (
            <TouchableOpacity
              style={[
                styles.toggleButton,
                editingStore?.is_active ? styles.toggleActive : styles.toggleInactive
              ]}
              onPress={() => setEditingStore(prev => 
                prev ? { ...prev, is_active: !prev.is_active } : null
              )}
            >
              <Text style={styles.toggleText}>
                {editingStore?.is_active ? 'Active' : 'Inactive'}
              </Text>
            </TouchableOpacity>
          )}
        />
        
        <View style={styles.buttonRow}>
          <Button 
            mode="contained" 
            onPress={handleUpdateSubmit}
            style={styles.primaryButton}
          >
            Save Changes
          </Button>
          <Button 
            mode="outlined"
            onPress={() => setEditingStore(null)}
            style={styles.secondaryButton}
          >
            Cancel
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Render store selector
  const renderStoreSelector = () => (
    <Card style={styles.card}>
      <Card.Title title="My Stores" />
      <Card.Content>
        <Button 
          mode="contained" 
          icon="plus" 
          onPress={() => setIsCreating(true)}
          style={styles.addButton}
        >
          Create New Store
        </Button>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeChipContainer}>
          {userStores.map(store => (
            <TouchableOpacity 
              key={store.id}
              onPress={() => setSelectedStore(store)}
              style={[
                styles.storeChip,
                selectedStore?.id === store.id && styles.storeChipSelected
              ]}
            >
              <Text 
                style={[
                  styles.storeChipText,
                  selectedStore?.id === store.id && styles.storeChipTextSelected
                ]}
              >
                {store.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  // Render store dashboard
  const renderStoreDashboard = () => {
    if (!selectedStore) return null;
    
    const products = storeProducts[selectedStore.id] || [];
    const orders = storeOrders[selectedStore.id] || [];
    
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    return (
      <View>
        {/* Store Header */}
        <Card style={styles.card}>
          <Card.Title 
            title={selectedStore.name} 
            subtitle={selectedStore.is_active ? 'Active' : 'Inactive'}
            right={(props) => (
              <View style={styles.headerActions}>
                <Button 
                  mode="text" 
                  onPress={() => setEditingStore(selectedStore)}
                  labelStyle={{ color: '#6B4423' }}
                >
                  Edit
                </Button>
                <Button 
                  mode="text" 
                  onPress={() => handleDeleteStore(selectedStore.id)}
                  labelStyle={{ color: 'red' }}
                >
                  Delete
                </Button>
              </View>
            )}
          />
          <Card.Content>
            <Paragraph style={styles.storeDescription}>
              {selectedStore.description}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Dashboard Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statRow}>
                <View style={[styles.statIcon, { backgroundColor: '#FCEDD9' }]}>
                  <Icon name="shopping" size={20} color="#6B4423" />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>Products</Text>
                  <Text style={styles.statValue}>{products.length}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statRow}>
                <View style={[styles.statIcon, { backgroundColor: '#E6F6FF' }]}>
                  <Icon name="package-variant" size={20} color="#0D6EFD" />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>Orders</Text>
                  <Text style={styles.statValue}>{orders.length}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statRow}>
                <View style={[styles.statIcon, { backgroundColor: '#FFF3CD' }]}>
                  <Icon name="clock-outline" size={20} color="#FFC107" />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>Pending</Text>
                  <Text style={styles.statValue}>{pendingOrders}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statRow}>
                <View style={[styles.statIcon, { backgroundColor: '#E7F9ED' }]}>
                  <Icon name="currency-usd" size={20} color="#28A745" />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>Revenue</Text>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {formatPrice(revenue)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'products' && styles.activeTab]} 
            onPress={() => setActiveTab('products')}
          >
            <Text 
              style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}
            >
              Products
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'orders' && styles.activeTab]} 
            onPress={() => setActiveTab('orders')}
          >
            <Text 
              style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}
            >
              Orders
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {activeTab === 'products' && renderProductsTab(products)}
        {activeTab === 'orders' && renderOrdersTab(orders)}
      </View>
    );
  };

  // Render products tab
  const renderProductsTab = (products: Product[]) => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products</Text>
        <Button 
          mode="contained"
          onPress={() => Alert.alert('Info', 'Product creation will be implemented soon')}
          style={styles.addButton}
        >
          Add Product
        </Button>
      </View>
      
      {isLoadingProducts ? (
        <ActivityIndicator style={styles.loader} color="#6B4423" size="large" />
      ) : products.length === 0 ? (
        <Card style={styles.emptyStateCard}>
          <Card.Content style={styles.emptyStateContent}>
            <Icon name="package-variant" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No products yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start adding products to your store
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.productList}>
          {products.map(product => (
            <Card key={product.id} style={styles.productCard}>
              <Card.Cover source={{ uri: product.image }} style={styles.productImage} />
              <Card.Content>
                <Title style={styles.productName}>{product.name}</Title>
                <Paragraph numberOfLines={2} style={styles.productDescription}>
                  {product.description}
                </Paragraph>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                  <Text style={styles.productStock}>
                    Stock: {product.stock_quantity}
                  </Text>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="text" 
                  onPress={() => Alert.alert('Info', 'Product editing will be implemented soon')}
                >
                  Edit
                </Button>
                <Button 
                  mode="text" 
                  onPress={() => handleDeleteProduct(product.id)}
                  textColor="red"
                >
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      )}
    </View>
  );

  // Render orders tab
  const renderOrdersTab = (orders: StoreOrder[]) => (
    <View>
      <Text style={styles.sectionTitle}>Orders</Text>
      
      {isLoadingOrders ? (
        <ActivityIndicator style={styles.loader} color="#6B4423" size="large" />
      ) : orders.length === 0 ? (
        <Card style={styles.emptyStateCard}>
          <Card.Content style={styles.emptyStateContent}>
            <Icon name="receipt" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No orders yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Orders will appear here when customers make purchases
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.orderList}>
          {orders.map(order => (
            <Card key={order.id} style={styles.card}>
              <Card.Title 
                title={`Order #${order.id.substring(0, 8)}`}
                subtitle={new Date(order.created_at).toLocaleDateString()}
                right={(props) => (
                  <Chip mode="outlined" style={{
                    backgroundColor: getStatusColor(order.status) + '20',
                    borderColor: getStatusColor(order.status)
                  }}>
                    <Text style={{ color: getStatusColor(order.status) }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </Chip>
                )}
              />
              <Card.Content>
                <Text>Customer: {order.customer.name}</Text>
                <Text style={styles.orderTotal}>
                  Total: {formatPrice(order.total)}
                </Text>
                <Divider style={styles.divider} />
                <Text style={styles.orderItemsTitle}>Items:</Text>
                {order.items.map((item: any, index: number) => (
                  <View key={index} style={styles.orderItem}>
                    <Text>{item.product?.name || 'Product'} x{item.quantity}</Text>
                    <Text>{formatPrice(item.price * item.quantity)}</Text>
                  </View>
                ))}
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="text" 
                  onPress={() => Alert.alert('Info', 'Order details will be implemented soon')}
                >
                  View Details
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      )}
    </View>
  );

  // If user is not authenticated
  if (!user) {
    return (
      <View style={styles.container}>
        <Navbar title="Store Management" />
        <View style={styles.centerContent}>
          <Text style={styles.messageText}>Please log in to manage your stores</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.actionButton}
          >
            Log In
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar title="Store Management" />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#6B4423" />
            <Text style={styles.loadingText}>Loading stores...</Text>
          </View>
        ) : userStores.length === 0 && !isCreating ? (
          <View style={styles.centerContent}>
            <Text style={styles.messageText}>You don't have any stores yet</Text>
            <Button 
              mode="contained" 
              icon="plus" 
              onPress={() => setIsCreating(true)}
              style={styles.actionButton}
            >
              Create Your First Store
            </Button>
          </View>
        ) : (
          <>
            {isCreating ? renderCreateStoreForm() : null}
            {editingStore ? renderEditStoreForm() : null}
            
            {!isCreating && !editingStore && (
              <>
                {renderStoreSelector()}
                {selectedStore && renderStoreDashboard()}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flex: 1,
    minHeight: 300,
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  actionButton: {
    backgroundColor: '#6B4423',
    borderRadius: 5,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#6B4423',
  },
  secondaryButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#6B4423',
  },
  addButton: {
    marginBottom: 16,
    backgroundColor: '#6B4423',
  },
  storeChipContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  storeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    marginRight: 12,
  },
  storeChipSelected: {
    backgroundColor: '#6B4423',
  },
  storeChipText: {
    color: '#333333',
  },
  storeChipTextSelected: {
    color: '#FFFFFF',
  },
  storeDescription: {
    marginBottom: 10,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    width: '48%',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statText: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6B4423',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#6B4423',
    fontWeight: 'bold',
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
  loader: {
    marginVertical: 20,
  },
  productList: {
    marginBottom: 16,
  },
  productCard: {
    marginBottom: 16,
  },
  productImage: {
    height: 150,
  },
  productName: {
    fontSize: 16,
    marginTop: 8,
  },
  productDescription: {
    color: '#666666',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  productStock: {
    fontSize: 14,
    color: '#666666',
  },
  orderList: {
    marginBottom: 16,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  divider: {
    marginVertical: 10,
  },
  orderItemsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  emptyStateCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555555',
  },
  emptyStateSubtext: {
    color: '#777777',
    textAlign: 'center',
    marginTop: 5,
  },
  headerActions: {
    flexDirection: 'row',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: '#E7F9ED',
  },
  toggleInactive: {
    backgroundColor: '#FFEBEE',
  },
  toggleText: {
    fontWeight: '500',
    fontSize: 12,
  },
});

export default StoreManagementPage;