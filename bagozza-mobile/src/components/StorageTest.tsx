import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { supabase } from '../lib/supabase';

export default function StorageTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const testStorage = async () => {
    setTesting(true);
    const testResults: string[] = [];

    try {
      // Test 1: List all buckets
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        testResults.push(`❌ Storage Error: ${bucketError.message}`);
      } else {
        testResults.push(`✅ Storage Connected: Found ${buckets?.length || 0} buckets`);
        buckets?.forEach(bucket => {
          testResults.push(`  📁 Bucket: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
      }

      // Test 2: Check if avatars bucket exists
      const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
      if (avatarsBucket) {
        testResults.push('✅ Avatars bucket exists');
        
        // Test 3: Try to list files in avatars bucket
        const { data: files, error: filesError } = await supabase.storage
          .from('avatars')
          .list('', { limit: 5 });
          
        if (filesError) {
          testResults.push(`❌ Cannot list avatars: ${filesError.message}`);
        } else {
          testResults.push(`✅ Avatars accessible: ${files?.length || 0} files`);
        }
      } else {
        testResults.push('❌ Avatars bucket missing - needs to be created');
      }

    } catch (error) {
      testResults.push(`❌ Unexpected error: ${error}`);
    }

    setResults(testResults);
    setTesting(false);
    Alert.alert('Storage Test Results', testResults.join('\n'));
  };

  return (
    <Surface style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Supabase Storage Test
      </Text>
      
      <Button 
        mode="contained" 
        onPress={testStorage}
        disabled={testing}
        style={styles.button}
      >
        {testing ? 'Testing Storage...' : 'Test Storage'}
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
    fontSize: 12,
  },
});