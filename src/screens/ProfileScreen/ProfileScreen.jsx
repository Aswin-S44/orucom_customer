import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor, starColor } from '../../constants/colors';

const StarRating = ({ rating, count }) => {
  const stars = Array(5).fill(0);
  return (
    <View style={styles.starRatingContainer}>
      {stars.map((_, index) => (
        <Ionicons key={index} name="star" size={18} color={starColor} />
      ))}
      <Text style={styles.ratingText}>
        {' '}
        {rating} ({count})
      </Text>
    </View>
  );
};

const ProfileMenuItem = ({ iconName, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIconContainer}>
      <Ionicons name={iconName} size={24} color="#555" />
    </View>
    <Text style={styles.menuItemText}>{label}</Text>
    <Ionicons name="chevron-forward" size={22} color="#BDBDBD" />
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Profile</Text>

          <View style={styles.profileSection}>
            <Image
              source={require('../../assets/images/users/1.png')}
              style={styles.avatar}
            />
            <Text style={styles.userName}>Jesika Sabrina</Text>
            <Text style={styles.userSpecialty}>Spa & Skin Treatment</Text>
            <StarRating rating={5} count={120} />
          </View>

          <View style={styles.menuSection}>
            <ProfileMenuItem iconName="settings-outline" label="Settings" />
            <ProfileMenuItem iconName="cut-outline" label="My Services" />
            <ProfileMenuItem iconName="receipt-outline" label="My Coupon" />
            <ProfileMenuItem
              iconName="person-outline"
              label="Support Request"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  container: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
  },
  userSpecialty: {
    fontSize: 16,
    color: '#777',
    marginVertical: 4,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 15,
    color: '#777',
    marginLeft: 5,
  },
  menuSection: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default ProfileScreen;
