import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { primaryColor } from '../../constants/colors';
import { signup } from '../../apis/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // For the location icon

import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { NO_IMAGE } from '../../constants/images';
import Loader from '../../components/Loader/Loader';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { searchShops, searchShopsByService } from '../../apis/services';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const SearchItem = ({ item, navigation }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.profileImage ?? NO_IMAGE }}
        style={styles.image}
      />
      <View style={styles.detailsContainer}>
        <View style={styles.header}>
          <Text style={styles.shopName}>{item.parlourName ?? ''}</Text>
          <View style={styles.distanceContainer}>
            <Icon name="map-marker" size={16} color="#888" />
            <Text style={styles.totalDistance}>{item.totalDistance}</Text>
          </View>
        </View>
        <Text style={styles.about}>{item.about}</Text>
        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              name={
                i < Math.floor(item.rating)
                  ? 'star'
                  : i < item.rating
                  ? 'star-half-full'
                  : 'star-outline'
              }
              size={16}
              color="#FFD700"
            />
          ))}
          <Text style={styles.totalRating}>({item.totalRating})</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate('ParlourDetails', {
            parlourData: item,
          })
        }
      >
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </View>
  );
};

const SearchResultsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [error, setError] = useState('');

  const debouncedSearch = useCallback(
    debounce(term => {
      performSearch(term);
    }, 500),
    [],
  );

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm]);

  const performSearch = async term => {
    setLoading(true);
    setError('');
    try {
      let results;
      if (!term.trim()) {
        results = await searchShops('');
      } else {
        results = await searchShopsByService(term);
        if (results.length === 0) {
          results = await searchShops(term);
        }
      }

      setSearchResults(results);
      setSearchCount(results.length);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
      setSearchCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    performSearch(searchTerm);
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <View style={styles.searchBar}>
              <TextInput
                placeholder="Spa, Facial, Makeup"
                style={styles.searchInput}
                placeholderTextColor="#888"
                editable={true}
                onChangeText={setSearchTerm}
                value={searchTerm}
                onSubmitEditing={handleSearchSubmit}
              />
              <EvilIcons
                name="search"
                size={32}
                color="#888"
                style={styles.searchIcon}
              />
            </View>
          </View>
          <Text style={styles.searchTitle}>
            Show Search Result ({searchCount})
          </Text>
          <View>
            {loading ? (
              <Loader />
            ) : searchResults?.length === 0 && !loading ? (
              <EmptyComponent />
            ) : (
              <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                  <SearchItem item={item} navigation={navigation} />
                )}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: primaryColor },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontSize: 18, marginLeft: 5 },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 40,
  },
  searchBox: {
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: 50,
    width: '100%',
    paddingHorizontal: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalDistance: {
    fontSize: 12,
    color: '#888',
    marginLeft: 2,
  },
  about: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalRating: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SearchResultsScreen;
