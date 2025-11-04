import React, { useContext, useState, useCallback } from 'react';
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

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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
  const { user, userData, loading, refreshUser, logout ,userId} =
    useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid && userId) {
        refreshUser();
      }
    }, [user?.uid, refreshUser]),
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
                <TouchableOpacity onPress={() => setIsImageViewerVisible(true)}>
                  <Image
                    source={{ uri: profileImageUri }}
                    style={styles.avatar}
                  />
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

              <View style={styles.menuSection}>
                <AccordionMenuItem
                  iconName="help-circle-outline"
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

                <AccordionMenuItem
                  iconName="document-text-outline"
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
    backgroundColor: primaryColor,
  },
  container: {
    flex: 1,
    marginTop: 60,
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 25,
    right: 25,
    zIndex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 25,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: primaryColor,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  userContact: {
    fontSize: 15,
    color: '#777',
    marginBottom: 2,
  },
  menuSection: {
    width: '100%',
    paddingBottom: 20,
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
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemIconContainer: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
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
    marginTop: 20,
    backgroundColor: '#FFF0F0',
  },
  logoutText: {
    color: 'red',
    fontWeight: '600',
  },
});

export default ProfileScreen;
