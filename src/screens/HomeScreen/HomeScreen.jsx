import React, { useContext, useEffect, useState, useCallback } from 'react';
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
  ImageBackground,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Card from '../../components/Card/Card';
import { primaryColor } from '../../constants/colors';
import {
  getAllParlours,
  getNotificationsCountByCustomerId,
  updateCustomer,
  getReviews,
} from '../../apis/services';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import { AuthContext } from '../../context/AuthContext';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { getLocationPermission } from '../../apis/permissions';
import Geolocation from '@react-native-community/geolocation';
import { formattedDate, getCloudinaryUrl, isShopOpen } from '../../utils/utils';
import FirebaseNotificationService from '../../apis/FirebaseNotificationService';
import {
  DEFAULT_AVATAR,
  NO_IMAGE,
  OFFER_CARD_IMAGE,
} from '../../constants/images';
import client from '../../services/contentful';
import { BACKEND_URL, GET_ALL_SHOPS } from '../../services/apis';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, userData, userId } = useContext(AuthContext);
  const [shops, setShops] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome Back!');
  const [offers, setOffers] = useState([]);
  const [specialOffers, setSpeicalOffers] = useState([]);

  const [banner, setBanner] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);

  const eidOffer = {
    id: 1,
    discount: '33.33% Free',
    dateRange: 'Jan 01 - Feb 28',
    image: OFFER_CARD_IMAGE,
  };

  const fetchReviewsForShop = async placeId => {
    try {
      if (!placeId) return 0;
      const reviewData = await getReviews(placeId);
      return reviewData?.rating || 0;
    } catch (error) {
      return 0;
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await client.getEntries({
        content_type: 'special_offers',
      });
      if (response && response.items) {
        setOffers(response.items);
      }
    } catch (error) {
      try {
        const retryResponse = await client.getEntries({
          content_type: 'specialOffers',
        });
        if (retryResponse && retryResponse.items) {
          setOffers(retryResponse.items);
        }
      } catch (err) {
        setOffers([]);
      }
    }
  };

  const fetchSpecialOffers = async () => {
    try {
      const response = await client.getEntries({
        content_type: 'offers',
      });
      if (response && response.items) {
        setSpeicalOffers(response.items);
      }
    } catch (error) {
      setSpeicalOffers([]);
    }
  };

  const getCurrentLocation = useCallback(async () => {
    try {
      const granted = await getLocationPermission();
      if (!granted) return;

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          if (user?.uid && userId) {
            await updateCustomer(userId, {
              coordinates: { latitude, longitude },
            });
          }
        },
        error => {},
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {}
  }, [user, userId]);

  const fetchShops = async () => {
    try {
      const url = `${BACKEND_URL}/api/v1/customer/shops`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data?.shops?.length > 0) {
        const shopsWithRatings = await Promise.all(
          data.shops.map(async shop => {
            let totalRating = 0;
            if (shop.placeId) {
              totalRating = await fetchReviewsForShop(shop.placeId);
            }
            return {
              ...shop,
              totalRating,
            };
          }),
        );
        setShops(shopsWithRatings);
      } else {
        setShops([]);
      }
    } catch (error) {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchNotificationCount = async () => {
    if (userId) {
      const res = await getNotificationsCountByCustomerId(userId);
      if (res !== undefined) setNotificationCount(res);
    }
  };

  const fetchBanner = async () => {
    try {
      const bannerUrl = `${BACKEND_URL}/api/v1/admin/banners`;
      setBannerLoading(true);

      const response = await fetch(bannerUrl, {
        method: 'GET',
      });

      setBannerLoading(false);
      const bannerData = await response.json();

      if (bannerData && bannerData?.banners?.length > 0) {
        setBanner(bannerData?.banners);
      }
    } catch (err) {
      setBanner([]);
    } finally {
      setBannerLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const [offerBanner, setOfferBanner] = useState([]);
  const [offerLoading, setOfferLoading] = useState(false);

  const fetchOfferBanner = async () => {
    try {
      const offerUrl = `${BACKEND_URL}/api/v1/admin/offers`;

      setOfferLoading(true);

      const response = await fetch(offerUrl, {
        method: 'GET',
      });

      setOfferLoading(false);
      const offerData = await response.json();

      if (offerData && offerData?.offers?.length > 0) {
        setOfferBanner(offerData?.offers);
      }
    } catch (err) {
      setOfferBanner([]);
    } finally {
      setOfferLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferBanner();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchShops(),
      fetchNotificationCount(),
      fetchOffers(),
      fetchSpecialOffers(),
    ]);
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    getCurrentLocation();
    fetchOffers();
    fetchSpecialOffers();
  }, []);

  useEffect(() => {
    fetchShops();
    fetchNotificationCount();
  }, [userId]);

  useEffect(() => {
    if (userData?.fullName) {
      setWelcomeMessage(`Hello, ${userData.fullName.split(' ')[0]}!`);
    } else if (user?.email) {
      setWelcomeMessage(`Hello, ${user.email.split('@')[0]}!`);
    } else {
      setWelcomeMessage('Welcome Back!');
    }
  }, [userData?.fullName, user?.email]);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (userData?.uid) {
        try {
          FirebaseNotificationService.setupNotificationHandlers();
          const hasPermission =
            await FirebaseNotificationService.requestNotificationPermission();
          if (hasPermission) {
            await FirebaseNotificationService.updateFCMToken(userData.uid);
          }
        } catch (error) {}
      }
    };

    if (!loading) {
      initializeNotifications();
    }
  }, [loading, userData?.uid]);

  const displayDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    });
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor="#FFFBF6" barStyle="dark-content" />
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
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={styles.menuBtn}
            >
              <Feather name="menu" size={22} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerGreeting}>{welcomeMessage}</Text>
              <View style={styles.locationContainer}>
                <Ionicons
                  name="location-sharp"
                  size={12}
                  color={primaryColor}
                />
                <Text style={styles.headerSubTitle}>
                  Find your perfect look
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('AllNotificationScreen')}
          >
            <Ionicons name="notifications-outline" size={22} color="#333" />
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
            activeOpacity={0.9}
          >
            <EvilIcons name="search" size={26} color="#94A3B8" />
            <Text style={styles.searchPlaceholder}>
              Search Salon, Specialist...
            </Text>
            <View style={styles.filterIcon}>
              <Ionicons name="options-outline" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {offers?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exclusive Deals</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={banner ?? []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.95}
                  style={styles.offerCardWrapper}
                >
                  <ImageBackground
                    source={
                      item?.image
                        ? { uri: getCloudinaryUrl(item.image) }
                        : require('../../assets/images/banner1-old.jpg')
                    }
                    style={styles.offerCard}
                    imageStyle={{ borderRadius: 20 }}
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.1)', 'rgba(212, 17, 114, 0.8)']}
                      style={styles.offerGradient}
                    >
                      <View style={styles.offerContent}>
                        <View style={styles.limitedTimeTag}>
                          <Text style={styles.limitedTimeText}>
                            LIMITED OFFER
                          </Text>
                        </View>
                        <Text style={styles.offerTitle} numberOfLines={1}>
                          {item?.title ?? ''}
                        </Text>
                        <Text style={styles.offerDiscount}>UP TO 15% OFF</Text>
                        <Text style={styles.offerDescription} numberOfLines={2}>
                          {item?.offerDescription}
                        </Text>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.offerCarouselContainer}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Salons</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Explore</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <CardSkeleton />
          ) : shops && shops.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={shops}
              keyExtractor={item => item.id.toString()}
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
                    image={item?.shopImage || NO_IMAGE}
                    title={item.parlourName}
                    location={item.address}
                    rating={item?.totalRating ?? 0}
                    status={true}
                    servicesOffered={item.services?.map(s => s.name).join(', ')}
                    offers={[]}
                    placeId={item?.placeId ?? ''}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.shopsCarouselContainer}
            />
          ) : (
            <EmptyComponent title="No shops available" />
          )}
        </View>

        {offerBanner?.length > 0 && (
          <View style={styles.eidOfferSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special For You</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={offerBanner}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.eidOfferCard}
                >
                  <View style={styles.eidOfferContent}>
                    <View style={styles.serviceTag}>
                      <Text style={styles.eidOfferTag}>
                        {item?.title ?? ''}
                      </Text>
                    </View>
                    <Text style={styles.eidOfferDiscount}>
                      {item?.offer ?? ''}% OFF
                    </Text>
                    <View style={styles.dateRow}>
                      <Feather
                        name="calendar"
                        size={14}
                        color="#6B7280"
                        style={{ marginRight: 5 }}
                      />
                      <Text style={styles.eidOfferDate}>
                        {item?.fromDate ? displayDate(item.fromDate) : ''}
                        {item?.fromDate && item?.toDate ? ' - ' : ''}
                        {item?.toDate ? displayDate(item.toDate) : ''}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.claimButton}>
                      <Text style={styles.claimButtonText}>Claim Now</Text>
                    </TouchableOpacity>
                  </View>
                  <Image
                    source={{ uri: item.image ?? NO_IMAGE }}
                    style={styles.eidOfferImage}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.offerCarouselContainer}
            />
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#FFFBF6' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitleContainer: { marginLeft: 15 },
  headerGreeting: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubTitle: { fontSize: 12, color: '#64748B', marginLeft: 4 },
  notificationButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  badgeContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: primaryColor,
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: { color: '#fff', fontSize: 7, fontWeight: 'bold' },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingLeft: 15,
    paddingRight: 6,
    height: 54,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 3,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 14,
    marginLeft: 10,
  },
  filterIcon: {
    backgroundColor: primaryColor,
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: { marginBottom: 25 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  seeAllText: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: '600',
  },
  offerCarouselContainer: { paddingLeft: 20 },
  offerCardWrapper: {
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  offerCard: {
    width: width * 0.75,
    height: 180,
    overflow: 'hidden',
  },
  offerGradient: {
    flex: 1,
    padding: 18,
    justifyContent: 'flex-end',
  },
  offerContent: { width: '100%' },
  limitedTimeTag: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  limitedTimeText: { fontSize: 9, color: primaryColor, fontWeight: '800' },
  offerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  offerDiscount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  shopsCarouselContainer: { paddingLeft: 20 },
  parlourCardWrapper: { marginRight: 15 },
  eidOfferSection: { paddingBottom: 10 },
  eidOfferCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 15,
    width: width * 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  eidOfferContent: { flex: 1, padding: 18 },
  serviceTag: {
    backgroundColor: '#FFF0F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  eidOfferTag: {
    fontSize: 11,
    fontWeight: '700',
    color: primaryColor,
    textTransform: 'uppercase',
  },
  eidOfferDiscount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eidOfferDate: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  claimButton: {
    backgroundColor: primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  eidOfferImage: {
    width: 120,
    height: '100%',
    resizeMode: 'cover',
  },
});

export default HomeScreen;
