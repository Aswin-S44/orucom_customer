import React, { useContext, useEffect, useState } from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { primaryColor, starColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import ProfileScreenSkeleton from '../../components/ProfileScreenSkeleton/ProfileScreenSkeleton';
import { createNotification, getCustomerById } from '../../apis/services';
import { generateRandomName } from '../../utils/utils';
import { DEFAULT_AVATAR } from '../../constants/images';

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
        <Ionicons key={index} name="star" size={18} color={starColor} />
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
      <TouchableOpacity style={styles.menuItem} onPress={toggleAccordion}>
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
  const { user, userData, loading } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    // For development only
    const createNotificationData = async () => {
      await createNotification();
    };
    createNotificationData();
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      const fetchProfile = async () => {
        try {
          setProfileLoading(true);
          const res = await getCustomerById(user.uid);

          setProfileLoading(false);
          if (res) {
            setProfile(res);
          }
        } catch (error) {
          console.log('Error while fetching profile : ', error);
        }
      };
      fetchProfile();
    }
  }, [user]);

  return (
    <View style={styles.outerContainer}>
      {profileLoading ? (
        <>
          <ProfileScreenSkeleton />
        </>
      ) : (
        <>
          <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

          <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.mainTitle}>Profile</Text>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => navigation.navigate('EditProfileScreen')}
              >
                <Icon name="pencil" size={24} color="#111" />
              </TouchableOpacity>
              <View style={styles.profileSection}>
                <Image
                  source={{
                    uri:
                      typeof profile?.profileImage === 'string'
                        ? profile.profileImage
                        : DEFAULT_AVATAR,
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.userName}>
                  {userData?.fullName ?? generateRandomName()}
                </Text>
              </View>

              <View style={styles.menuSection}>
                <AccordionMenuItem iconName="settings-outline" label="Settings">
                  <Text style={styles.accordionText}>
                    TODO: Need to confirm what are the things under settings tab
                  </Text>
                </AccordionMenuItem>
                <AccordionMenuItem
                  iconName="person-outline"
                  label="Support Request"
                >
                  <View style={styles.row}>
                    <Ionicons name="mail" size={18} />
                    <Text>support@gmail.com</Text>
                  </View>
                  <View style={styles.row}>
                    <Icon name="phone" size={24} color="#111" />
                    <Text>+91-8181717171</Text>
                  </View>
                </AccordionMenuItem>
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
    marginTop: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 20,
    right: 25,
    zIndex: 1,
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
  accordionContainer: {
    marginBottom: 15,
  },
  accordionContent: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    paddingTop: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  accordionText: {
    fontSize: 14,
    color: '#555',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
  },
});

export default ProfileScreen;
