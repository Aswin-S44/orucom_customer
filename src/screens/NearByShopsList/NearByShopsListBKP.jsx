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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../components/Card/Card';
import { primaryColor } from '../../constants/colors';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { AuthContext } from '../../context/AuthContext';
import { getAllParlours } from '../../apis/services';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { getLocationPermission } from '../../apis/permissions';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import NoShopsAvailable from '../../components/NoShopsAvailable/NoShopsAvailable';

const NearByShopsList = ({ navigation }) => {
  const [mapType, setMapType] = useState('standard');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, userData } = useContext(AuthContext);
  const [selectedParlour, setSelectedParlour] = useState(null);
  const mapRef = useRef(null);

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
    const distance = R * c;
    return distance.toFixed(2);
  }, []);

  const getCurrentLocation = async () => {
    // ✅ 1. Check App-level permission
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const permissionStatus = await check(permission);
    if (permissionStatus !== RESULTS.GRANTED) {
      const reqStatus = await request(permission);
      if (reqStatus !== RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Please enable location permission.');
        return;
      }
    }

    // ✅ 2. Check if device location is ON
    Geolocation.getCurrentPosition(
      position => {},
      error => {
        console.log('Error getting location:', error.message);

        // If location services are OFF, show a prompt
        if (error.code === 2) {
          // code 2 => Location provider disabled
          Alert.alert(
            'Enable Location',
            'Your GPS is turned off. Please enable it.',
            [
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel', style: 'cancel' },
            ],
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
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
          const shopsWithDistance = res.map(parlour => {
            if (
              userData?.coordinates &&
              parlour?.geolocation?.latitude &&
              parlour?.geolocation?.longitude
            ) {
              const origin = {
                latitude: userData.coordinates.latitude,
                longitude: userData.coordinates.longitude,
              };
              const destination = {
                latitude: parlour?.geolocation?.latitude,
                longitude: parlour?.geolocation?.longitude,
              };
              const distance = calculateDistance(
                origin?.latitude,
                origin?.longitude,
                destination?.latitude,
                destination?.longitude,
              );
              return { ...parlour, distance: distance };
            }
            return { ...parlour, distance: null };
          });

          setShops(shopsWithDistance);
          if (mapRef.current && userData?.coordinates && res.length > 0) {
            const coords = [
              {
                latitude: userData?.coordinates?.latitude,
                longitude: userData?.coordinates?.longitude,
              },
              ...res.map(s => ({
                latitude: s.coordinates?.latitude,
                longitude: s.coordinates?.longitude,
              })),
            ];
            mapRef.current.fitToCoordinates(coords, {
              edgePadding: { top: 100, right: 100, bottom: 250, left: 100 },
              animated: true,
            });
          }
        }
      } catch (err) {
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [calculateDistance]);

  const handleMarkerPress = useCallback(
    parlour => {
      setSelectedParlour(parlour);
      if (mapRef.current && userData?.coordinates) {
        mapRef.current.fitToCoordinates(
          [
            {
              latitude: userData?.coordinates?.latitude,
              longitude: userData?.coordinates?.longitude,
            },
            {
              latitude: parlour?.geolocation?.latitude,
              longitude: parlour?.geolocation?.longitude,
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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
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

        {shops &&
          shops.length > 0 &&
          shops.map(parlour => {
            return (
              <Marker
                key={parlour.id}
                coordinate={{
                  latitude: parlour?.geolocation?.latitude,
                  longitude: parlour?.geolocation?.longitude,
                }}
                title={parlour.parlourName || 'No Name'}
                description={parlour.address || 'No Address'}
                onPress={() => handleMarkerPress(parlour)}
              >
                <View style={styles.markerOuter}>
                  <View style={styles.markerInner} />
                </View>
              </Marker>
            );
          })}
        {selectedParlour && userData?.coordinates && (
          <MapViewDirections
            origin={{
              latitude: userData.coordinates.latitude,
              longitude: userData.coordinates.longitude,
            }}
            destination={{
              latitude: selectedParlour?.geolocation?.latitude,
              longitude: selectedParlour?.geolocation?.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor={primaryColor}
            optimizeWaypoints={true}
            onReady={onDirectionsReady}
          />
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

      <View style={styles.mapTypeContainer}>
        <TouchableOpacity
          style={[
            styles.mapTypeButton,
            mapType === 'standard' && styles.selectedMapType,
          ]}
          onPress={() => setMapType('standard')}
        >
          <Text
            style={[
              styles.mapTypeButtonText,
              mapType === 'standard' && styles.selectedMapText,
            ]}
          >
            Standard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mapTypeButton,
            mapType === 'satellite' && styles.selectedMapType,
          ]}
          onPress={() => setMapType('satellite')}
        >
          <Text
            style={[
              styles.mapTypeButtonText,
              mapType === 'satellite' && styles.selectedMapText,
            ]}
          >
            Satellite
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mapTypeButton,
            mapType === 'hybrid' && styles.selectedMapType,
          ]}
          onPress={() => setMapType('hybrid')}
        >
          <Text
            style={[
              styles.mapTypeButtonText,
              mapType === 'hybrid' && styles.selectedMapText,
            ]}
          >
            Hybrid
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardListContainer}>
        {loading ? (
          <>
            <CardSkeleton />
          </>
        ) : !loading && shops.length === 0 ? (
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
                  rating={item?.rating ?? 0}
                  status={item?.status ?? 'closed'}
                  distance={item?.distance ? `${item.distance} km` : 'N/A'}
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
