import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Card, Chip, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Layout/Navbar';

// Mock data - will be replaced with actual API calls later
const mockProducts = Array(10).fill(null).map((_, index) => ({
  id: index + 1,
  title: `Сумка ${index + 1}`,
  price: 250000 + index * 10000,
  image: '../../assets/icon.png',
  category: index % 4 === 0 ? 'Сумки' : index % 4 === 1 ? 'Рюкзаки' : index % 4 === 2 ? 'Кошельки' : 'Аксессуары'
}));

const categories = ['Все', 'Сумки', 'Рюкзаки', 'Кошельки', 'Аксессуары'];

const ProductsPage = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  
  // Filter products based on search and category
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };

  return (
    <View style={styles.container}>
      <Navbar title="Магазин" />
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Поиск товаров..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === item && styles.selectedCategoryChipText
              ]}
            >
              {item}
            </Chip>
          )}
          contentContainerStyle={styles.chipContainer}
        />
      </View>

      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.productContainer} 
            onPress={() => navigation.navigate('ProductDetail', { id: item.id.toString() } as never)}
          >
            <Card style={styles.productCard}>
              <Card.Cover 
                source={require('../../assets/icon.png')} 
                style={styles.productImage}
              />
              <Card.Content>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FCEDD9',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#FFFFFF',
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  chipContainer: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryChip: {
    backgroundColor: '#6B4423',
  },
  categoryChipText: {
    color: '#6B4423',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  productsList: {
    padding: 8,
  },
  productContainer: {
    flex: 1,
    padding: 8,
  },
  productCard: {
    flex: 1,
  },
  productImage: {
    height: 150,
    backgroundColor: '#F5F5F5',
  },
  productTitle: {
    fontSize: 14,
    marginTop: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B4423',
    marginTop: 4,
  },
});

export default ProductsPage;