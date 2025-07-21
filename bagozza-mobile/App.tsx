import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Import context providers
import { AuthProvider } from './src/context/AuthContext';
import { StoreProvider } from './src/context/StoreContext';
import { CartProvider } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';

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

// Import BLENIN splash screen
import BleninSplashScreen from './src/components/UI/SplashScreen';

// Prevent splash screen from auto-hiding until app is ready
SplashScreen.preventAutoHideAsync();

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
  // Manage splash visibility
  const [appIsReady, setAppIsReady] = useState(false);
  const [showBleninSplash, setShowBleninSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // ...load any assets, fonts, or data here if needed...
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && !showBleninSplash) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, showBleninSplash]);

  const handleBleninSplashFinish = () => {
    setShowBleninSplash(false);
  };

  if (!appIsReady) {
    return null;
  }

  if (showBleninSplash) {
    return <BleninSplashScreen onFinish={handleBleninSplashFinish} duration={3000} />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <StoreProvider>
              <CartProvider>
                <OrderProvider>
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
                </OrderProvider>
              </CartProvider>
            </StoreProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </View>
  );
}
