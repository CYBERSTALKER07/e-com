import React, { useState } from 'react';
import { Alert, View, StyleSheet, AppState } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <Surface style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to Bagozza
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={signInWithEmail} 
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={signUpWithEmail} 
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Signing up...' : 'Sign up'}
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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