import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
  AppState,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../components/Card/Card';
import { primaryColor } from '../../constants/colors';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { AuthContext } from '../../context/AuthContext';
import { getAllParlours } from '../../apis/services';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import NoShopsAvailable from '../../components/NoShopsAvailable/NoShopsAvailable';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { GOOGLE_MAPS_API_KEY } from '@env';
import Geolocation from '@react-native-community/geolocation';

const NearByShopsList = ({ navigation }) => {
  const [mapType, setMapType] = useState('standard');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData, updateUserData } = useContext(AuthContext);
  const [selectedParlour, setSelectedParlour] = useState(null);
  const mapRef = useRef(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const appState = useRef(AppState.currentState);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  }, []);

  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    const permissionStatus = await check(permission);
    if (permissionStatus !== RESULTS.GRANTED) {
      const reqStatus = await request(permission);
      if (reqStatus === RESULTS.GRANTED) {
        setHasLocationPermission(true);
        return true;
      } else {
        setHasLocationPermission(false);
        return false;
      }
    } else {
      setHasLocationPermission(true);
      return true;
    }
  };

  const getUserLocation = useCallback(async () => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position => {
          setIsLocationEnabled(true);
          updateUserData({
            ...userData,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
          resolve(true);
        },
        error => {
          if (error.code === 2) setIsLocationEnabled(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    });
  }, []);

  const checkAndSetLocation = useCallback(async () => {
    setLoading(true);
    const permissionGranted = await requestLocationPermission();
    if (permissionGranted) {
      const locationEnabled = await getUserLocation();
      if (locationEnabled) setMapLoaded(false);
    }
    setLoading(false);
  }, [getUserLocation]);

  useEffect(() => {
    checkAndSetLocation();
    const handleAppStateChange = async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        await checkAndSetLocation();
      }
      appState.current = nextAppState;
    };
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    const unsubscribeFocus = navigation.addListener('focus', () => {
      checkAndSetLocation();
    });
    return () => {
      unsubscribeFocus();
      appStateSubscription.remove();
    };
  }, [ checkAndSetLocation]);

  useEffect(() => {
    const fetchShops = async () => {
      if (hasLocationPermission && isLocationEnabled && userData?.coordinates) {
        try {
          setLoading(true);
          const res = await getAllParlours();
          if (res && res.length > 0) {
            const shopsWithDistance = res.map(parlour => {
              if (
                userData?.coordinates &&
                parlour?.geolocation?.latitude &&
                parlour?.geolocation?.longitude
              ) {
                const distance = calculateDistance(
                  userData.coordinates.latitude,
                  userData.coordinates.longitude,
                  parlour.geolocation.latitude,
                  parlour.geolocation.longitude,
                );
                return { ...parlour, distance };
              }
              return { ...parlour, distance: null };
            });
            setShops(shopsWithDistance);
            if (mapRef.current) {
              const coords = [
                {
                  latitude: userData.coordinates.latitude,
                  longitude: userData.coordinates.longitude,
                },
                ...res.map(s => ({
                  latitude: s.geolocation?.latitude,
                  longitude: s.geolocation?.longitude,
                })),
              ];
              mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 100, right: 100, bottom: 250, left: 100 },
                animated: true,
              });
            }
          } else setShops([]);
        } catch {
          setShops([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setShops([]);
      }
    };
    fetchShops();
  }, [
    calculateDistance,
    hasLocationPermission,
    isLocationEnabled,
    //userData?.coordinates,
  ]);

  const handleMarkerPress = useCallback(
    parlour => {
      setSelectedParlour(parlour);
      if (mapRef.current && userData?.coordinates) {
        mapRef.current.fitToCoordinates(
          [
            {
              latitude: userData.coordinates.latitude,
              longitude: userData.coordinates.longitude,
            },
            {
              latitude: parlour.geolocation.latitude,
              longitude: parlour.geolocation.longitude,
            },
          ],
          {
            edgePadding: { top: 100, right: 100, bottom: 250, left: 100 },
            animated: true,
          },
        );
      }
    },
    [userData],
  );

  const onDirectionsReady = useCallback(result => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(result.coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 250, left: 100 },
        animated: true,
      });
    }
  }, []);

  if (!hasLocationPermission && !loading)
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Please grant location access to see nearby shops.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.permissionButtonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );

  if (!isLocationEnabled && !loading)
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Your Location is turned off. Please enable it to see nearby shops.
        </Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      )}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userData?.coordinates?.latitude || 0,
          longitude: userData?.coordinates?.longitude || 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        mapType={mapType}
        onMapReady={() => setMapLoaded(true)}
      >
        {userData?.coordinates && (
          <Marker
            coordinate={{
              latitude: userData.coordinates.latitude,
              longitude: userData.coordinates.longitude,
            }}
            title="Your Location"
            pinColor="red"
          />
        )}
        {shops.map(parlour => (
          <Marker
            key={parlour.id}
            coordinate={{
              latitude: parlour.geolocation.latitude,
              longitude: parlour.geolocation.longitude,
            }}
            title={parlour.parlourName || 'No Name'}
            description={parlour.address || 'No Address'}
            onPress={() => handleMarkerPress(parlour)}
          >
            <View style={styles.markerOuter}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        ))}
        {selectedParlour && userData?.coordinates && (
          <MapViewDirections
            origin={userData.coordinates}
            destination={selectedParlour.geolocation}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor={primaryColor}
            onReady={onDirectionsReady}
          />
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

      <View style={styles.mapTypeContainer}>
        {['standard', 'satellite', 'hybrid'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.mapTypeButton,
              mapType === type && styles.selectedMapType,
            ]}
            onPress={() => setMapType(type)}
          >
            <Text
              style={[
                styles.mapTypeButtonText,
                mapType === type && styles.selectedMapText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.cardListContainer}>
        {loading ? (
          <CardSkeleton />
        ) : shops.length === 0 ? (
          <NoShopsAvailable />
        ) : (
          <FlatList
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
                  image={item.profileImage}
                  title={item.parlourName}
                  location={item.address}
                  rating={item.totalRating ?? 0}
                  status={item.status ?? 'closed'}
                  distance={item.distance ? `${item.distance} km` : 'N/A'}
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
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    backgroundColor: 'rgba(142,68,173,0.3)',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default NearByShopsList;
