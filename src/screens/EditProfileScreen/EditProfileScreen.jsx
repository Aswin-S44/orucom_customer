import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getCustomerById, updateUserData } from '../../apis/services';
import { launchImageLibrary } from 'react-native-image-picker';
import { primaryColor } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextInput } from 'react-native';

const EditProfileScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const initialImage = require('../../assets/images/user.png');

  useEffect(() => {
    if (user && user.uid) {
      setProfileLoading(true);
      const fetchUserData = async () => {
        try {
          const res = await getCustomerById(user.uid);
          console.log('RES=============', res ? res : 'no res');
          if (res) {
            setName(res.fullName || '');
            setPhone(res.phone || '');
            setEmail(res.email || '');
            setImageUri(res.profileImage || null);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setProfileLoading(false);
        }
      };
      fetchUserData();
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const selectImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true },
      response => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else {
          const asset = response.assets?.[0];
          if (asset && asset.base64) {
            const uri = `data:${asset.type};base64,${asset.base64}`;
            setImageUri(uri);
          }
        }
      },
    );
  };

  const handleEditProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    const updatedData = {
      fullName: name,
      email,
      profileImage: imageUri,
      phone,
    };
    try {
      await updateUserData(user.uid, updatedData);
      await refreshUser(); // Refresh user data in AuthContext
      setToastMessage('Profile updated successfully!');
      navigation.goBack(); // Navigate back after successful update
    } catch (error) {
      console.error('Error updating profile:', error);
      setToastMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const imageSource = imageUri ? { uri: imageUri } : initialImage;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleEditProfile} disabled={isSaving}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.avatar} />
          <TouchableOpacity style={styles.editImageIcon} onPress={selectImage}>
            <Icon name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      {(profileLoading || isSaving) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.loadingText}>
            {isSaving ? 'Saving profile...' : 'Loading profile...'}
          </Text>
        </View>
      )}

      {toastMessage ? (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7', // Lighter background for a cleaner look
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15, // Adjusted padding
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0, // Removed borderBottom
    shadowColor: '#000', // Added shadow for header
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22, // Slightly larger title
    fontWeight: 'bold',
    color: '#333',
  },
  saveText: {
    fontSize: 17, // Slightly larger save text
    fontWeight: 'bold',
    color: primaryColor,
  },
  scrollContent: {
    paddingVertical: 30, // Increased vertical padding
    paddingHorizontal: 25, // Increased horizontal padding
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40, // Increased margin
  },
  avatar: {
    width: 130, // Slightly larger avatar
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E0E0E0',
    borderWidth: 3, // Added subtle border
    borderColor: '#fff',
    shadowColor: '#000', // Added shadow to avatar
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  editImageIcon: {
    position: 'absolute',
    bottom: 0, // Moved to bottom center
    right: '35%',
    backgroundColor: primaryColor,
    padding: 10, // Larger touch target
    borderRadius: 25, // Perfectly round
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 25, // Increased spacing between input groups
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10, // Increased margin for label
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF', // White background for inputs
    borderRadius: 12, // More rounded corners
    paddingHorizontal: 18, // Increased padding
    paddingVertical: 14, // Increased padding
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0', // Lighter border color
    shadowColor: '#000', // Added subtle shadow to inputs
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 15, // Increased margin
    color: '#fff',
    fontSize: 17, // Slightly larger font
    fontWeight: '500',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40, // Moved slightly up
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50', // Green for success
    borderRadius: 30, // More rounded
    padding: 18, // Increased padding
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 17, // Slightly larger font
    fontWeight: '600',
  },
});

export default EditProfileScreen;
