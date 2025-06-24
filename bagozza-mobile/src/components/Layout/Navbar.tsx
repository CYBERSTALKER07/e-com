import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

interface NavbarProps {
  title?: string;
  showBackButton?: boolean;
  showCart?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  title = 'Bagozza', 
  showBackButton = false,
  showCart = true
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.primary }}>
      <Appbar.Header style={styles.header}>
        {showBackButton ? (
          <Appbar.BackAction 
            color="white" 
            onPress={() => navigation.goBack()} 
          />
        ) : (
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
          
          {showCart && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Cart' as never)}
            >
              <Icon name="shopping-bag" size={24} color="white" />
              {/* Badge can be added here if cart has items */}
            </TouchableOpacity>
          )}
        </View>
      </Appbar.Header>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6B4423', // Brown color from web version
    elevation: 0,
    shadowOpacity: 0,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  },
  rightIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    paddingHorizontal: 10,
  },
});

export default Navbar;