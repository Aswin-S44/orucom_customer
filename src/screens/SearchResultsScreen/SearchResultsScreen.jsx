import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { primaryColor } from '../../constants/colors';
import { NO_IMAGE } from '../../constants/images';
import Loader from '../../components/Loader/Loader';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { AuthContext } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton';
import LocationPrompt from '../../components/LocationPrompt/LocationPrompt';
import SearchPrompt from '../../components/SearchPrompt/SearchPrompt';

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

const searchAllParloursAndServices = async searchTerm => {
  try {
    const shopsSnapshot = await firestore()
      .collection('shop-owners')
      .where('isOnboarded', '==', true)
      .where('profileCompleted', '==', true)
      .get();

    const allShops = shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const shopUids = allShops.map(shop => shop.uid);

    const [servicesSnapshot, offersSnapshot, expertsSnapshot] =
      await Promise.all([
        firestore()
          .collection('services')
          .where('shopId', 'in', shopUids)
          .get(),
        firestore().collection('offers').where('shopId', 'in', shopUids).get(),
        firestore()
          .collection('beauty_experts')
          .where('shopId', 'in', shopUids)
          .get(),
      ]);

    const allServices = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    const allOffers = offersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    const allExperts = expertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const enrichedShops = allShops.map(shop => ({
      ...shop,
      services: allServices.filter(s => s.shopId === shop.uid),
      offers: allOffers.filter(o => o.shopId === shop.uid),
      experts: allExperts.filter(e => e.shopId === shop.uid),
    }));

    if (!searchTerm) {
      return enrichedShops;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return enrichedShops.filter(shop => {
      const nameMatch =
        shop.parlourName &&
        shop.parlourName.toLowerCase().includes(lowerCaseSearchTerm);

      const serviceMatch = shop.services.some(
        service =>
          service.serviceName &&
          service.serviceName.toLowerCase().includes(lowerCaseSearchTerm),
      );

      return nameMatch || serviceMatch;
    });
  } catch (error) {
    console.error('Search all parlours and services error:', error);
    throw error;
  }
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
        </View>
        <Text style={styles.about}>
          {item.about?.length > 25
            ? `${item.about.slice(0, 50)}...`
            : item.about}
        </Text>

        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              name={
                i < Math.floor(item.totalRating)
                  ? 'star'
                  : i < item.totalRating
                  ? 'star-half-full'
                  : 'star-outline'
              }
              size={16}
              color="#FFD700"
            />
          ))}
          <Text style={styles.totalRating}>({item.totalRating ?? 0})</Text>
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
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const { userData } = useContext(AuthContext);

  const debouncedSearch = useCallback(
    debounce(term => {
      performSearch(term);
    }, 500),
    [],
  );

  useEffect(() => {
    setLoading(true);
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const performSearch = async term => {
    try {
      const results = await searchAllParloursAndServices(term);
      setSearchResults(results);
      setSearchCount(results.length);
    } catch (error) {
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
        <View style={styles.searchBox}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Spa, Facial, Makeup"
              style={styles.searchInput}
              placeholderTextColor="#888"
              onChangeText={setSearchTerm}
              value={searchTerm}
              onSubmitEditing={handleSearchSubmit}
            />
            <EvilIcons
              name="search"
              size={32}
              color={primaryColor}
              style={styles.searchIcon}
            />
          </View>
        </View>

        <Text style={styles.searchTitle}>
          Show Search Result ({searchCount})
        </Text>

        {loading ? (
          <SearchPrompt title="Searching shops" fileName="Searching.json" />
        ) : searchResults?.length === 0 ? (
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
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#0D0618' },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontSize: 18, marginLeft: 5, fontWeight: '500' },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#160B26',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
    letterSpacing: 0.2,
  },
  searchBox: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    height: 52,
    width: '100%',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 10,
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 5,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
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
    fontWeight: '700',
    color: '#160B26',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalDistance: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 2,
  },
  about: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalRating: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#D41172',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default SearchResultsScreen;
