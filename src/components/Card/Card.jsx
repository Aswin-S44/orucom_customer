import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NO_IMAGE } from '../../constants/images';

const Card = ({ image, title, location, rating, status, distance }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: typeof image === 'string' ? image : NO_IMAGE,
          }}
          style={styles.cardImage}
        />

        <View style={styles.badgesContainer}>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={14} color="#fff" />
            <Text style={styles.ratingBadgeText}>{rating}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{status}</Text>
          </View>
          {distance && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceBadgeText}>{distance}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        {/* <Text style={styles.cardLocation}>{location}</Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: 12,
    backgroundColor: '#fff',
    margin: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    minHeight:250
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badgesContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8E44AD',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  statusBadge: {
    backgroundColor: '#F3E5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  distanceBadge: {
    backgroundColor: '#EDE68E',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  distanceBadgeText: {
    color: '#3B392B',
    fontWeight: '600',
  },
  statusBadgeText: {
    color: '#8E44AD',
    fontSize: 14,
    fontWeight: 500,
  },
  detailsContainer: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#333',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#777',
  },
});

export default Card;
