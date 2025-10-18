import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Linking, Platform } from 'react-native';
import { primaryColor } from '../../constants/colors';

const TurnOnLocationScreen = () => {
  const openLocationSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings(); // for app-level settings
      // OR use:
      Linking.openURL('app-settings:'); // sometimes opens directly in Android
      // But best:
      Linking.openURL('android.settings.LOCATION_SOURCE_SETTINGS');
    } else {
      Linking.openURL('App-Prefs:Privacy&path=LOCATION'); // iOS (may vary by version)
    }
  };
  return (
    <View style={styles.container}>
      <Text>Please turn on your plocation</Text>
      <TouchableOpacity style={styles.button} onPress={openLocationSettings}>
        <Text>On</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 40,
  },
  button: {
    padding: 10,
    backgroundColor: primaryColor,
    color: '#fff',
    borderRadius: 50,
  },
});

export default TurnOnLocationScreen;
