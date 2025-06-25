import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, Divider } from 'react-native-paper';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Layout/Navbar';
import { Avatar } from '../components/Auth';
import SupabaseDebugTest from '../components/SupabaseDebugTest';

export default function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        getProfile(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getProfile(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getProfile(session: Session) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`full_name, phone, avatar_url`)
        .eq('id', session.user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setUpdating(true);
      if (!session?.user) throw new Error('No user on the session!');
      
      const updates = {
        id: session.user.id,
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) {
        throw error;
      }
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar title="Account" showBackButton />
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!session?.user) {
    return (
      <View style={styles.container}>
        <Navbar title="Account" showBackButton />
        <View style={styles.centered}>
          <Text>Please log in to view your account</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar title="Account" showBackButton />
      
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.surface}>
          <Text variant="headlineSmall" style={styles.title}>
            Profile Settings
          </Text>
          
          <Avatar
            size={120}
            url={avatarUrl}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              // Auto-save avatar when uploaded
              updateProfile();
            }}
          />
          
          <View style={styles.inputContainer}>
            <TextInput
              label="Email"
              value={session.user.email}
              disabled
              style={styles.input}
              mode="outlined"
              outlineColor="#D5C0A7"
              activeOutlineColor="#6B4423"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              mode="outlined"
              outlineColor="#D5C0A7"
              activeOutlineColor="#6B4423"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              outlineColor="#D5C0A7"
              activeOutlineColor="#6B4423"
            />
          </View>
          
          <Button 
            mode="contained" 
            onPress={updateProfile}
            disabled={updating}
            style={styles.updateButton}
            buttonColor="#6B4423"
          >
            {updating ? 'Updating...' : 'Update Profile'}
          </Button>
          
          <Divider style={styles.divider} />
          
          <Button 
            mode="outlined" 
            onPress={signOut}
            style={styles.signOutButton}
            textColor="#6B4423"
          >
            Sign Out
          </Button>
        </Surface>
      </ScrollView>

      {/* Replace StorageTest and RegionalConnectivityTest with focused auth test */}
      <SupabaseDebugTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  surface: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6B4423',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  updateButton: {
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 4,
  },
  divider: {
    marginVertical: 10,
  },
  signOutButton: {
    marginTop: 10,
    paddingVertical: 4,
    borderColor: '#6B4423',
  },
});