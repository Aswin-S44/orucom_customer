import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions, // Import Dimensions
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // Import PROVIDER_GOOGLE
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../components/Card/Card';
import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { getAllParlours } from '../../apis/services';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { SafeAreaView } from 'react-native';

const initialRegion = {
  latitude: 23.8759,
  longitude: 90.3795,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const mapMarkers = [
  { id: '1', coordinate: { latitude: 23.87, longitude: 90.37 } },
  { id: '2', coordinate: { latitude: 23.88, longitude: 90.39 } },
  { id: '3', coordinate: { latitude: 23.86, longitude: 90.38 } },
];

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

const MapContainers = ({ initialRegion, mapMarkers }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={mapContainerStyles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={mapContainerStyles.mapStyle}
          initialRegion={initialRegion}
          customMapStyle={mapStyle}
        >
          {mapMarkers.map(marker => (
            <Marker key={marker.id} coordinate={marker.coordinate} />
          ))}
        </MapView>
      </View>
    </SafeAreaView>
  );
};

const mapContainerStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapContainers;
