import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Surface, Card } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { connectivityHelper } from '../lib/connectivity';

export default function RegionalConnectivityTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'good' | 'limited' | 'blocked'>('unknown');

  const runComprehensiveTest = async () => {
    setTesting(true);
    const testResults: string[] = [];
    
    try {
      // Test 1: Basic internet
      const internetTest = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        timeout: 8000 
      });
      testResults.push(internetTest.ok ? '✅ Internet: Connected' : '❌ Internet: Failed');
      
      // Test 2: DNS resolution
      const dnsTest = await fetch('https://8.8.8.8', { 
        method: 'HEAD',
        timeout: 5000 
      });
      testResults.push(dnsTest.ok ? '✅ DNS: Working' : '❌ DNS: Issues detected');
      
      // Test 3: Regional CDN access
      const cdnTest = await fetch('https://cdn.jsdelivr.net/npm/react@18.0.0/package.json', {
        method: 'HEAD',
        timeout: 5000
      });
      testResults.push(cdnTest.ok ? '✅ CDN: Accessible' : '❌ CDN: Blocked/Limited');
      
      // Test 4: Supabase original URL
      const originalUrl = 'https://bcblhwcluxpxypvomjcr.supabase.co';
      const supabaseOriginal = await connectivityHelper.testConnection(
        originalUrl, 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTgxMTAsImV4cCI6MjA2NTQzNDExMH0.g5N0TehPhk2MFNx1J7u2gVjmKZGDo-3wFlzV64-xUik'
      );
      testResults.push(supabaseOriginal ? '✅ Supabase Original: Reachable' : '❌ Supabase Original: Blocked');
      
      // Test 5: Alternative Supabase URLs
      const altUrl = originalUrl.replace('.supabase.co', '.supabase.com');
      const supabaseAlt = await connectivityHelper.testConnection(
        altUrl,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTgxMTAsImV4cCI6MjA2NTQzNDExMH0.g5N0TehPhk2MFNx1J7u2gVjmKZGDo-3wFlzV64-xUik'
      );
      testResults.push(supabaseAlt ? '✅ Supabase Alternative: Reachable' : '❌ Supabase Alternative: Blocked');
      
      // Test 6: Try direct Supabase client test
      try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        testResults.push(!error ? '✅ Supabase Client: Working' : `❌ Supabase Client: ${error.message}`);
      } catch (clientError) {
        testResults.push(`❌ Supabase Client: ${clientError}`);
      }
      
      // Determine connection status
      if (supabaseOriginal || supabaseAlt) {
        setConnectionStatus('good');
      } else if (internetTest.ok && cdnTest.ok) {
        setConnectionStatus('limited');
      } else {
        setConnectionStatus('blocked');
      }
      
    } catch (error) {
      testResults.push(`❌ Test failed: ${error}`);
      setConnectionStatus('blocked');
    }
    
    setResults(testResults);
    setTesting(false);
    
    // Show detailed results
    Alert.alert(
      'Regional Connectivity Results',
      testResults.join('\n') + '\n\nCheck console for detailed logs.'
    );
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'good': return '#4CAF50';
      case 'limited': return '#FF9800';
      case 'blocked': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'good': return 'Good Connection';
      case 'limited': return 'Limited Access (VPN recommended)';
      case 'blocked': return 'Connection Blocked (VPN required)';
      default: return 'Status Unknown';
    }
  };

  const recommendationsForUzbekistan = [
    '🌐 Use a reliable VPN service (ExpressVPN, NordVPN)',
    '🔧 Try changing DNS to 8.8.8.8 or 1.1.1.1',
    '📱 Switch between WiFi and mobile data',
    '⏰ Try different times of day (off-peak hours)',
    '🔄 Clear app cache and restart',
  ];

  return (
    <Surface style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        🇺🇿 Regional Connectivity Test
      </Text>
      
      <Card style={[styles.statusCard, { borderColor: getStatusColor() }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </Text>
        </Card.Content>
      </Card>
      
      <Button 
        mode="contained" 
        onPress={runComprehensiveTest}
        disabled={testing}
        style={styles.button}
      >
        {testing ? 'Testing Connection...' : 'Test Regional Connectivity'}
      </Button>
      
      {results.length > 0 && (
        <View style={styles.results}>
          <Text variant="titleSmall" style={styles.resultsTitle}>Test Results:</Text>
          {results.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </View>
      )}
      
      {connectionStatus === 'limited' || connectionStatus === 'blocked' ? (
        <Card style={styles.recommendationsCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.recommendationsTitle}>
              🛠️ Recommendations for Uzbekistan:
            </Text>
            {recommendationsForUzbekistan.map((rec, index) => (
              <Text key={index} style={styles.recommendationText}>
                {rec}
              </Text>
            ))}
          </Card.Content>
        </Card>
      ) : null}
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
  statusCard: {
    marginBottom: 16,
    borderWidth: 2,
  },
  button: {
    marginBottom: 20,
  },
  results: {
    marginTop: 10,
    marginBottom: 20,
  },
  resultsTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  resultText: {
    marginBottom: 4,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  recommendationsCard: {
    backgroundColor: '#FFF3E0',
  },
  recommendationsTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  recommendationText: {
    marginBottom: 4,
    fontSize: 13,
  },
});