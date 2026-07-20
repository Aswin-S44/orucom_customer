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
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider } from '@react-native-firebase/auth';
import { AuthContext } from '../../context/AuthContext';
import { GOOGLE_ICON } from '../../constants/images';
import { primaryColor, white } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLIENT_ID, GOOGLE_SIGNIN_URL } from '../../services/apis';

const SigninWithGoogleScreen = ({ navigation }) => {
  const { refreshUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: CLIENT_ID,
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

  async function onGoogleButtonPress() {
    setLoading(true);
    try {
      const signInResult = await GoogleSignin.signIn();
      const googleIdToken = signInResult.data?.idToken || signInResult.idToken;
      if (!googleIdToken) throw new Error('No Google ID token received');

      const googleCredential = GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const firebaseIdToken = await userCredential.user.getIdToken();

      const response = await fetch(GOOGLE_SIGNIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: firebaseIdToken,
          userType: 'customer',
        }),
      });

      const backendData = await response.json();

      if (!backendData.success)
        throw new Error(backendData.message || 'Login failed');

      await AsyncStorage.setItem('token', backendData.data.token);
      await refreshUser();
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0D0618', '#D41172']} style={styles.container}>
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
              Terms of Service
            </Text>{' '}
            and acknowledge our
            <Text
              style={styles.linkText}
              onPress={() =>
                openLink(
                  'https://www.nominoinnovations.com/p/orucom-privacy-policy.html',
                )
              }
            >
              {' '}
              Privacy Policy
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
  signInButtonText: {
    color: '#D41172',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
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
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
  },
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
