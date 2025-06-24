import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, RefreshControl } from 'react-native';
import { Card, Chip, Searchbar, Badge, Button, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Layout/Navbar';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 25;

// Sample product images URLs (replace with your actual images)
const productImages = [
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=870&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1575891602078-8e9548bb0f51?q=80&w=387&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=871&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=870&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=876&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1585488433867-8eb4efb6fd70?q=80&w=870&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549639449-74dfcbc259c4?q=80&w=987&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559563458-c667ba5f5480?q=80&w=870&auto=format&fit=crop',
];

// Mock data - will be replaced with actual API calls later
const mockProducts = Array(10).fill(null).map((_, index) => ({
  id: index + 1,
  title: `Сумка Elegance ${index + 1}`,
  price: 250000 + index * 10000,
  discountPrice: index % 3 === 0 ? (250000 + index * 10000) * 0.85 : null,
  image: productImages[index % productImages.length],
  category: index % 4 === 0 ? 'Сумки' : index % 4 === 1 ? 'Рюкзаки' : index % 4 === 2 ? 'Кошельки' : 'Аксессуары',
  rating: 4 + (index % 2),
  reviewCount: 10 + index,
  isNew: index < 3,
  isFeatured: index % 5 === 0,
}));

const categories = ['Все', 'Сумки', 'Рюкзаки', 'Кошельки', 'Аксессуары'];
const sortOptions = [
  { label: 'Новинки', value: 'newest' },
  { label: 'Цена: по возрастанию', value: 'price_asc' },
  { label: 'Цена: по убыванию', value: 'price_desc' },
  { label: 'Популярные', value: 'popular' },
];

const ProductsPage = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [currentSort, setCurrentSort] = useState(sortOptions[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filter products based on search and category
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch(currentSort.value) {
      case 'price_asc':
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case 'price_desc':
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case 'popular':
        return (b.rating * b.reviewCount) - (a.rating * a.reviewCount);
      case 'newest':
      default:
        return a.id < b.id ? 1 : -1;
    }
  });

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };
  
  const calculateDiscount = (original, discounted) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const loadMoreProducts = () => {
    setLoading(true);
    // Simulate loading more products
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productContainer} 
      onPress={() => navigation.navigate('ProductDetail', { id: item.id.toString() } as never)}
      activeOpacity={0.7}
    >
      <Card style={styles.productCard}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {item.isNew && (
            <Badge style={[styles.badge, styles.newBadge]}>NEW</Badge>
          )}
          
          {item.discountPrice && (
            <Badge style={[styles.badge, styles.discountBadge]}>
              -{calculateDiscount(item.price, item.discountPrice)}%
            </Badge>
          )}
          
          <TouchableOpacity style={styles.favoriteButton}>
            <Icon name="heart" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon 
                key={star} 
                name="star" 
                size={12} 
                color={star <= item.rating ? "#FFC107" : "#E0E0E0"} 
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatPrice(item.discountPrice || item.price)}
            </Text>
            {item.discountPrice && (
              <Text style={styles.originalPrice}>{formatPrice(item.price)}</Text>
            )}
          </View>

          <Button 
            mode="contained" 
            icon="shopping-outline" 
            style={styles.addToCartButton}
            contentStyle={{ height: 30 }}
            labelStyle={styles.addToCartButtonLabel}
            onPress={() => {}}
          >
            В корзину
          </Button>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Navbar title="Магазин" />
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Поиск товаров..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon={() => <Icon name="search" size={20} color="#6B4423" />}
          clearIcon={() => <Icon name="x" size={20} color="#6B4423" />}
        />
      </View>

      <View style={styles.filterContainer}>
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
        
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setSortMenuVisible(true)}
            >
              <Icon name="sliders" size={16} color="#6B4423" />
              <Text style={styles.sortButtonText}>Сортировка</Text>
            </TouchableOpacity>
          }
        >
          {sortOptions.map((option, index) => (
            <React.Fragment key={option.value}>
              <Menu.Item 
                onPress={() => {
                  setCurrentSort(option);
                  setSortMenuVisible(false);
                }} 
                title={option.label}
                titleStyle={{ 
                  color: currentSort.value === option.value ? '#6B4423' : '#333'
                }}
                leadingIcon={
                  currentSort.value === option.value 
                  ? 'check' 
                  : undefined
                }
              />
              {index < sortOptions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Menu>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-bag" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>
            По вашему запросу ничего не найдено
          </Text>
          <Button 
            mode="contained" 
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory('Все');
            }}
            style={styles.resetButton}
          >
            Сбросить фильтры
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.productsList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={['#6B4423']}
            />
          }
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loading ? 
              <ActivityIndicator 
                style={styles.loader} 
                color="#6B4423" 
                size="small" 
              /> : null
          }
        />
      )}
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
    paddingBottom: 10,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chipContainer: {
    paddingHorizontal: 15,
    flex: 1,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  selectedCategoryChip: {
    backgroundColor: '#6B4423',
  },
  categoryChipText: {
    color: '#333333',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  sortButtonText: {
    color: '#6B4423',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  productsList: {
    padding: 10,
  },
  productContainer: {
    width: '50%',
    padding: 5,
  },
  productCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    height: 180,
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  newBadge: {
    backgroundColor: '#28A745',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  cardContent: {
    padding: 10,
  },
  category: {
    fontSize: 11,
    color: '#888',
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewCount: {
    fontSize: 11,
    color: '#888',
    marginLeft: 3,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B4423',
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: '#6B4423',
    borderRadius: 5,
    height: 30,
  },
  addToCartButtonLabel: {
    fontSize: 12,
    marginVertical: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    marginVertical: 20,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#6B4423',
  },
  loader: {
    marginVertical: 15,
  },
});

export default ProductsPage;