import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  FlatList,
  Dimensions,
  ImageBackground,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import { AuthContext } from '../../context/AuthContext';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { getLocationPermission } from '../../apis/permissions';
import { getCloudinaryUrl } from '../../utils/utils';
import FirebaseNotificationService from '../../apis/FirebaseNotificationService';
import client from '../../services/contentful';
import { BACKEND_URL } from '../../services/apis';
import {
  getNotificationsCountByCustomerId,
  updateCustomer,
  getReviews,
} from '../../apis/services';
import { NO_IMAGE } from '../../constants/images';

const { width } = Dimensions.get('window');

const APP_COLORS = {
  primary: '#F05E5E',
  secondary: '#18181B',
  bg: '#FFFFFF',
  textGray: '#71717A',
  lightPink: '#FFF1F2',
  cardBg: '#F4F4F5',
};

const SERVICE_CATEGORIES = [
  { id: 'haircuts', label: 'Haircuts', icon: 'scissors', iconSet: 'feather' },
  { id: 'makeup', label: 'Make Up', icon: 'brush-outline', iconSet: 'ion' },
  { id: 'shaving', label: 'Shaving', icon: 'razor', iconSet: 'feather' },
  { id: 'massage', label: 'Massage', icon: 'hand-peace', iconSet: 'feather' },
  {
    id: 'haircolor',
    label: 'Hair',
    icon: 'color-palette-outline',
    iconSet: 'ion',
  },
];

const HomeScreen = ({ navigation }) => {
  const { user, userData, userId } = useContext(AuthContext);
  const [shops, setShops] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('New York, USA');
  const [banner, setBanner] = useState([]);

  const fetchReviewsForShop = async placeId => {
    try {
      if (!placeId) return 0;
      const reviewData = await getReviews(placeId);
      return reviewData?.rating || 0;
    } catch (error) {
      return 0;
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
        () => {},
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {}
  }, [user, userId]);

  const fetchShops = async () => {
    try {
      const url = `${BACKEND_URL}/api/v1/customer/shops`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.shops?.length > 0) {
        const shopsWithRatings = await Promise.all(
          data.shops.map(async shop => {
            let totalRating = 0;
            if (shop.placeId)
              totalRating = await fetchReviewsForShop(shop.placeId);
            return { ...shop, totalRating };
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
      const response = await fetch(bannerUrl);
      const bannerData = await response.json();
      if (bannerData && bannerData?.banners?.length > 0)
        setBanner(bannerData.banners);
    } catch (err) {
      setBanner([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchShops(), fetchNotificationCount(), fetchBanner()]);
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    getCurrentLocation();
    fetchBanner();
    fetchShops();
    fetchNotificationCount();
  }, [userId]);

  const renderServiceIcon = item => {
    if (item.label === 'Haircuts')
      return (
        <Image
          source={require('../../assets/images/bg.png')}
          style={styles.catImg}
        />
      );
    if (item.label === 'Make Up')
      return (
        <Image
          source={require('../../assets/images/bg.png')}
          style={styles.catImg}
        />
      );
    if (item.label === 'Shaving')
      return (
        <Image
          source={require('../../assets/images/bg.png')}
          style={styles.catImg}
        />
      );
    if (item.label === 'Massage')
      return (
        <Image
          source={require('../../assets/images/bg.png')}
          style={styles.catImg}
        />
      );

    return <Ionicons name={item.icon} size={24} color={APP_COLORS.primary} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Feather name="menu" size={24} color={APP_COLORS.secondary} />
          </TouchableOpacity>
          <View style={styles.locationWrapper}>
            <Text style={styles.locationLabel}>Location</Text>
            <TouchableOpacity style={styles.locationRow}>
              <Ionicons
                name="location-sharp"
                size={16}
                color={APP_COLORS.primary}
              />
              <Text style={styles.locationText}>{welcomeMessage}</Text>
              <Feather
                name="chevron-down"
                size={16}
                color={APP_COLORS.textGray}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('AllNotificationScreen')}
          >
            <Feather name="bell" size={22} color={APP_COLORS.secondary} />
            {notificationCount > 0 && <View style={styles.dot} />}
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <EvilIcons name="search" size={24} color={APP_COLORS.textGray} />
            <Text style={styles.searchPlaceholder}>
              Search Salon, Specialist...
            </Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={APP_COLORS.primary}
          />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>#SpecialForYou</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={banner.length > 0 ? banner : [1, 2]}
            keyExtractor={(_, i) => i.toString()}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={width * 0.85 + 20}
            decelerationRate="fast"
            contentContainerStyle={{ paddingLeft: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.9} style={styles.bannerCard}>
                <ImageBackground
                  source={
                    item?.image
                      ? { uri: getCloudinaryUrl(item.image) }
                      : require('../../assets/images/banner1-old.jpg')
                  }
                  style={styles.bannerImg}
                  imageStyle={{ borderRadius: 24 }}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.bannerOverlay}
                  >
                    <View style={styles.limitedTag}>
                      <Text style={styles.limitedText}>Limited time!</Text>
                    </View>
                    <Text style={styles.bannerTitle}>Get Special Discount</Text>
                    <Text style={styles.bannerSubtitle}>
                      Up to <Text style={styles.percentText}>40%</Text>
                    </Text>
                    <View style={styles.bannerFooter}>
                      <Text style={styles.bannerTnc}>
                        All Salons available | T&C Applied
                      </Text>
                      <TouchableOpacity style={styles.claimBtn}>
                        <Text style={styles.claimText}>Claim</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            )}
          />
          <View style={styles.pagination}>
            <View
              style={[
                styles.dotLine,
                { backgroundColor: APP_COLORS.primary, width: 15 },
              ]}
            />
            <View style={styles.dotLine} />
            <View style={styles.dotLine} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20 }}
          >
            {SERVICE_CATEGORIES.map(cat => (
              <View key={cat.id} style={styles.serviceItem}>
                <TouchableOpacity style={styles.serviceIcon}>
                  {renderServiceIcon(cat)}
                </TouchableOpacity>
                <Text style={styles.serviceLabel}>{cat.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Salons</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <CardSkeleton />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={shops}
              contentContainerStyle={{ paddingLeft: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.salonCard}
                  onPress={() =>
                    navigation.navigate('ParlourDetails', { parlourData: item })
                  }
                >
                  <Image
                    source={{ uri: item?.shopImage || NO_IMAGE }}
                    style={styles.salonImg}
                  />
                  <View style={styles.favBtn}>
                    <Ionicons name="heart-outline" size={20} color="#FFF" />
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFA41B" />
                    <Text style={styles.ratingText}>
                      {item.totalRating?.toFixed(1) || '4.8'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationWrapper: { flex: 1, marginLeft: 15 },
  locationLabel: { fontSize: 12, color: APP_COLORS.textGray },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.secondary,
    marginHorizontal: 5,
  },
  notifBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#F4F4F5',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 7,
    height: 7,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  searchSection: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  searchBox: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchPlaceholder: {
    color: APP_COLORS.textGray,
    marginLeft: 10,
    fontSize: 14,
  },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 12,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: { marginTop: 25 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.secondary,
  },
  seeAll: { color: '#F87171', fontSize: 13, fontWeight: '500' },
  bannerCard: { width: width * 0.85, height: 190, marginRight: 15 },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  limitedTag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  limitedText: { fontSize: 10, fontWeight: '700', color: '#18181B' },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  bannerSubtitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 10,
  },
  percentText: { fontWeight: '800', fontSize: 32 },
  bannerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTnc: { color: 'rgba(255,255,255,0.7)', fontSize: 10, flex: 1 },
  claimBtn: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  dotLine: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E4E4E7',
    marginHorizontal: 3,
  },
  serviceItem: { alignItems: 'center', marginRight: 25 },
  serviceIcon: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: APP_COLORS.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  catImg: { width: 30, height: 30, resizeMode: 'contain' },
  serviceLabel: { fontSize: 13, fontWeight: '600', color: APP_COLORS.textGray },
  salonCard: {
    width: width * 0.55,
    height: 160,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  salonImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18181B',
    marginLeft: 4,
  },
});

export default HomeScreen;
