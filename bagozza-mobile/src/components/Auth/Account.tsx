import React, { useState, useEffect } from 'react';
import { Alert, View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import Avatar from './Avatar';

interface AccountProps {
  session: Session;
}

export default function Account({ session }: AccountProps) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');
      
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, phone, avatar_url`)
        .eq('id', session?.user.id)
        .single();
        
      if (error && status !== 406) {
        throw error;
      }
      
      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    full_name,
    phone,
    avatar_url,
  }: {
    full_name: string;
    phone: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');
      
      const updates = {
        id: session?.user.id,
        full_name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) {
        throw error;
      }
      
      Alert.alert('Profile updated successfully!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Account
        </Text>
        
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ full_name: fullName, phone, avatar_url: url });
          }}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            label="Email"
            value={session?.user?.email}
            disabled
            style={styles.input}
            mode="outlined"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            mode="outlined"
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
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => updateProfile({ full_name: fullName, phone, avatar_url: avatarUrl })}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Loading...' : 'Update'}
          </Button>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={() => supabase.auth.signOut()}
            style={styles.button}
          >
            Sign Out
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  button: {
    paddingVertical: 4,
  },
});