import React, { useContext, useState, useCallback, useRef } from 'react';
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
  RefreshControl,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageViewer from 'react-native-image-zoom-viewer';
import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import ProfileScreenSkeleton from '../../components/ProfileScreenSkeleton/ProfileScreenSkeleton';
import { generateRandomName } from '../../utils/utils';
import { DEFAULT_AVATAR } from '../../constants/images';
import { useFocusEffect } from '@react-navigation/native';
import PrivacyPolicyScreen from '../PrivacyPolicyScreen/PrivacyPolicyScreen';
import LinearGradient from 'react-native-linear-gradient';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const AccordionMenuItem = ({ iconName, label, children, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const animationHeight = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.accordionContainer, isLast && { marginBottom: 0 }]}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={toggleAccordion}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#A7C7E7', '#7BB0E1']}
          style={styles.menuItemIconBackground}
        >
          <Ionicons name={iconName} size={22} color="#fff" />
        </LinearGradient>
        <Text style={styles.menuItemText}>{label}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-forward'}
          size={20}
          color="#888"
        />
      </TouchableOpacity>
      {expanded && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { user, userData, loading, refreshUser, logout, userId } =
    useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid && userId) {
        refreshUser();
      }
    }, [user?.uid, refreshUser, userId]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.uid && userId) {
      await refreshUser();
    }
    setRefreshing(false);
  }, [user?.uid, refreshUser, userId]);

  const profileImageUri =
    typeof userData?.profileImage === 'string' && userData.profileImage
      ? userData.profileImage
      : DEFAULT_AVATAR;

  const images = [{ url: profileImageUri }];

  return (
    <View style={styles.outerContainer}>
      {loading ? (
        <ProfileScreenSkeleton />
      ) : (
        <>
          <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

          <LinearGradient
            colors={['#FF6B6B', primaryColor]}
            style={styles.headerBackground}
          >
            <View style={styles.header}>
              <Text style={styles.mainTitle}>Profile</Text>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => navigation.navigate('EditProfileScreen')}
              >
                <Icon name="pencil" size={18} color={primaryColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileSection}>
              <TouchableOpacity
                onPress={() => setIsImageViewerVisible(true)}
                activeOpacity={0.8}
                style={styles.avatarWrapper}
              >
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.avatar}
                />
                <View style={styles.avatarBadge}>
                  <Ionicons name="camera-outline" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.userName}>
                {userData?.fullName ?? generateRandomName()}
              </Text>
              {userData?.email && (
                <Text style={styles.userContact}>{userData.email}</Text>
              )}
              {userData?.phone && (
                <Text style={styles.userContact}>{userData.phone}</Text>
              )}
            </View>
          </LinearGradient>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={primaryColor}
              />
            }
          >
            <View style={styles.menuSection}>
              <AccordionMenuItem
                iconName="help-circle-outline"
                label="Support & Help"
              >
                <View style={styles.subMenuItem}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#666"
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>support@example.com</Text>
                </View>
                <View style={styles.subMenuItem}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#666"
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>+91-8181717171</Text>
                </View>
              </AccordionMenuItem>

              <AccordionMenuItem
                iconName="document-text-outline"
                label="Terms & Conditions"
              >
                <View style={styles.privacyPolicyContainer}>
                  <PrivacyPolicyScreen />
                </View>
              </AccordionMenuItem>

              <TouchableOpacity
                style={styles.logoutButton}
                activeOpacity={0.8}
                onPress={logout}
              >
                <LinearGradient
                  colors={['#FF7F7F', '#FF4D4D']}
                  style={styles.menuItemIconBackground}
                >
                  <Ionicons name="log-out-outline" size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.logoutText}>Logout</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Modal visible={isImageViewerVisible} transparent={true}>
            <ImageViewer
              imageUrls={images}
              enableSwipeDown
              onSwipeDown={() => setIsImageViewerVisible(false)}
              onCancel={() => setIsImageViewerVisible(false)}
            />
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackground: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 120, // Increased for avatar to sit nicely
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    marginBottom: -80, // Overlap with scrollview
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  editIcon: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 0 : 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userContact: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 0,
  },
  menuSection: {
    width: '100%',
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItemIconBackground: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemText: {
    flex: 1,
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },
  accordionContainer: {
    marginBottom: 12,
  },
  accordionContent: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    paddingTop: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: -10, // Overlap with menu item for continuous look
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#555',
  },
  privacyPolicyContainer: {
    maxHeight: 200, // Limit height to avoid excessively long content
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    flex: 1,
    fontSize: 17,
    color: '#FF4D4D',
    fontWeight: '600',
  },
});

export default ProfileScreen;
