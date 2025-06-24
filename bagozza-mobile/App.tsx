import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Import navigation types
import { RootStackParamList } from './src/types/navigation';

// Import main bottom navigation
import BottomNavigation from './src/components/Layout/BottomNavigation';

// Import individual screens for stack navigation
import ProductDetailPage from './src/pages/Products/ProductDetailPage';
import CheckoutPage from './src/pages/CheckoutPage';
import OrderDetailPage from './src/pages/Orders/OrderDetailPage';
import LoginPage from './src/pages/Auth/LoginPage';
import RegisterPage from './src/pages/Auth/RegisterPage';
import AdminPage from './src/pages/Admin/AdminPage';
import PaymentCompletePage from './src/pages/PaymentCompletePage';

// Configure theme to match web version
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6B4423', // Brown color from web version
    accent: '#FCEDD9',  // Light beige accent color
    background: '#FFFFFF', // White background
  },
};

// Create stack navigator
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
            {/* Main tabbed navigation */}
            <Stack.Screen name="Main" component={BottomNavigation} />
            
            {/* Other screens */}
            <Stack.Screen name="ProductDetail" component={ProductDetailPage} />
            <Stack.Screen name="Checkout" component={CheckoutPage} />
            <Stack.Screen name="OrderDetail" component={OrderDetailPage} />
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
            <Stack.Screen name="Admin" component={AdminPage} />
            <Stack.Screen name="PaymentComplete" component={PaymentCompletePage} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
