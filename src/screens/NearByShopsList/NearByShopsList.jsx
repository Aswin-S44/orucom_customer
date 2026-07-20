import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  StatusBar,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { getReviews } from '../../apis/services';
import { AuthContext } from '../../context/AuthContext';
import { primaryColor } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import NoShopsAvailable from '../../components/NoShopsAvailable/NoShopsAvailable';
import Card from '../../components/Card/Card';
import { isShopOpen } from '../../utils/utils';
import LocationEnabler from '../../../android/app/src/LocationEnabler';
import { BACKEND_URL, GET_ALL_SHOPS } from '../../services/apis';

// import haversine from 'haversine-distance';

const NearByShopsList = ({ navigation }) => {
  const [region, setRegion] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const mapRef = useRef(null);
  const { user, userData } = useContext(AuthContext);
  const [locationStatus, setLocationStatus] = useState('Checking...');
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const toRad = val => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(1);
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

  const fitMapToMarkers = () => {
    if (!mapRef.current || !mapReady) return;

    const allMarkers = [];

    if (userLocation) {
      allMarkers.push({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
    }

    shops.forEach(shop => {
      if (shop.latitude && shop.longitude) {
        allMarkers.push({
          latitude: parseFloat(shop.latitude),
          longitude: parseFloat(shop.longitude),
        });
      }
    });

    if (allMarkers.length > 0) {
      mapRef.current.fitToCoordinates(allMarkers, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };

  const checkLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });

        const userRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        setRegion(userRegion);
        setLocationEnabled(true);

        setShops(prevShops => {
          if (!prevShops || prevShops.length === 0) return prevShops;
          const updatedShops = prevShops.map(shop => {
            const shopLat = parseFloat(shop.latitude);
            const shopLon = parseFloat(shop.longitude);

            if (shopLat && shopLon) {
              const distance = calculateDistance(
                latitude,
                longitude,
                shopLat,
                shopLon,
              );
              return {
                ...shop,
                distance: distance !== null ? distance : Infinity,
                latitude: shopLat,
                longitude: shopLon,
              };
            }
            return { ...shop, distance: Infinity };
          });

          setTimeout(() => fitMapToMarkers(), 300);
          return updatedShops;
        });
      },
      error => {
        setLocationEnabled(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );
  };

  const checkLocationStatus = async () => {
    if (Platform.OS === 'android') {
      try {
        const isEnabled = await LocationEnabler.isLocationEnabled();
        setLocationStatus(isEnabled ? 'On' : 'Off');
        if (isEnabled) setLocationEnabled(true);
      } catch (e) {
        setLocationStatus('Error');
      }
    }
  };

  const enableLocation = async () => {
    if (Platform.OS === 'android') {
      try {
        await LocationEnabler.promptForEnableLocation();
        await checkLocationStatus();
        checkLocation();
      } catch (e) {}
    }
  };

  const fetchShops = async () => {
    try {
      setLoadingShops(true);
      const url = `${BACKEND_URL}/api/v1/customer/shops`;

      const response = await fetch(url, { method: 'GET' });
      const shopsData = await response.json();

      if (shopsData?.shops?.length > 0) {
        const shopsWithRatings = await Promise.all(
          shopsData.shops.map(async shop => {
            let totalRating = 0;

            if (shop.placeId) {
              totalRating = await fetchReviewsForShop(shop.placeId);
            }

            let distance = null;
            if (userLocation && shop.latitude && shop.longitude) {
              distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                parseFloat(shop.latitude),
                parseFloat(shop.longitude),
              );
            }

            return {
              ...shop,
              totalRating,
              distance: distance || null,
              latitude: shop.latitude ? parseFloat(shop.latitude) : null,
              longitude: shop.longitude ? parseFloat(shop.longitude) : null,
            };
          }),
        );

        setShops(shopsWithRatings);
        setTimeout(() => fitMapToMarkers(), 500);
      } else {
        setShops([]);
      }
    } catch (err) {
      setShops([]);
    } finally {
      setLoadingShops(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkLocationStatus();
      await enableLocation();
    };
    init();
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setPermissionGranted(true);
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    let interval;
    if (permissionGranted) {
      checkLocation();
      interval = setInterval(() => {
        checkLocation();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [permissionGranted]);

  useEffect(() => {
    if (userLocation) {
      fetchShops();
    }
  }, [userLocation]);

  useEffect(() => {
    if (mapReady && userLocation) {
      fitMapToMarkers();
    }
  }, [mapReady, userLocation, shops]);

  if (!permissionGranted) {
    return (
      <View style={styles.center}>
        <Text>Location permission is required</Text>
      </View>
    );
  }

  if (!locationEnabled) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
        <View style={styles.center}>
          <ActivityIndicator size="small" color={primaryColor} />
          <Text style={{ marginTop: 10, color: '#666' }}>
            Waiting for location...
          </Text>
        </View>
      </View>
    );
  }

  const sortedShops = [...shops]
    .filter(shop => shop.distance !== null && shop.distance !== Infinity)
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled
        zoomControlEnabled={true}
        userLocationPriority="high"
        userLocationUpdateInterval={5000}
        loadingEnabled={true}
        loadingIndicatorColor={primaryColor}
        loadingBackgroundColor="#FFFFFF"
      >
        {shops.map(
          shop =>
            shop.latitude &&
            shop.longitude && (
              <Marker
                key={shop.id}
                coordinate={{
                  latitude: parseFloat(shop.latitude),
                  longitude: parseFloat(shop.longitude),
                }}
                title={`${shop.parlourName}`}
              />
            ),
        )}
      </MapView>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('SearchResultsScreen')}
        >
          <TextInput
            placeholder="Spa, Facial, Makeup"
            placeholderTextColor="#FFFFFF"
            style={styles.searchInput}
            editable={false}
          />
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardListContainer}>
        {loadingShops ? (
          <CardSkeleton />
        ) : shops.length === 0 ? (
          <NoShopsAvailable />
        ) : (
          <FlatList
            data={sortedShops}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ParlourDetails', {
                    parlourData: item,
                  })
                }
              >
                <Card
                  image={item?.shopImage}
                  title={item?.parlourName}
                  location={item?.address}
                  rating={item?.totalRating ?? 0}
                  status={'open'}
                  distance={
                    item?.distance !== null && item?.distance !== Infinity
                      ? `${item.distance.toFixed(2)} km`
                      : 'Not available'
                  }
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.cardListContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: { ...StyleSheet.absoluteFillObject },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: primaryColor,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchInput: { flex: 1, height: 50, color: '#fff', fontSize: 16 },
  cardListContainer: { position: 'absolute', bottom: 20, left: 0, right: 0 },
  cardListContent: { paddingLeft: 10 },
  retryButton: {
    marginTop: 20,
    backgroundColor: primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default NearByShopsList;
