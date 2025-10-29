import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { getAllParlours } from '../../apis/services';
import { AuthContext } from '../../context/AuthContext';

const NearByShopsList = () => {
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
    return R * c;
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
        if (shops.length > 0) {
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
      <View style={styles.center}>
        <Text>Turn on your device location</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default NearByShopsList;
