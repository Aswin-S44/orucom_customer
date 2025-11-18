import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Card from '../../components/Card/Card';
import { primaryColor } from '../../constants/colors';
import {
  getAllParlours,
  getNotificationsCountByCustomerId,
  updateCustomer,
} from '../../apis/services';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import { AuthContext } from '../../context/AuthContext';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { getLocationPermission } from '../../apis/permissions';
import Geolocation from '@react-native-community/geolocation';
import { isShopOpen } from '../../utils/utils';
import FirebaseNotificationService from '../../apis/FirebaseNotificationService';
import { OFFER_CARD_IMAGE } from '../../constants/images';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [shops, setShops] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { user, userData, userId } = useContext(AuthContext);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome Back!');

  const getCurrentLocation = async () => {
    getLocationPermission().then(granted => {
      if (!granted) {
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          if (user && user.uid && userId) {
            await updateCustomer(userId, {
              coordinates: {
                latitude,
                longitude,
              },
            });
          }
        },
        error => {
          console.log('Error getting location:', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    });
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await getAllParlours();
      if (res && res.length > 0) {
        setShops(res);
      } else {
        setShops([]);
      }
    } catch (err) {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    if (user && user.uid && userId) {
      const res = await getNotificationsCountByCustomerId(userId);
      if (res) {
        setNotificationCount(res);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchShops(), fetchNotificationCount()]);
    setRefreshing(false);
  }, [user, userId]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    fetchShops();
    fetchNotificationCount();
    if (userData?.fullName) {
      setWelcomeMessage(`Hello, ${userData.fullName.split(' ')[0]}!`);
    } else if (user?.email) {
      setWelcomeMessage(`Hello, ${user.email.split('@')[0]}!`);
    } else {
      setWelcomeMessage('Welcome Back!');
    }
  }, [user?.uid, userId, userData?.fullName]);

  const services = [
    {
      id: 1,
      name: 'Haircuts',
      image: require('../../assets/images/category/1.png'),
    },
    {
      id: 2,
      name: 'Make Up',
      image: require('../../assets/images/category/2.png'),
    },
    {
      id: 3,
      name: 'Facial',
      image: require('../../assets/images/category/3.png'),
    },
    {
      id: 4,
      name: 'Massage',
      image: require('../../assets/images/category/1.png'),
    },
  ];

  const specialOffers = [
    {
      id: 1,
      title: 'Get Special Discount',
      discount: 'Up to 40%',
      description: 'All salons available | T&C Applied',
      image: require('../../assets/images/banner1.jpg'),
    },
    {
      id: 2,
      title: 'Limited Time Offer',
      discount: '25% Off',
      description: 'Selected services | Book now!',
      image: require('../../assets/images/home_bg.png'),
    },
  ];

  const eidOffer = {
    id: 1,
    discount: '30% Free',
    dateRange: 'Aug 13 - Dec 30',
    image: OFFER_CARD_IMAGE,
  };

  useEffect(() => {
    const initializeNotifications = async () => {
      if (userData) {
        try {
          FirebaseNotificationService.setupNotificationHandlers();
          const hasPermission =
            await FirebaseNotificationService.requestNotificationPermission();

          if (hasPermission && userData.uid) {
            await FirebaseNotificationService.updateFCMToken(userData?.uid);
          }
        } catch (error) {
          console.error('App initialization error:', error);
        }
      }
    };
    if (!loading) {
      initializeNotifications();
    }
  }, [loading, user, userData]);

  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Feather name="menu" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerGreeting}>{welcomeMessage}</Text>
            <Text style={styles.headerSubTitle}>Find your perfect look!</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('AllNotificationScreen')}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
            {notificationCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('SearchResultsScreen')}
          >
            <EvilIcons
              name="search"
              size={28}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search Salon, Specialist..."
              style={styles.searchInput}
              placeholderTextColor="#888"
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>#SpecialForYou</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={specialOffers}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.offerCard}>
                <Image source={item.image} style={styles.offerCardImage} />
                <View style={styles.offerContent}>
                  <View style={styles.limitedTimeTag}>
                    <Text style={styles.limitedTimeText}>Limited time!</Text>
                  </View>
                  <Text style={styles.offerTitle}>{item.title}</Text>
                  <Text style={styles.offerDiscount}>{item.discount}</Text>
                  <Text style={styles.offerDescription}>
                    {item.description}
                  </Text>
                  <TouchableOpacity style={styles.claimButton}>
                    <Text style={styles.claimButtonText}>Claim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.offerCarouselContainer}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={services}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Image source={item.image} style={styles.serviceIcon} />
                </View>
                <Text style={styles.serviceName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.servicesCarouselContainer}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Salons</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <CardSkeleton />
          ) : shops && shops.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={shops}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ParlourDetails', {
                      parlourData: item,
                    })
                  }
                  style={styles.parlourCardWrapper}
                >
                  <Card
                    image={item.profileImage}
                    title={item.parlourName}
                    location={item.address}
                    rating={item.totalRating ?? 0}
                    status={isShopOpen(item.openingHours) ? 'Open' : 'Closed'}
                    servicesOffered={item.services
                      ?.map(service => service.serviceName)
                      .join(', ')}
                    offers={item.offers}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.shopsCarouselContainer}
            />
          ) : (
            <EmptyComponent title="No shops available" />
          )}
        </View>
        <View style={styles.eidOfferSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special offers</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.eidOfferCard}>
            <View style={styles.eidOfferContent}>
              <Text style={styles.eidOfferTag}>HAIRCUT</Text>
              <Text style={styles.eidOfferDiscount}>{eidOffer.discount}</Text>
              <Text style={styles.eidOfferDate}>{eidOffer.dateRange}</Text>
              <TouchableOpacity style={styles.getOfferButton}>
                <Text style={styles.getOfferButtonText}>Get Offer Now</Text>
                <Ionicons
                  name="play-circle-outline"
                  size={20}
                  color="#333"
                  style={styles.getOfferButtonIcon}
                />
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: eidOffer.image }}
              style={styles.eidOfferImage}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'left',
    marginLeft: 40,
  },
  headerGreeting: {
    fontSize: 25,
    fontWeight: '700',
    color: primaryColor,
  },
  headerSubTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  badgeContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: primaryColor,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: '500',
  },
  eidOfferSection: {
    marginBottom: 20,
  },
  eidOfferCard: {
    backgroundColor: '#FFF7E6',
    borderRadius: 15,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eidOfferContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  eidOfferTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 5,
  },
  eidOfferDiscount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  eidOfferDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  getOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  getOfferButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  getOfferButtonIcon: {
    marginLeft: 5,
  },
  eidOfferImage: {
    width: width * 0.4,
    height: 150,
    resizeMode: 'cover',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  offerCarouselContainer: {
    paddingHorizontal: 20,
  },
  offerCard: {
    width: 300,
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    position: 'relative',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  offerCardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  offerContent: {
    padding: 15,
    justifyContent: 'space-between',
    flex: 1,
  },
  limitedTimeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  limitedTimeText: {
    fontSize: 12,
    color: '#FF6347',
    fontWeight: 'bold',
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  offerDiscount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  offerDescription: {
    fontSize: 12,
    color: '#ddd',
    marginBottom: 10,
  },
  claimButton: {
    backgroundColor: primaryColor,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  servicesCarouselContainer: {
    paddingHorizontal: 10,
  },
  serviceItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 80,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  serviceIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
    tintColor: primaryColor,
  },
  serviceName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  shopsCarouselContainer: {
    paddingHorizontal: 20,
  },
  parlourCardWrapper: {
    marginRight: 15,
  },
});

export default HomeScreen;
