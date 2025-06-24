import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Button, Chip, Divider, Badge, IconButton } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Navbar from '../../components/Layout/Navbar';
import { RootStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

type ProductDetailRouteProps = RouteProp<RootStackParamList, 'ProductDetail'>;

// Sample product images URLs
const productImages = [
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=870&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1575891602078-8e9548bb0f51?q=80&w=387&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=871&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=870&auto=format&fit=crop',
];

// Mock product data
const mockProduct = {
  id: '1',
  name: 'Кожаная сумка Bagozza Premium',
  price: 250000,
  discountPrice: 220000,
  description: 'Элегантная кожаная сумка ручной работы из высококачественной кожи. Идеальный выбор для повседневного использования или особых случаев. Имеет удобные ручки и регулируемый плечевой ремень.',
  longDescription: 'Эта сумка создана для тех, кто ценит качество и стиль. Изготовлена из натуральной кожи высшего качества с тщательной обработкой каждого шва. Благодаря сочетанию классического дизайна и современных деталей, она идеально подойдет как для делового образа, так и для повседневного использования. Внутри имеется несколько отделений для удобного хранения ваших вещей.',
  images: productImages,
  availableColors: ['#6B4423', '#000000', '#D3A27F'],
  features: [
    'Натуральная кожа',
    'Ручная работа',
    'Водонепроницаемая подкладка',
    'Металлическая фурнитура',
    'Внутренний карман на молнии'
  ],
  specifications: [
    { name: 'Материал', value: 'Натуральная кожа' },
    { name: 'Размер', value: '30 x 20 x 10 см' },
    { name: 'Вес', value: '0.8 кг' },
    { name: 'Произведено', value: 'Узбекистан' }
  ],
  rating: 4.5,
  reviewCount: 24,
  inStock: true,
  category: 'Сумки',
  relatedProducts: [2, 3, 4]
};

const relatedProductImages = [
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=876&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1585488433867-8eb4efb6fd70?q=80&w=870&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549639449-74dfcbc259c4?q=80&w=987&auto=format&fit=crop',
];

const ProductDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailRouteProps>();
  const { id } = route.params;
  const imagesRef = useRef<FlatList>(null);
  
  // In a real app, you would fetch product data based on the ID
  const product = mockProduct;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.availableColors[0]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' UZS';
  };
  
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  
  const addToCart = () => {
    // In a real app, this would add to cart context
    navigation.navigate('Cart' as never);
  };

  const handleImageChange = (index: number) => {
    setSelectedImageIndex(index);
    imagesRef.current?.scrollToOffset({ 
      offset: index * width, 
      animated: true 
    });
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    if (currentIndex !== selectedImageIndex) {
      setSelectedImageIndex(currentIndex);
    }
  };

  const renderImageItem = ({ item }: { item: string }) => (
    <Image
      source={{ uri: item }}
      style={styles.mainImage}
      resizeMode="cover"
    />
  );

  const calculateDiscount = () => {
    if (product.discountPrice && product.price) {
      const discount = ((product.price - product.discountPrice) / product.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      <Navbar title="Детали товара" showBackButton />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main product images carousel */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={imagesRef}
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            renderItem={renderImageItem}
            keyExtractor={(_, index) => index.toString()}
          />
          
          <View style={styles.imageIndicators}>
            {product.images.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.imageIndicator,
                  index === selectedImageIndex && styles.activeImageIndicator
                ]}
              />
            ))}
          </View>
          
          {product.discountPrice && (
            <Badge style={styles.discountBadge}>
              -{calculateDiscount()}%
            </Badge>
          )}
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Icon 
              name={isFavorite ? "heart" : "heart"} 
              size={24} 
              color={isFavorite ? "#FF6B6B" : "#FF6B6B"} 
              solid={isFavorite}
            />
          </TouchableOpacity>
        </View>
        
        {/* Thumbnail images */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.thumbnailContainer}
        >
          {product.images.map((image, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => handleImageChange(index)}
              style={[
                styles.thumbnailWrapper,
                selectedImageIndex === index && styles.selectedThumbnail
              ]}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Product details */}
        <View style={styles.detailsContainer}>
          {/* Category */}
          <Chip style={styles.categoryChip}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </Chip>
          
          {/* Title and price */}
          <Text style={styles.productName}>{product.name}</Text>
          
          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon 
                  key={star} 
                  name="star" 
                  size={16} 
                  color={star <= Math.round(product.rating) ? "#FFC107" : "#E0E0E0"} 
                  style={{ marginRight: 3 }}
                />
              ))}
              <Text style={styles.ratingText}>{product.rating} ({product.reviewCount} отзывов)</Text>
            </View>
            <View style={styles.stockIndicator}>
              <View 
                style={[
                  styles.stockDot, 
                  { backgroundColor: product.inStock ? '#28A745' : '#DC3545' }
                ]} 
              />
              <Text style={styles.stockText}>
                {product.inStock ? 'В наличии' : 'Нет в наличии'}
              </Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{formatPrice(product.discountPrice || product.price)}</Text>
            {product.discountPrice && (
              <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Color Selection */}
          <Text style={styles.colorTitle}>Цвет</Text>
          <View style={styles.colorsContainer}>
            {product.availableColors.map((color, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorCircle
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
          
          {/* Description */}
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.descriptionText}>
            {showFullDescription ? product.longDescription : product.description}
          </Text>
          <TouchableOpacity 
            style={styles.readMoreButton} 
            onPress={() => setShowFullDescription(!showFullDescription)}
          >
            <Text style={styles.readMoreText}>
              {showFullDescription ? "Скрыть" : "Читать далее"}
            </Text>
            <Icon 
              name={showFullDescription ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#6B4423" 
            />
          </TouchableOpacity>
          
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
          
          {/* Specifications */}
          <View style={styles.specificationsContainer}>
            {product.specifications.map((spec, index) => (
              <View key={index} style={styles.specificationRow}>
                <Text style={styles.specName}>{spec.name}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
          
          {/* Related Products */}
          <Text style={styles.sectionTitle}>Похожие товары</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedProductsContainer}
          >
            {relatedProductImages.map((image, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.relatedProductCard}
                onPress={() => navigation.navigate('ProductDetail', { id: (index + 2).toString() } as never)}
              >
                <Image 
                  source={{ uri: image }} 
                  style={styles.relatedProductImage} 
                />
                <View style={styles.relatedProductInfo}>
                  <Text style={styles.relatedProductName} numberOfLines={1}>
                    Сумка Elegance {index + 2}
                  </Text>
                  <Text style={styles.relatedProductPrice}>
                    {formatPrice(240000 + index * 10000)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
          icon="shopping"
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
  imageContainer: {
    position: 'relative',
    width: width,
    height: 350,
  },
  mainImage: {
    width: width,
    height: 350,
    backgroundColor: '#F5F5F5',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  activeImageIndicator: {
    backgroundColor: 'white',
    width: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#FF6B6B',
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  thumbnailContainer: {
    padding: 15,
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
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  categoryText: {
    color: '#6B4423',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#777',
    marginLeft: 5,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  stockText: {
    color: '#555',
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4423',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  colorTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  colorsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedColorCircle: {
    borderWidth: 2,
    borderColor: '#6B4423',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
    color: '#333333',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  readMoreText: {
    color: '#6B4423',
    fontWeight: '500',
    marginRight: 5,
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
  specificationsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  specName: {
    color: '#777777',
  },
  specValue: {
    fontWeight: '500',
    color: '#333333',
  },
  relatedProductsContainer: {
    paddingBottom: 20,
  },
  relatedProductCard: {
    width: 130,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    overflow: 'hidden',
  },
  relatedProductImage: {
    width: '100%',
    height: 100,
  },
  relatedProductInfo: {
    padding: 8,
  },
  relatedProductName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  relatedProductPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B4423',
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
    width: 40,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#6B4423',
    justifyContent: 'center',
    borderRadius: 5,
  },
});

export default ProductDetailPage;