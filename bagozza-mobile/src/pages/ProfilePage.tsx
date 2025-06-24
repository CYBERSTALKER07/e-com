import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Avatar, Divider, List, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
  const navigation = useNavigation();
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const handleUpdateProfile = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone || null,
      });

      if (error) {
        throw error;
      }

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (!user || !profile) {
    navigation.navigate('Login' as never);
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#6B4423" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={profile.full_name.substring(0, 2).toUpperCase()}
            color="#fff"
            style={styles.avatar}
          />
          <Text style={styles.userName}>{profile.full_name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
          {isAdmin && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Admin</Text>
            </View>
          )}
        </View>

        {isEditing ? (
          <View style={styles.formContainer}>
            <TextInput
              label="Full Name"
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              style={styles.input}
            />
            <TextInput
              label="Phone Number"
              value={formData.phone || ''}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleUpdateProfile}
                loading={isLoading}
                disabled={isLoading}
                style={styles.saveButton}
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoSection}>
              <List.Item
                title="Full Name"
                description={profile.full_name}
                left={props => <List.Icon {...props} icon="account" />}
              />
              <Divider />
              <List.Item
                title="Email"
                description={profile.email}
                left={props => <List.Icon {...props} icon="email" />}
              />
              <Divider />
              <List.Item
                title="Phone"
                description={profile.phone || 'Not set'}
                left={props => <List.Icon {...props} icon="phone" />}
              />
              <Divider />
              <List.Item
                title="Account Type"
                description={profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                left={props => <List.Icon {...props} icon="star" />}
              />
            </View>

            <Button 
              mode="contained"
              icon="account-edit"
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>

            {isAdmin && (
              <Button 
                mode="contained" 
                icon="shield-account"
                onPress={() => navigation.navigate('Admin' as never)}
                style={styles.adminButton}
              >
                Admin Dashboard
              </Button>
            )}

            <Button 
              mode="outlined"
              icon="logout"
              onPress={handleSignOut}
              style={styles.signOutButton}
            >
              Sign Out
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FCEDD9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: '#6B4423',
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#6B4423',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 24,
  },
  formContainer: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#6B4423',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#6B4423',
  },
  editButton: {
    backgroundColor: '#6B4423',
    marginBottom: 16,
  },
  adminButton: {
    backgroundColor: '#4A2D0D',
    marginBottom: 16,
  },
  signOutButton: {
    borderColor: '#FF6B6B',
    marginTop: 8,
  },
});

export default ProfilePage;