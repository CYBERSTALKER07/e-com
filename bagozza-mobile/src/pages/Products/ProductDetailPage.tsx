import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Chip, Divider } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Navbar from '../../components/Layout/Navbar';
import { RootStackParamList } from '../../types/navigation';

type ProductDetailRouteProps = RouteProp<RootStackParamList, 'ProductDetail'>;

// Mock product data
const mockProduct = {
  id: '1',
  name: 'Кожаная сумка Bagozza Premium',
  price: 250000,
  discountPrice: 220000,
  description: 'Элегантная кожаная сумка ручной работы из высококачественной кожи. Идеальный выбор для повседневного использования или особых случаев. Имеет удобные ручки и регулируемый плечевой ремень.',
  images: Array(4).fill('../../assets/icon.png'),
  features: [
    'Натуральная кожа',
    'Ручная работа',
    'Водонепроницаемая подкладка',
    'Металлическая фурнитура',
    'Внутренний карман на молнии'
  ],
  inStock: true,
  category: 'Сумки'
};

const ProductDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailRouteProps>();
  const { id } = route.params;
  
  // In a real app, you would fetch product data based on the ID
  const product = mockProduct;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };
  
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  
  const addToCart = () => {
    // In a real app, this would add to cart context
    navigation.navigate('Cart' as never);
  };

  return (
    <View style={styles.container}>
      <Navbar title="Детали товара" showBackButton />
      
      <ScrollView>
        {/* Main product image */}
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.mainImage}
          resizeMode="cover"
        />
        
        {/* Thumbnail images */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.thumbnailContainer}
        >
          {product.images.map((image, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => setSelectedImageIndex(index)}
              style={[
                styles.thumbnailWrapper,
                selectedImageIndex === index && styles.selectedThumbnail
              ]}
            >
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Product details */}
        <View style={styles.detailsContainer}>
          {/* Title and price */}
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{formatPrice(product.discountPrice || product.price)}</Text>
            {product.discountPrice && (
              <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
            )}
          </View>
          
          {/* Category */}
          <Chip style={styles.categoryChip}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </Chip>
          
          <Divider style={styles.divider} />
          
          {/* Description */}
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
          
          {/* Features */}
          <Text style={styles.sectionTitle}>Характеристики</Text>
          <View style={styles.featuresList}>
            {product.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon name="check" size={16} color="#6B4423" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom action bar */}
      <View style={styles.actionContainer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={decreaseQuantity}
          >
            <Icon name="minus" size={20} color="#6B4423" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={increaseQuantity}
          >
            <Icon name="plus" size={20} color="#6B4423" />
          </TouchableOpacity>
        </View>
        
        <Button 
          mode="contained" 
          onPress={addToCart} 
          style={styles.addToCartButton}
          labelStyle={{ fontSize: 16 }}
          disabled={!product.inStock}
        >
          {product.inStock ? 'В корзину' : 'Нет в наличии'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
  },
  thumbnailContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FCEDD9',
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#6B4423',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#F5F5F5',
  },
  detailsContainer: {
    padding: 15,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4423',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    marginBottom: 15,
  },
  categoryText: {
    color: '#6B4423',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
    marginBottom: 20,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#444444',
    marginLeft: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FCEDD9',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5C0A7',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginRight: 15,
  },
  quantityButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#6B4423',
    justifyContent: 'center',
  },
});

export default ProductDetailPage;