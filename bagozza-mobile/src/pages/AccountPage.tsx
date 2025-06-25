import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl, Image } from 'react-native';
import { Text, Button, Card, Title, Avatar, List, Divider, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';

const AccountPage = () => {
  const navigation = useNavigation();
  const { user, profile, isLoading, isAuthenticated, signOut, updateProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, would refresh user profile here
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => signOut() }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!editForm.full_name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      const { error } = await updateProfile({
        full_name: editForm.full_name,
        phone: editForm.phone,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  // Render a login/register screen if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Navbar title="Account" />
        <View style={styles.centerContainer}>
          <Avatar.Icon 
            size={80} 
            icon="account" 
            style={styles.avatar} 
            color="#6B4423" 
            backgroundColor="#FCEDD9" 
          />
          <Text style={styles.title}>Welcome to Bagozza</Text>
          <Text style={styles.subtitle}>Login or create an account to start shopping</Text>
          
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.actionButton}
            labelStyle={{ fontSize: 16 }}
          >
            Login
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Register' as never)}
            style={[styles.actionButton, styles.secondaryButton]}
            labelStyle={{ fontSize: 16, color: '#6B4423' }}
          >
            Create Account
          </Button>
        </View>
      </View>
    );
  }

  // Render edit profile form
  if (isEditing) {
    return (
      <View style={styles.container}>
        <Navbar title="Edit Profile" />
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.avatarContainer}>
                <Avatar.Icon 
                  size={80} 
                  icon="account" 
                  style={styles.avatar} 
                  color="#6B4423" 
                  backgroundColor="#FCEDD9" 
                />
                <Button 
                  mode="text"
                  icon="camera"
                  onPress={() => Alert.alert('Info', 'Photo upload will be implemented soon')}
                >
                  Change Photo
                </Button>
              </View>

              <TextInput
                label="Full Name"
                value={editForm.full_name}
                onChangeText={text => setEditForm(prev => ({ ...prev, full_name: text }))}
                style={styles.input}
              />
              
              <TextInput
                label="Email"
                value={profile?.email || ''}
                disabled
                style={styles.input}
              />
              
              <TextInput
                label="Phone Number"
                value={editForm.phone || ''}
                onChangeText={text => setEditForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                style={styles.input}
              />
              
              <View style={styles.buttonRow}>
                <Button 
                  mode="contained"
                  onPress={handleUpdateProfile}
                  style={styles.primaryButton}
                >
                  Save Changes
                </Button>
                <Button 
                  mode="outlined"
                  onPress={() => {
                    // Reset form and cancel editing
                    setEditForm({
                      full_name: profile?.full_name || '',
                      phone: profile?.phone || '',
                    });
                    setIsEditing(false);
                  }}
                  style={styles.secondaryButton}
                >
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    );
  }

  // Render user profile
  return (
    <View style={styles.container}>
      <Navbar title="My Account" />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Icon 
                size={80} 
                icon="account" 
                style={styles.avatar} 
                color="#6B4423" 
                backgroundColor="#FCEDD9" 
              />
              <View style={styles.profileInfo}>
                <Title>{profile?.full_name || 'User'}</Title>
                <Text>{profile?.email || ''}</Text>
                <Text>{profile?.phone || 'No phone number'}</Text>
                <Text style={styles.plan}>
                  Plan: {profile?.plan === 'premium' ? 'Premium' : 'Free'}
                </Text>
              </View>
            </View>
            <Button 
              mode="contained" 
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>
        
        {/* Orders Section */}
        <List.Section>
          <List.Subheader>Orders & Shopping</List.Subheader>
          <Card style={styles.menuCard}>
            <List.Item
              title="My Orders"
              description="Track your order history"
              left={props => <List.Icon {...props} icon="package-variant" color="#6B4423" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Orders' as never)}
            />
            <Divider />
            <List.Item
              title="My Cart"
              description="View your shopping cart"
              left={props => <List.Icon {...props} icon="cart" color="#6B4423" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Cart' as never)}
            />
            <Divider />
            <List.Item
              title="My Stores"
              description="Manage your stores"
              left={props => <List.Icon {...props} icon="store" color="#6B4423" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Store' as never)}
            />
          </Card>
        </List.Section>

        {/* Account Settings */}
        <List.Section>
          <List.Subheader>Account Settings</List.Subheader>
          <Card style={styles.menuCard}>
            <List.Item
              title="Address Book"
              description="Manage your shipping addresses"
              left={props => <List.Icon {...props} icon="map-marker" color="#6B4423" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Info', 'Address management will be implemented soon')}
            />
            <Divider />
            <List.Item
              title="Payment Methods"
              description="Manage your payment options"
              left={props => <List.Icon {...props} icon="credit-card" color="#6B4423" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Info', 'Payment method management will be implemented soon')}
            />
            <Divider />
            {profile?.plan !== 'premium' && (
              <>
                <List.Item
                  title="Upgrade to Premium"
                  description="Get access to exclusive benefits"
                  left={props => <List.Icon {...props} icon="star" color="#e07832" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => Alert.alert('Info', 'Premium upgrade will be implemented soon')}
                />
                <Divider />
              </>
            )}
            <List.Item
              title="Notifications Settings"
              description="Manage app notifications"
              left={props => <List.Icon {...props} icon="bell" color="#6B4423" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Info', 'Notification settings will be implemented soon')}
            />
          </Card>
        </List.Section>
        
        {/* Admin Section */}
        {profile?.role === 'admin' && (
          <List.Section>
            <List.Subheader>Administration</List.Subheader>
            <Card style={styles.menuCard}>
              <List.Item
                title="Admin Dashboard"
                description="Access administrator controls"
                left={props => <List.Icon {...props} icon="shield-account" color="#6B4423" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => navigation.navigate('Admin' as never)}
              />
            </Card>
          </List.Section>
        )}
        
        {/* Support Section */}
        <List.Section>
          <List.Subheader>Support & About</List.Subheader>
          <Card style={styles.menuCard}>
            <List.Item
              title="Help Center"
              description="Get support and FAQs"
              left={props => <List.Icon {...props} icon="help-circle" color="#6B4423" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Info', 'Help center will be implemented soon')}
            />
            <Divider />
            <List.Item
              title="About Bagozza"
              description="Learn more about our app"
              left={props => <List.Icon {...props} icon="information" color="#6B4423" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Info', 'About page will be implemented soon')}
            />
          </Card>
        </List.Section>
        
        {/* Logout Button */}
        <Button 
          mode="outlined" 
          icon="logout" 
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={{ color: '#DC3545' }}
        >
          Logout
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButton: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#6B4423',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#6B4423',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  plan: {
    marginTop: 4,
    color: '#6B4423',
    fontWeight: 'bold',
  },
  menuCard: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 24,
    borderColor: '#DC3545',
  },
  editButton: {
    backgroundColor: '#6B4423',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default AccountPage;