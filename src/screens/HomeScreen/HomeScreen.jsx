import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { checkLocationAccuracy } from 'react-native-permissions';

import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../components/Card/Card';
import { primaryColor, secondaryColor } from '../../constants/colors';
import {
  getAllParlours,
  getNotificationsCountByCustomerId,
  updateCustomer,
  updateUserData,
} from '../../apis/services';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import { AuthContext } from '../../context/AuthContext';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { getLocationPermission } from '../../apis/permissions';
import Geolocation from '@react-native-community/geolocation';

const HomeScreen = ({ navigation }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useContext(AuthContext);

  const getCurrentLocation = async () => {
    getLocationPermission().then(granted => {
      if (!granted) {
        console.log('Location permission denied');
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;

          if (user && user.uid) {
            await updateCustomer(user.uid, {
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

  useEffect(() => {
    const askPermission = async () => {
      getCurrentLocation();
    };
    askPermission();
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const res = await getAllParlours();

        if (res && res.length > 0) {
          setShops(res);
        }
        setShops(res);
      } catch (err) {
        console.error('Error fetching shops:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const services = [
    {
      id: 1,
      name: 'HairCare',
      icon: 'spa',
      image: require('../../assets/images/category/1.png'),
    },
    {
      id: 2,
      name: 'Makeover',
      icon: 'smile-o',
      image: require('../../assets/images/category/2.png'),
    },
    {
      id: 3,
      name: 'Skin Care',
      icon: 'female',
      image: require('../../assets/images/category/3.png'),
    },
    {
      id: 4,
      name: 'Facial',
      icon: 'scissors',
      image: require('../../assets/images/category/4.png'),
    },
  ];

  useEffect(() => {
    if (user && user.uid) {
      const fetchNotificationCount = async () => {
        const res = await getNotificationsCountByCustomerId(user.uid);
        if (res) {
          setNotificationCount(res);
        }
      };
      fetchNotificationCount();
    }
  }, [user]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />

      <View style={styles.bannerContainer}>
        <Image
          source={require('../../../images/home_bg.png')}
          style={styles.bannerImage}
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.hamburgerIconContainer}
          >
            <View style={[styles.hamburgerLine, { width: 30 }]} />
            <View style={[styles.hamburgerLine, { width: 25 }]} />
            <View style={[styles.hamburgerLine, { width: 30 }]} />
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                width: 35,
                height: 35,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
              onPress={() => navigation.navigate('AllNotificationScreen')}
            >
              <Ionicons
                name="notifications-outline"
                size={25}
                color={primaryColor}
              />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Beauty Parlour</Text>
          <Text style={styles.bannerSubtitle}>Beauty Parlour Booking App</Text>
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('SearchResultsScreen')}
          >
            <TextInput
              placeholder="Spa, Facial, Makeup"
              style={styles.searchInput}
              placeholderTextColor="#888"
              editable={false}
              pointerEvents="none"
            />
            <EvilIcons
              name="search"
              size={32}
              color="#888"
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.servicesContainer}>
            {services.map(service => (
              <View key={service.id}>
                <TouchableOpacity style={styles.serviceCard}>
                  <Image source={service.image} style={styles.smallImage} />
                </TouchableOpacity>
                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Beauty Parlour</Text>
        {loading ? (
          <CardSkeleton />
        ) : !loading && shops.length == 0 ? (
          <>
            <EmptyComponent title="No shops available" />
          </>
        ) : (
          shops &&
          shops.length > 0 &&
          shops.map((shop, index) => (
            <View style={styles.featuredContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {loading ? (
                  <View>
                    <CardSkeleton />
                  </View>
                ) : !loading && shops.length == 0 ? (
                  <>
                    <EmptyComponent title="No shops available" />
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        navigation.navigate('ParlourDetails', {
                          parlourData: shop,
                        })
                      }
                    >
                      <Card
                        image={shop.profileImage}
                        title={shop.parlourName}
                        location={shop.address}
                        rating={shop.totalRating ?? 0}
                        status={shop.status ?? 'closed'}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          ))
        )}
      </View>
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <View style={styles.featuredContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredSection.map((feature, index) => (
              <View key={index}>
                <Card
                  image={feature.image}
                  title={feature.serviceName}
                  location={feature.location}
                  rating={feature.rating}
                  status={feature.status}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bannerContainer: {
    position: 'relative',
    height: 280,
    marginBottom: 40,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -3,
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
  smallImage: {
    height: 30,
    width: 30,
  },
  bannerTextContainer: {
    position: 'absolute',
    top: 140,
    left: 23,
    right: 15,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '400',
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 16,
  },
  searchContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
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
    width: '85%',
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
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
    left: 10,
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  serviceCard: {
    width: 72,
    alignItems: 'center',
    marginRight: 10,
    padding: 10,
    height: 72,
    backgroundColor: secondaryColor,
    borderRadius: 50,
    justifyContent: 'center',
  },

  serviceName: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  featuredContainer: {
    flexDirection: 'row',
  },
  hamburgerIconContainer: {
    padding: 5,
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginVertical: 3,
  },
});

export default HomeScreen;
