import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Image } from 'react-native';
import { Button, Surface } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

interface AvatarProps {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

export default function Avatar({ url, size = 150, onUpload }: AvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      // First check if the file exists
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list('', { limit: 100 });
        
      if (listError) {
        console.log('Error listing files:', listError.message);
        return;
      }
      
      console.log('Available files in avatars bucket:', files);
      
      // Check if the requested file exists
      const fileExists = files?.some(file => file.name === path);
      if (!fileExists) {
        console.log(`File ${path} not found in bucket`);
        return;
      }
      
      // Get public URL for the file
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      
      if (data?.publicUrl) {
        console.log('Generated public URL:', data.publicUrl);
        setAvatarUrl(data.publicUrl);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message);
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);
      
      // First, check if avatars bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        throw new Error(`Storage error: ${bucketError.message}`);
      }
      
      const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
      if (!avatarsBucket) {
        throw new Error('Avatars storage bucket does not exist. Please create it in your Supabase dashboard.');
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 0.8, // Reduce quality for faster uploads
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.');
        return;
      }

      const image = result.assets[0];
      console.log('Got image', image);

      if (!image.uri) {
        throw new Error('No image uri!');
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `avatar-${Date.now()}.${fileExt}`; // Add prefix for better organization
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
          upsert: true, // Allow overwriting if file exists
        });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(data.path);
      Alert.alert('Success', 'Avatar uploaded successfully!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Upload Error', error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <Surface style={styles.container}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} />
      )}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={uploadAvatar}
          disabled={uploading}
          style={styles.button}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  avatar: {
    borderRadius: 75,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  image: {
    objectFit: 'cover',
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)',
    borderRadius: 75,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    paddingVertical: 4,
  },
});