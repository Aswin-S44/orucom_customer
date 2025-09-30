import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function TestMap() {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 9.4619,
          longitude: 76.7885,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: 9.4619, longitude: 76.7885 }}
          title="Test Marker"
          description="This should be visible"
        />
      </MapView>
    </View>
  );
}
