import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { WEB_CLIENT_ID } from '@env';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';

import { AuthContext } from '../../context/AuthContext';
import { Image } from 'react-native';
import { GOOGLE_ICON } from '../../constants/images';
import { lightPurple, primaryColor, white } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateRandomUid } from '../../utils/utils';
import { DEFAULT_AVATAR } from '../../constants/images';
import { generateRandomName } from '../../utils/utils';

const SigninWithGoogleScreen = () => {
  const { refreshUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  async function onGoogleButtonPress() {
    setLoading(true);
    setError(null);
    try {
      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult.data?.idToken || signInResult.idToken;
      if (!idToken) throw new Error('No ID token found');
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const firebaseUser = userCredential.user;

      const shopOwnerSnap = await firestore()
        .collection('shop-owners')
        .doc(firebaseUser.uid)
        .get();

      const [customer] = await Promise.all([
        firestore()
          .collection('customers')
          .where('email', '==', firebaseUser.email)
          .get()
          .then(snapshot => (snapshot.empty ? null : snapshot.docs[0].data())),
      ]);

      let uid = customer
        ? customer.uid
        : shopOwnerSnap.exists
        ? generateRandomUid()
        : firebaseUser.uid;

      const customerRef = firestore().collection('customers').doc(uid);

      let updateData = {
        uid,
        fullName: firebaseUser.displayName || generateRandomName(),
        phone: '',
        email: firebaseUser.email,
        createdAt: firestore.FieldValue.serverTimestamp(),
        profileImage: firebaseUser.photoURL || DEFAULT_AVATAR,
        fcmToken: null,
        emailVerified: firebaseUser.emailVerified,
        otp: null,
      };

      await customerRef.set(updateData);

      await AsyncStorage.setItem('user_uid', uid);

      await signInWithCredential(getAuth(), googleCredential);
      refreshUser();

      return firebaseUser;
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={[primaryColor, lightPurple]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <Image
        source={require('../../assets/images/splash_logo.png')}
        style={styles.welcomeImage}
      />
      <Text style={styles.title}>Beauty Customer App</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={onGoogleButtonPress}
          disabled={loading}
        >
          <>
            <Image source={{ uri: GOOGLE_ICON }} style={styles.googleIcon} />
            <Text style={styles.signInButtonText}>Sign in with Google</Text>
          </>
        </TouchableOpacity>
      </View>

      <Modal visible={!!error} transparent animationType="fade">
        <View style={styles.errorOverlay}>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setError(null)}
            >
              <Text style={styles.errorButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={white} />
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  signInButtonText: {
    color: primaryColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: white,
    marginTop: 10,
    fontSize: 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SigninWithGoogleScreen;
