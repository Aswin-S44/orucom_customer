import React from 'react';
import { Image } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { lightPurple, primaryColor } from '../../constants/colors';

const WelcomeScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#0D0618', '#D41172']}
      style={styles.container}
    >
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <Image
        source={require('../../assets/images/splash_logo.png')}
        style={styles.welcomeImage}
      />
      <Text style={styles.title}>Beauty Parlour{'\n'}Booking App</Text>
      <Text style={styles.tagline}>Luxury · Style · You</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.signInButtonText}>SIGN IN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signUpButtonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 6,
    lineHeight: 40,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 55,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: '90%',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#D41172',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 10,
  },
  signInButtonText: {
    color: '#D41172',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signUpButton: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: '90%',
    alignItems: 'center',
    borderRadius: 50,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  welcomeImage: {
    width: 110,
    height: 110,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
});

export default WelcomeScreen;
