import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Layout/Navbar';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

// Sample product images URLs (replace with your actual images)
const productImages = [
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=870&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1575891602078-8e9548bb0f51?q=80&w=387&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=871&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=870&auto=format&fit=crop'
];

const categoryImages = {
  'Сумки': 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=386&auto=format&fit=crop',
  'Рюкзаки': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=388&auto=format&fit=crop',
  'Кошельки': 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=387&auto=format&fit=crop',
  'Аксессуары': 'https://images.unsplash.com/photo-1617375407336-08783a50797d?q=80&w=387&auto=format&fit=crop'
};

const bannerImage = 'https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?q=80&w=1290&auto=format&fit=crop';

const HomePage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <ImageBackground
          source={{ uri: bannerImage }}
          style={styles.heroBanner}
          imageStyle={{ opacity: 0.85 }}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Bagozza</Text>
            <Text style={styles.heroSubtitle}>
              Эксклюзивные сумки ручной работы
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Products' as never)}
              style={styles.heroButton}
              labelStyle={{ color: 'white', fontSize: 16 }}
              icon="shopping"
            >
              Перейти в магазин
            </Button>
          </View>
        </ImageBackground>

        {/* Featured Products */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Популярные товары</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Products' as never)}
            >
              <Text style={styles.viewAllText}>Все товары</Text>
              <Icon name="arrow-right" size={16} color="#6B4423" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {[1, 2, 3, 4].map((item, index) => (
              <Card 
                key={item} 
                style={styles.productCard} 
                onPress={() => navigation.navigate('ProductDetail', { id: item.toString() } as never)}
              >
                <View style={styles.cardImageContainer}>
                  <Image source={{ uri: productImages[index] }} style={styles.cardImage} />
                  <Badge style={styles.discountBadge}>-15%</Badge>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Icon name="heart" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
                <Card.Content>
                  <Title style={styles.cardTitle}>Сумка Elegance {item}</Title>
                  <View style={styles.priceContainer}>
                    <Paragraph style={styles.cardPrice}>250,000 UZS</Paragraph>
                    <Paragraph style={styles.oldPrice}>295,000 UZS</Paragraph>
                  </View>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon 
                        key={star} 
                        name="star" 
                        size={14} 
                        color={star <= 4 ? "#FFC107" : "#E0E0E0"} 
                      />
                    ))}
                    <Text style={styles.ratingText}>(12)</Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Special Offer Banner */}
        <TouchableOpacity 
          style={styles.offerBanner}
          onPress={() => navigation.navigate('Products' as never)}
        >
          <View style={styles.offerContent}>
            <Text style={styles.offerTitle}>Специальное предложение</Text>
            <Text style={styles.offerSubtitle}>Скидка 20% на все товары</Text>
            <View style={styles.offerButton}>
              <Text style={styles.offerButtonText}>Узнать больше</Text>
              <Icon name="arrow-right" size={16} color="white" />
            </View>
          </View>
          <Image 
            source={{ uri: productImages[2] }} 
            style={styles.offerImage}
          />
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Категории</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Все категории</Text>
              <Icon name="arrow-right" size={16} color="#6B4423" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesContainer}>
            {Object.entries(categoryImages).map(([category, imageUrl]) => (
              <TouchableOpacity 
                key={category} 
                style={styles.categoryItem}
                onPress={() => navigation.navigate('Products' as never)}
              >
                <ImageBackground 
                  source={{ uri: imageUrl }} 
                  style={styles.categoryImage}
                  imageStyle={{ borderRadius: 12 }}
                >
                  <View style={styles.categoryOverlay}>
                    <Text style={styles.categoryName}>{category}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>О нас</Text>
          <Text style={styles.aboutText}>
            Bagozza - бренд эксклюзивных сумок ручной работы. Мы создаем уникальные изделия, 
            сочетающие в себе качество, стиль и индивидуальность. Каждое изделие изготавливается 
            из премиальных материалов с особым вниманием к деталям.
          </Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon name="check" size={20} color="#6B4423" />
              </View>
              <Text style={styles.featureText}>Премиальные материалы</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon name="check" size={20} color="#6B4423" />
              </View>
              <Text style={styles.featureText}>Ручная работа</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon name="check" size={20} color="#6B4423" />
              </View>
              <Text style={styles.featureText}>Индивидуальный дизайн</Text>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.aboutButton}
            icon="information"
          >
            Узнать больше
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    height: 350,
    justifyContent: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(107, 68, 35, 0.7)',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    color: 'white',
    width: '80%',
  },
  heroButton: {
    marginTop: 20,
    backgroundColor: '#6B4423',
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  sectionContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6B4423',
    marginRight: 5,
  },
  horizontalScroll: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  productCard: {
    width: 180,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 180,
    backgroundColor: '#F5F5F5',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    color: 'white',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPrice: {
    color: '#6B4423',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  oldPrice: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 5,
  },
  offerBanner: {
    flexDirection: 'row',
    backgroundColor: '#6B4423',
    borderRadius: 12,
    margin: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  offerContent: {
    flex: 3,
    padding: 15,
    justifyContent: 'center',
  },
  offerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  offerSubtitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  offerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  offerButtonText: {
    color: 'white',
    marginRight: 5,
    fontSize: 14,
  },
  offerImage: {
    flex: 2,
    height: 120,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  categoryItem: {
    width: width / 2 - 25,
    height: 120,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  aboutSection: {
    padding: 20,
    backgroundColor: '#FCEDD9',
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6B4423',
  },
  aboutText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6B4423',
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIconContainer: {
    width: 30,
    height: 30,
    backgroundColor: '#FBE9D4',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#6B4423',
  },
  aboutButton: {
    borderColor: '#6B4423',
    borderWidth: 1.5,
  },
});

export default HomePage;