import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { BottomTabParamList } from '../../types/navigation';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../hooks/useAuth';

// Import screens
import HomeScreen from '../../pages/HomePage';
import ProductsScreen from '../../pages/ProductsPage';
import CartScreen from '../../pages/CartPage';
import OrdersScreen from '../../pages/OrdersPage';
import AccountScreen from '../../pages/AccountPage';
import StoreManagementPage from '../../pages/StoreManagementPage';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Custom tab bar component for the center button effect
const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const primaryColor = '#6B4423'; // Brown color
  const accentColor = '#FCEDD9'; // Light beige accent color

  // Animation values for tab buttons (focus state)
  const tabAnimations = useRef(state.routes.map(() => new Animated.Value(0))).current;
  // Press-and-hold animations for each tab (scale effect)
  const pressAnimations = useRef(state.routes.map(() => new Animated.Value(1))).current;

  // Handlers for press-in and press-out on Cart
  const handlePressIn = (index: number) => {
    // Apply press scale to any non-focused tab
    if (state.index !== index) {
      Animated.spring(pressAnimations[index], { toValue: 1.2, useNativeDriver: true }).start();
    }
  };
  const handlePressOut = (index: number) => {
    // Reset press scale for non-focused tabs
    if (state.index !== index) {
      Animated.spring(pressAnimations[index], { toValue: 1, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    // Animate the focused tab
    Animated.parallel(
      state.routes.map((route, index) => {
        return Animated.timing(tabAnimations[index], {
          toValue: index === state.index ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        });
      })
    ).start();
  }, [state.index, state.routes, tabAnimations]);
  
  return (
    <View style={[
      styles.tabBarContainer,
      { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        
        const isFocused = state.index === index;
        
        // Animation values
        const scale = tabAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1.1],
        });

        // Only treat Cart as center button when it is active
        const isCenter = index === 2 && isFocused;
        
        // This will be the icon name based on route
        let iconName: string;
        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Products':
            iconName = 'shopping-bag';
            break;
          case 'Cart':
            iconName = 'shopping-cart';
            break;
          case 'Orders':
            iconName = 'clock';
            break;
          case 'Store':
            iconName = 'store';
            break;
          case 'Account':
            iconName = 'user';
            break;
          default:
            iconName = 'circle';
        }
        
        // Special label for Cart to show "Корзина" instead of "Избранное"
        const displayLabel = route.name === 'Cart' 
          ? 'Корзина' 
          : typeof label === 'string' ? label : 'Главная';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onPressIn={() => handlePressIn(index)}
            onPressOut={() => handlePressOut(index)}
            style={[
              styles.tabButton,
              isCenter && styles.centerTabButton
            ]}
          >
            {isCenter ? (
              <View style={styles.centerButtonContainer}>
                <Animated.View 
                  style={[
                    styles.centerIconContainer,
                    { transform: [{ scale }, { scale: pressAnimations[index] }] }
                  ]}
                >
                  <Icon name={iconName} size={24} color="white" />
                </Animated.View>
                <Text style={styles.centerButtonLabel}>{displayLabel}</Text>
              </View>
            ) : (
              <Animated.View 
                style={[
                  styles.tabContent, 
                  { transform: [{ scale }, { scale: pressAnimations[index] }] }
                ]}
              >
                <View style={[
                  styles.iconContainer, 
                  isFocused && { backgroundColor: 'white' }
                ]}>
                  <Icon 
                    name={iconName} 
                    size={20} 
                    color={isFocused ? primaryColor : 'white'} 
                  />
                  
                  {/* Badge for cart item if needed */}
                  {route.name === 'Cart' && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>2</Text>
                    </View>
                  )}
                </View>
                <Text 
                  style={[
                    styles.tabLabel, 
                    { color: isFocused ? accentColor : 'white' }
                  ]}
                >
                  {displayLabel}
                </Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const BottomNavigation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Store" component={StoreManagementPage} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#6B4423',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 75,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTabButton: {
    justifyContent: 'flex-end',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 50,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  centerIconContainer: {
    backgroundColor: '#e07832', // A contrasting accent color
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    bottom: 20,
    position: 'absolute',
  },
  centerButtonLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 25,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    right: -3,
    top: -3,
    backgroundColor: '#e07832',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default BottomNavigation;