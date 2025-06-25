import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { supabase } from '../lib/supabase';

export default function SupabaseDebugTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const testSupabaseAuth = async () => {
    setTesting(true);
    const testResults: string[] = [];

    try {
      // Test 1: Check Supabase client configuration
      testResults.push('📱 Testing mobile Supabase configuration...');
      
      // Test 2: Simple auth test (sign up)
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'test123456';
      
      testResults.push(`🔑 Testing signup with: ${testEmail}`);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      if (signUpError) {
        testResults.push(`❌ Signup failed: ${signUpError.message}`);
      } else {
        testResults.push(`✅ Signup successful: ${signUpData.user?.id}`);
      }
      
      // Test 3: Try to sign in
      testResults.push(`🔑 Testing signin with same credentials...`);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        testResults.push(`❌ Signin failed: ${signInError.message}`);
      } else {
        testResults.push(`✅ Signin successful: ${signInData.user?.id}`);
        
        // Test 4: Try database query
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
          
        if (profileError) {
          testResults.push(`❌ Database query failed: ${profileError.message}`);
        } else {
          testResults.push(`✅ Database accessible: ${profileData?.length || 0} records`);
        }
        
        // Clean up - sign out
        await supabase.auth.signOut();
        testResults.push(`🔄 Signed out test user`);
      }
      
    } catch (error) {
      testResults.push(`❌ Unexpected error: ${error}`);
    }

    setResults(testResults);
    setTesting(false);
    
    Alert.alert(
      'Mobile Supabase Test Results',
      testResults.join('\n'),
      [{ text: 'OK' }]
    );
  };

  return (
    <Surface style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        📱 Mobile Supabase Auth Test
      </Text>
      
      <Button 
        mode="contained" 
        onPress={testSupabaseAuth}
        disabled={testing}
        style={styles.button}
      >
        {testing ? 'Testing...' : 'Test Mobile Auth'}
      </Button>
      
      {results.length > 0 && (
        <View style={styles.results}>
          {results.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginBottom: 20,
  },
  results: {
    marginTop: 10,
  },
  resultText: {
    marginBottom: 4,
    fontSize: 12,
  },
});