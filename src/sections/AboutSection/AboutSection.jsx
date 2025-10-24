import { View, Text } from 'react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { primaryColor } from '../../constants/colors';

const AboutSection = ({ about }) => {
  return (
    <View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Why Choose Us</Text>
        <Text style={styles.description}>{about}</Text>
        {/* <View style={styles.bulletPoint}>
          <View style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            Distracted by the readable content of a page when looking at its
            layout.
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            Distracted by the readable content of a page when looking at its
            layout.
          </Text>
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: primaryColor,
    marginRight: 12,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
    lineHeight: 22,
  },
});

export default AboutSection;
