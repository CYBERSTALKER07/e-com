import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';

export default function NetworkTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const testConnectivity = async () => {
    setTesting(true);
    const testResults: string[] = [];

    // Test 1: Basic internet connectivity
    try {
      const response = await fetch('https://httpbin.org/get', { method: 'GET' });
      if (response.ok) {
        testResults.push('✅ Basic Internet: Connected');
      } else {
        testResults.push('❌ Basic Internet: Failed');
      }
    } catch (error) {
      testResults.push('❌ Basic Internet: No connection');
    }

    // Test 2: Supabase connectivity
    try {
      const response = await fetch('https://bcblhwcluxpxypvomjcr.supabase.co/rest/v1/', {
        headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTgxMTAsImV4cCI6MjA2NTQzNDExMH0.g5N0TehPhk2MFNx1J7u2gVjmKZGDo-3wFlzV64-xUik' }
      });
      if (response.ok) {
        testResults.push('✅ Supabase: Reachable');
      } else {
        testResults.push('❌ Supabase: Not reachable');
      }
    } catch (error) {
      testResults.push('❌ Supabase: Connection failed');
    }

    // Test 3: Google (reliable external service)
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD' });
      if (response.ok) {
        testResults.push('✅ Google: Reachable');
      } else {
        testResults.push('❌ Google: Not reachable');
      }
    } catch (error) {
      testResults.push('❌ Google: Connection failed');
    }

    setResults(testResults);
    setTesting(false);
    
    Alert.alert('Network Test Results', testResults.join('\n'));
  };

  return (
    <Surface style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Network Connectivity Test
      </Text>
      
      <Button 
        mode="contained" 
        onPress={testConnectivity}
        disabled={testing}
        style={styles.button}
      >
        {testing ? 'Testing...' : 'Test Network'}
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
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});