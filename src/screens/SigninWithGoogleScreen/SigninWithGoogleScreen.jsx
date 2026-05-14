import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  Image,
  Linking,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider } from '@react-native-firebase/auth';
import { AuthContext } from '../../context/AuthContext';
import { GOOGLE_ICON, DEFAULT_AVATAR } from '../../constants/images';
import { lightPurple, primaryColor, white } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateRandomUid, generateRandomName } from '../../utils/utils';
import { GOOGLE_SIGNIN_URL } from '../../services/apis';

// Replace with your actual backend URL
const API_URL = 'https://your-backend-api.com';

const SigninWithGoogleScreen = ({ navigation }) => {
  const { refreshUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '273666754104-8kqhpnril7nlsnvgf7mmddsc1mbf9r91.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  const openLink = async url => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Error', 'Unable to open browser.');
    }
  };

  // async function onGoogleButtonPress() {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const signInResult = await GoogleSignin.signIn();
  //     let idToken = signInResult.data?.idToken || signInResult.idToken;

  //     // Call Node.js Backend
  //     const response = await fetch(GOOGLE_SIGNIN_URL, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         idToken,
  //         userType: 'customer', // Defaulting to customer as per context
  //       }),
  //     });

  //     const backendData = await response.json();

  //     if (!backendData.success) {
  //       throw new Error(backendData.message || 'Backend authentication failed');
  //     }

  //     // Maintain existing Firebase Auth session for Firestore security rules compatibility
  //     const googleCredential = GoogleAuthProvider.credential(idToken);
  //     const userCredential = await auth().signInWithCredential(
  //       googleCredential,
  //     );
  //     const firebaseUser = userCredential.user;

  //     const shopOwnerSnap = await firestore()
  //       .collection('shop-owners')
  //       .doc(firebaseUser.uid)
  //       .get();
  //     const customerSnap = await firestore()
  //       .collection('customers')
  //       .where('email', '==', firebaseUser.email)
  //       .get();

  //     let uid = !customerSnap.empty
  //       ? customerSnap.docs[0].id
  //       : shopOwnerSnap.exists
  //       ? generateRandomUid()
  //       : firebaseUser.uid;
  //     const customerRef = firestore().collection('customers').doc(uid);

  //     await customerRef.set(
  //       {
  //         uid,
  //         fullName: firebaseUser.displayName || generateRandomName(),
  //         phone: '',
  //         email: firebaseUser.email,
  //         createdAt: firestore.FieldValue.serverTimestamp(),
  //         profileImage: firebaseUser.photoURL || DEFAULT_AVATAR,
  //         emailVerified: true,
  //       },
  //       { merge: true },
  //     );

  //     // Store both Backend JWT and UID
  //     await AsyncStorage.setItem('auth_token', backendData.data.token);
  //     await AsyncStorage.setItem('user_uid', uid);
  //     await refreshUser();
  //   } catch (error) {
  //     setError(error.message);
  //     Alert.alert('Sign In Error', error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function onGoogleButtonPress() {
    setLoading(true);
    setError(null);

    try {
      // 1. Google login
      const signInResult = await GoogleSignin.signIn();
      const googleIdToken = signInResult.data?.idToken || signInResult.idToken;

      if (!googleIdToken) {
        throw new Error('No Google ID token received');
      }

      // 2. 🔥 Sign in to Firebase FIRST
      const googleCredential = GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      const firebaseUser = userCredential.user;

      // 3. 🔥 Get Firebase ID token (THIS is what backend needs)
      const firebaseIdToken = await firebaseUser.getIdToken();

      // 4. ✅ Call backend with Firebase token
      const response = await fetch(GOOGLE_SIGNIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: firebaseIdToken, // ✅ FIXED
          userType: 'customer',
        }),
      });

      const backendData = await response.json();

      if (!backendData.success) {
        throw new Error(backendData.message || 'Backend authentication failed');
      }

      // ✅ Continue your existing logic
      const shopOwnerSnap = await firestore()
        .collection('shop-owners')
        .doc(firebaseUser.uid)
        .get();

      const customerSnap = await firestore()
        .collection('customers')
        .where('email', '==', firebaseUser.email)
        .get();

      let uid = !customerSnap.empty
        ? customerSnap.docs[0].id
        : shopOwnerSnap.exists
        ? generateRandomUid()
        : firebaseUser.uid;

      const customerRef = firestore().collection('customers').doc(uid);

      await customerRef.set(
        {
          uid,
          fullName: firebaseUser.displayName || generateRandomName(),
          phone: '',
          email: firebaseUser.email,
          createdAt: firestore.FieldValue.serverTimestamp(),
          profileImage: firebaseUser.photoURL || DEFAULT_AVATAR,
          emailVerified: true,
        },
        { merge: true },
      );

      await AsyncStorage.setItem('auth_token', backendData.data.token);
      await AsyncStorage.setItem('user_uid', uid);

      await refreshUser();
    } catch (error) {
      setError(error.message);
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#0D0618', '#D41172']}
      style={styles.container}
    >
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <View style={styles.contentContainer}>
        <Image
          source={require('../../assets/images/splash_logo.png')}
          style={styles.welcomeImage}
        />
        <Text style={styles.title}>Orucom</Text>
        <Text style={styles.subtitle}>Your beauty, redefined.</Text>
        <TouchableOpacity
          style={[styles.signInButton, loading && styles.disabledButton]}
          onPress={onGoogleButtonPress}
          disabled={loading}
        >
          <Image source={{ uri: GOOGLE_ICON }} style={styles.googleIcon} />
          <Text style={styles.signInButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignIn')}
          style={styles.emailLinkContainer}
        >
          <Text style={styles.emailLinkText}>Sign in with email</Text>
        </TouchableOpacity>
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our{' '}
            <Text
              style={styles.linkText}
              onPress={() =>
                openLink(
                  'https://www.nominoinnovations.com/p/orucom-terms-and-conditions.html',
                )
              }
            >
              Terms
            </Text>{' '}
            and{' '}
            <Text
              style={styles.linkText}
              onPress={() =>
                openLink(
                  'https://www.nominoinnovations.com/p/orucom-privacy-policy.html',
                )
              }
            >
              Privacy
            </Text>
          </Text>
        </View>
      </View>
      <Modal visible={loading} transparent>
        <View style={styles.modalOverlay}>
          <ActivityIndicator size="large" color={white} />
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeImage: {
    width: 120,
    height: 120,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    marginTop: 22,
    marginBottom: 8,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#D41172',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 10,
  },
  googleIcon: { width: 22, height: 22, marginRight: 12 },
  signInButtonText: { color: '#D41172', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  emailLinkContainer: { marginVertical: 18 },
  emailLinkText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingBottom: 2,
  },
  footerContainer: { marginTop: 20, width: '85%' },
  footerText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', lineHeight: 19 },
  linkText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13,6,24,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 55,
    marginTop: 4,
  },
  disabledButton: { opacity: 0.55 },
});

export default SigninWithGoogleScreen;
