import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Layout/Navbar';

const HomePage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Добро пожаловать в Bagozza</Text>
          <Text style={styles.heroSubtitle}>
            Эксклюзивные сумки ручной работы
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Products' as never)}
            style={styles.heroButton}
            labelStyle={{ color: 'white' }}
          >
            Перейти в магазин
          </Button>
        </View>

        {/* Featured Products */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Популярные товары</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} style={styles.productCard} onPress={() => navigation.navigate('ProductDetail', { id: item.toString() } as never)}>
                <Card.Cover source={require('../../assets/icon.png')} style={styles.cardImage} />
                <Card.Content>
                  <Title style={styles.cardTitle}>Сумка {item}</Title>
                  <Paragraph style={styles.cardPrice}>250,000 UZS</Paragraph>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Категории</Text>
          <View style={styles.categoriesContainer}>
            {['Сумки', 'Рюкзаки', 'Кошельки', 'Аксессуары'].map((category) => (
              <TouchableOpacity key={category} style={styles.categoryItem}>
                <View style={styles.categoryCircle}>
                  <Text style={styles.categoryInitial}>{category[0]}</Text>
                </View>
                <Text style={styles.categoryName}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>О нас</Text>
          <Text style={styles.aboutText}>
            Bagozza - бренд эксклюзивных сумок ручной работы. Мы создаем уникальные изделия, сочетающие в себе качество, стиль и индивидуальность.
          </Text>
          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.aboutButton}
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
  heroSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FCEDD9',
    paddingBottom: 30,
  },
  heroImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6B4423',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    color: '#6B4423',
  },
  heroButton: {
    marginTop: 20,
    backgroundColor: '#6B4423',
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6B4423',
  },
  horizontalScroll: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  productCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: 'white',
  },
  cardImage: {
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  cardTitle: {
    fontSize: 16,
  },
  cardPrice: {
    color: '#6B4423',
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  categoryItem: {
    width: '48%',
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCEDD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4423',
  },
  categoryName: {
    fontSize: 16,
    color: '#6B4423',
  },
  aboutSection: {
    padding: 20,
    backgroundColor: '#FCEDD9',
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6B4423',
  },
  aboutText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6B4423',
  },
  aboutButton: {
    borderColor: '#6B4423',
    borderWidth: 1,
  },
});

export default HomePage;