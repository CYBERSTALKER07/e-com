import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';

const Stack = createNativeStackNavigator();

// Create Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function HomeScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <View className="items-center mb-8">
        <ShoppingBag size={48} color="#6B4423" />
        <Text className="text-2xl font-bold mt-4 text-gray-900">Welcome to Bagozza</Text>
        <Text className="text-base text-gray-600 text-center mt-2">
          Discover premium fashion at your fingertips
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('Products')}
        className="bg-[#6B4423] px-8 py-3 rounded-full w-full max-w-xs"
      >
        <Text className="text-white text-center font-medium">Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          headerTintColor: '#6B4423',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
