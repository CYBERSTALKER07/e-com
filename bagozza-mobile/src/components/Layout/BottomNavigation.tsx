import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View, Text } from 'react-native';
import { BottomTabParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/Feather';

// Import screens (placeholders for now)
import HomeScreen from '../../pages/HomePage';
import ProductsScreen from '../../pages/ProductsPage';
import CartScreen from '../../pages/CartPage';
import OrdersScreen from '../../pages/OrdersPage';
import AccountScreen from '../../pages/Auth/LoginPage';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomNavigation: React.FC = () => {
  const theme = useTheme();
  const primaryColor = '#6B4423'; // Brown color from web version

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: primaryColor,
          height: 70,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        },
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: 'white',
        tabBarShowLabel: true,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 12, color: focused ? primaryColor : 'white' }}>Главная</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: 'white' }]}>
              <Icon name="home" size={20} color={focused ? primaryColor : 'white'} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 12, color: focused ? primaryColor : 'white' }}>Магазин</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: 'white' }]}>
              <Icon name="shopping-bag" size={20} color={focused ? primaryColor : 'white'} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 12, color: focused ? primaryColor : 'white' }}>Избранное</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: 'white' }]}>
              <Icon name="heart" size={20} color={focused ? primaryColor : 'white'} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 12, color: focused ? primaryColor : 'white' }}>Заказы</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: 'white' }]}>
              <Icon name="clock" size={20} color={focused ? primaryColor : 'white'} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 12, color: focused ? primaryColor : 'white' }}>Войти</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: 'white' }]}>
              <Icon name="user" size={20} color={focused ? primaryColor : 'white'} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    padding: 8,
    borderRadius: 50,
  },
});

export default BottomNavigation;