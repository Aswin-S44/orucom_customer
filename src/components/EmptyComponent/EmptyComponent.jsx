import { View, Text } from 'react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';

const EmptyComponent = () => {
  return (
    <View>
      <View style={styles.emptyContainer}>
        <Image
          source={require('../../assets/images/no-services.jpg')}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyText}>No Services Found</Text>
        <Text style={styles.emptySubText}>
          Add a new service to get started.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default EmptyComponent;
