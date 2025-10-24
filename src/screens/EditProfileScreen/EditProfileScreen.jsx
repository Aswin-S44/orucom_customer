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
  const { user, refreshUser, userData } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const initialImage = require('../../assets/images/user.png');


  // useEffect(() => {
  //   if (user && user.uid) {
  //     setProfileLoading(true);
  //     const fetchUserData = async () => {
  //       try {
  //         const res = await getCustomerById(user.uid);
  //         if (res) {
  //           setName(res.fullName || '');
  //           setPhone(res.phone || '');
  //           setEmail(res.email || '');
  //           setImageUri(res.profileImage || null);
  //         }
  //       } catch (error) {
  //         console.error('Failed to fetch user data:', error);
  //         setToastMessage('Failed to load profile data.');
  //       } finally {
  //         setProfileLoading(false);
  //       }
  //     };
  //     fetchUserData();
  //   } else {
  //     setProfileLoading(false);
  //   }
  // }, [user]);

  useEffect(() => {
    if (userData) {
      setProfileLoading(true);
      setName(userData?.fullName || '');
      setPhone(userData.phone || '');
      setEmail(userData.email || '');
      setImageUri(userData.profileImage || null);
      setProfileLoading(false);
    }
  }, [user.uid]);

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
      { mediaType: 'photo', includeBase64: true, quality: 0.7 }, // Added quality
      response => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
          setToastMessage('Failed to select image.');
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

  const validateInputs = () => {
    let isValid = true;
    setNameError('');
    setPhoneError('');

    if (!name.trim()) {
      setNameError('Full name cannot be empty');
      isValid = false;
    }

    if (!phone.trim()) {
      setPhoneError('Phone number cannot be empty');
      isValid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Phone number must be 10 digits');
      isValid = false;
    }

    return isValid;
  };

  const handleEditProfile = async () => {
    if (!user) {
      setToastMessage('User not logged in.');
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setIsSaving(true);

    const updatedData = {
      fullName: name,
      email,
      profileImage: imageUri,
      phone,
    };
    try {
      await updateUserData(user.uid, updatedData);
      await refreshUser();
      setToastMessage('Profile updated successfully!');
      navigation.goBack();
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
          <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save'}</Text>
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
            style={[styles.input, nameError && styles.inputError]}
            value={name}
            onChangeText={text => {
              setName(text);
              setNameError('');
            }}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
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
            editable={false} // Email typically not editable
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, phoneError && styles.inputError]}
            value={phone}
            onChangeText={text => {
              setPhone(text);
              setPhoneError('');
            }}
            placeholder="Enter your phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10} // Ensure phone number is max 10 digits
          />
          {phoneError ? (
            <Text style={styles.errorText}>{phoneError}</Text>
          ) : null}
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
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  saveText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: primaryColor,
  },
  scrollContent: {
    paddingVertical: 30,
    paddingHorizontal: 25,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E0E0E0',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  editImageIcon: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: primaryColor,
    padding: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 15,
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 18,
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
    fontSize: 17,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
