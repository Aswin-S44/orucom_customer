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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { getAllNearbyParlors, getAllParlours } from '../../apis/services';
import { AuthContext } from '../../context/AuthContext';
import { primaryColor } from '../../constants/colors';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import NoShopsAvailable from '../../components/NoShopsAvailable/NoShopsAvailable';
import Card from '../../components/Card/Card';
import { isShopOpen } from '../../utils/utils';
import LocationPrompt from '../../components/LocationPrompt/LocationPrompt';

const NearByShopsList = ({ navigation }) => {
  const [region, setRegion] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const mapRef = useRef(null);
  const { user, userData } = useContext(AuthContext);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

  const checkLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        const userRegion = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(userRegion);
        setLocationEnabled(true);
        if (shops && shops?.length > 0) {
          const updatedShops = shops.map(shop => {
            if (shop.geolocation) {
              return {
                ...shop,
                distance: calculateDistance(
                  pos.coords.latitude,
                  pos.coords.longitude,
                  shop.geolocation.latitude,
                  shop.geolocation.longitude,
                ),
              };
            }
            return shop;
          });
          setShops(updatedShops);
          setLoadingShops(false);
        }
        if (mapRef.current) {
          const markers = shops
            .filter(shop => shop.geolocation)
            .map(shop => ({
              latitude: shop.geolocation.latitude,
              longitude: shop.geolocation.longitude,
            }));
          markers.push({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          mapRef.current.fitToCoordinates(markers, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }
      },
      () => setLocationEnabled(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

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
    if (permissionGranted) {
      checkLocation();
      const interval = setInterval(() => checkLocation(), 3000);
      return () => clearInterval(interval);
    }
  }, [permissionGranted, shops]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await getAllParlours();
        // console.log('RES-----------', res ? res : 'no res');
        setShops(res || []);
      } catch (err) {}
    };
    fetchShops();
  }, []);

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
        <View style={styles.header}></View>
        <View style={styles.center}>
          <LocationPrompt
            title="Turn on your device location"
            fileName="Location_animation.json"
          />
        </View>
      </View>
    );
  }

  if (!region || loadingShops) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading shops...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        zoomEnabled
        minZoomLevel={0}
        maxZoomLevel={20}
      >
        {shops.map(
          shop =>
            shop.geolocation && (
              <Marker
                key={shop.id}
                coordinate={{
                  latitude: shop.geolocation.latitude,
                  longitude: shop.geolocation.longitude,
                }}
                title={`${shop.parlourName} - ${shop.distance?.toFixed(2)} km`}
              />
            ),
        )}
      </MapView>
      <View style={styles.header}>
        <View>
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
      </View>

      <View style={styles.cardListContainer}>
        {loadingShops ? (
          <>
            <CardSkeleton />
          </>
        ) : !loadingShops && shops.length === 0 ? (
          <NoShopsAvailable />
        ) : (
          <FlatList
            // data={shops}
            data={[...shops].sort(
              (a, b) =>
                parseFloat(a.distance || Infinity) -
                parseFloat(b.distance || Infinity),
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  navigation.navigate('ParlourDetails', {
                    parlourData: item,
                  })
                }
              >
                <Card
                  image={item?.profileImage}
                  title={item?.parlourName}
                  location={item?.address}
                  rating={item?.totalRating ?? 0}
                  status={isShopOpen(item?.openingHours) ? 'open' : 'closed'}
                  distance={
                    item?.distance ? `${item?.distance?.toFixed(2)} km` : 'N/A'
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  markerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(142, 68, 173, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: primaryColor,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardListContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  cardListContent: { paddingLeft: 10 },
  mapTypeContainer: {
    position: 'absolute',
    top: 130,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 5,
  },
  mapTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedMapType: { backgroundColor: primaryColor },
  mapTypeButtonText: { color: '#333', fontWeight: 'bold' },
  selectedMapText: { color: '#fff' },
});

export default NearByShopsList;
