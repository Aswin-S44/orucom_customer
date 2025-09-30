import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl, // Import RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { primaryColor, starColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import ProfileScreenSkeleton from '../../components/ProfileScreenSkeleton/ProfileScreenSkeleton';
import { createNotification, getCustomerById } from '../../apis/services';
import { generateRandomName } from '../../utils/utils';
import { DEFAULT_AVATAR } from '../../constants/images';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import PrivacyPolicyScreen from '../PrivacyPolicyScreen/PrivacyPolicyScreen';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const StarRating = ({ rating, count }) => {
  const stars = Array(5).fill(0);
  return (
    <View style={styles.starRatingContainer}>
      {stars.map((_, index) => (
        <Ionicons
          key={index}
          name="star"
          size={18}
          color={starColor}
          style={styles.starIcon}
        />
      ))}
      <Text style={styles.ratingText}>
        {' '}
        {rating} ({count})
      </Text>
    </View>
  );
};

const AccordionMenuItem = ({ iconName, label, children }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={toggleAccordion}
        activeOpacity={0.8}
      >
        <View style={styles.menuItemIconContainer}>
          <Ionicons name={iconName} size={24} color="#555" />
        </View>
        <Text style={styles.menuItemText}>{label}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="#BDBDBD"
        />
      </TouchableOpacity>
      {expanded && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { user, userData, loading, refreshUser, logout } =
    useContext(AuthContext); // Get refreshUser
  const [refreshing, setRefreshing] = useState(false);

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        refreshUser(); // Fetch the latest user data from the backend
      }
    }, [user?.uid, refreshUser]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.uid) {
      await refreshUser();
    }
    setRefreshing(false);
  }, [user?.uid, refreshUser]);

  // For development only (if still needed, keep it)
  useEffect(() => {
    const createNotificationData = async () => {
      // await createNotification();
    };
    createNotificationData();
  }, []);

  return (
    <View style={styles.outerContainer}>
      {loading ? ( // Use the loading from AuthContext
        <ProfileScreenSkeleton />
      ) : (
        <>
          <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

          <View style={styles.container}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#fff"
                />
              }
            >
              <Text style={styles.mainTitle}>Profile</Text>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => navigation.navigate('EditProfileScreen')}
              >
                <Icon name="pencil" size={20} color="#666" />
              </TouchableOpacity>
              <View style={styles.profileSection}>
                <Image
                  source={{
                    uri:
                      typeof userData?.profileImage === 'string' &&
                      userData.profileImage
                        ? userData.profileImage
                        : DEFAULT_AVATAR,
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.userName}>
                  {userData?.fullName ?? generateRandomName()}
                </Text>
                {/* You might want to add other profile details here, like email/phone if desired */}
                {userData?.email && (
                  <Text style={styles.userContact}>{userData.email}</Text>
                )}
                {userData?.phone && (
                  <Text style={styles.userContact}>{userData.phone}</Text>
                )}
              </View>

              <View style={styles.menuSection}>
                {/* <AccordionMenuItem iconName="settings-outline" label="Settings">
                  <Text style={styles.accordionText}>
                    Manage your account preferences and app settings here.
                  </Text>

                  <TouchableOpacity style={styles.accordionSubItem}>
                    <Text style={styles.accordionSubItemText}>
                      Notification Preferences
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.accordionSubItem}>
                    <Text style={styles.accordionSubItemText}>
                      Privacy Settings
                    </Text>
                  </TouchableOpacity>
                </AccordionMenuItem> */}
                <AccordionMenuItem
                  iconName="help-circle-outline" // Changed icon for support
                  label="Support & Help"
                >
                  <View style={styles.row}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#555"
                      style={styles.contactIcon}
                    />
                    <Text style={styles.contactText}>support@example.com</Text>
                  </View>
                  <View style={styles.row}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color="#555"
                      style={styles.contactIcon}
                    />
                    <Text style={styles.contactText}>+91-8181717171</Text>
                  </View>
                </AccordionMenuItem>

                {/* <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuItemIconContainer}>
                    <Ionicons name="wallet-outline" size={24} color="#555" />
                  </View>
                  <Text style={styles.menuItemText}>My Wallet</Text>
                  <Ionicons name="chevron-forward" size={22} color="#BDBDBD" />
                </TouchableOpacity> */}

                {/* <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuItemIconContainer}>
                    <Ionicons name="documents-outline" size={24} color="#555" />
                  </View>
                  <Text style={styles.menuItemText}>Terms & Conditions</Text>
                  <Ionicons name="chevron-forward" size={22} color="#BDBDBD" />
                </TouchableOpacity> */}

                <AccordionMenuItem
                  iconName="help-circle-outline" // Changed icon for support
                  label="Terms & Conditions"
                >
                  <PrivacyPolicyScreen />
                </AccordionMenuItem>

                <TouchableOpacity
                  style={[styles.menuItem, styles.logoutButton]}
                  activeOpacity={0.8}
                  onPress={logout}
                >
                  <View style={styles.menuItemIconContainer}>
                    <Ionicons name="log-out-outline" size={24} color="red" />
                  </View>
                  <Text style={[styles.menuItemText, styles.logoutText]}>
                    Logout
                  </Text>
                  <Ionicons name="chevron-forward" size={22} color="#BDBDBD" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </>
      )}
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
    marginTop: 60, // Slightly reduced margin to give more space
    backgroundColor: '#fff',
    borderTopLeftRadius: 35, // Slightly less aggressive radius
    borderTopRightRadius: 35,
    paddingHorizontal: 20, // Reduced horizontal padding
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 25, // Adjusted position
    right: 25,
    zIndex: 1,
    backgroundColor: '#F0F0F0', // Light background for edit icon
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 26, // Slightly smaller title
    fontWeight: '600', // Bolder title
    color: '#333',
    textAlign: 'center',
    marginTop: 30, // Increased margin
    marginBottom: 25,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40, // Increased margin
  },
  avatar: {
    width: 110, // Slightly larger avatar
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 3, // Added a border to the avatar
    borderColor: primaryColor, // Primary color border
  },
  userName: {
    fontSize: 24, // Larger name
    fontWeight: '700', // Bolder name
    color: '#333',
    marginBottom: 5,
  },
  userContact: {
    fontSize: 15,
    color: '#777',
    marginBottom: 2,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F0F8FF', // Light background for rating
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  starIcon: {
    marginHorizontal: 1,
  },
  ratingText: {
    fontSize: 15,
    color: '#777',
    marginLeft: 8,
    fontWeight: '500',
  },
  menuSection: {
    width: '100%',
    paddingBottom: 20, // Added padding to bottom
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 15,
    padding: 16, // Increased padding
    marginBottom: 12, // Reduced margin between items
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08, // Subtle shadow
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemIconContainer: {
    width: 35, // Slightly smaller icon container
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 8, // Rounded corners for icon background
    backgroundColor: '#E8F5E9', // Light green background
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  accordionContainer: {
    marginBottom: 12,
  },
  accordionContent: {
    padding: 15,
    paddingTop: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderTopWidth: 0,
  },
  accordionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  accordionSubItem: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 0, // Removed border
    borderBottomColor: '#eee',
  },
  accordionSubItemText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  contactIcon: {
    marginRight: 10,
  },
  contactText: {
    fontSize: 15,
    color: '#555',
  },
  logoutButton: {
    marginTop: 20, // More space above logout
    backgroundColor: '#FFF0F0', // Light red background
  },
  logoutText: {
    color: 'red',
    fontWeight: '600',
  },
});

export default ProfileScreen;
