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
import { lightPurple, primaryColor, white } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_SIGNIN_URL } from '../../services/apis';

const SigninWithGoogleScreen = ({ navigation }) => {
  const { refreshUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

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
    <LinearGradient
      colors={[primaryColor, lightPurple]}
      style={styles.container}
    >
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <View style={styles.contentContainer}>
        <Image
          source={require('../../assets/images/splash_logo.png')}
          style={styles.welcomeImage}
        />
        <Text style={styles.title}>Orucom</Text>
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
  welcomeImage: { width: 125, height: 125, borderRadius: 12 },
  title: {
    fontSize: 30,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 60,
  },
  signInButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  googleIcon: { width: 24, height: 24, marginRight: 10 },
  signInButtonText: { color: primaryColor, fontSize: 16, fontWeight: 'bold' },
  emailLinkContainer: { marginVertical: 15 },
  emailLinkText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footerContainer: { marginTop: 15, width: '90%' },
  footerText: { color: '#fff', fontSize: 13, textAlign: 'center' },
  linkText: {
    color: '#2768F5',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { opacity: 0.7 },
});

export default SigninWithGoogleScreen;
