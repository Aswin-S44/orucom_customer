import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { getAllParlours } from '../../apis/services';

const NearByShopsList = () => {
  const [region, setRegion] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [shops, setShops] = useState([]);
  const mapRef = useRef(null);

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
        if (mapRef.current) {
          const markers = shops
            .filter(shop => shop.geolocation)
            .map(shop => ({
              latitude: shop.geolocation.latitude,
              longitude: shop.geolocation.longitude,
            }));
          if (markers.length > 0) {
            markers.push({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            mapRef.current.fitToCoordinates(markers, {
              edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
              animated: true,
            });
          }
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

  if (!region) {
    return (
      <View style={styles.center}>
        <Text>Loading map...</Text>
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
                title={shop.email}
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
