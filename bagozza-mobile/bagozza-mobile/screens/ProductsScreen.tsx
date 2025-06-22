import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Search, Filter, X } from 'lucide-react-native';
import { supabase } from '../App';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  store_id: string;
  stock_quantity: number;
}

export default function ProductsScreen({ navigation, route }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    route.params?.category || null
  );
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = ['All', 'Men', 'Women', 'Accessories'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (route.params?.category && route.params.category !== selectedCategory) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          store:store_id (
            name,
            is_active
          )
        `)
        .eq('store.is_active', true);

      if (error) throw error;

      const validProducts = data.filter(product => product.store !== null);
      setProducts(validProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 mx-2"
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-lg font-medium text-gray-900 mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-[#6B4423]">
            ${item.price.toFixed(2)}
          </Text>
          <View className="bg-[#6B4423]/10 px-3 py-1 rounded-full">
            <Text className="text-[#6B4423] text-sm font-medium">
              {item.category}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search and Filter Header */}
      <View className="bg-white p-4 shadow-sm">
        <View className="flex-row items-center space-x-4">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <Search size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full ${
              showFilters ? 'bg-[#6B4423]' : 'bg-gray-100'
            }`}
          >
            <Filter size={24} color={showFilters ? '#fff' : '#666'} />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCategory(category === 'All' ? null : category)}
                className={`mr-2 px-4 py-2 rounded-full ${
                  (category === 'All' && !selectedCategory) ||
                  category === selectedCategory
                    ? 'bg-[#6B4423]'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`${
                    (category === 'All' && !selectedCategory) ||
                    category === selectedCategory
                      ? 'text-white'
                      : 'text-gray-700'
                  } font-medium`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Products List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6B4423" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-gray-600 text-center">
            No products found. Try adjusting your search or filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
          numColumns={1}
        />
      )}
    </View>
  );
}