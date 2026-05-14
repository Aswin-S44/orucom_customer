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
      colors={[primaryColor, '#A80E5A']}
      style={styles.container}
    >
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <Image
        source={require('../../assets/images/splash_logo.png')}
        style={styles.welcomeImage}
      />
      <Text style={styles.title}>Beauty Parlour Booking App</Text>
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
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 60,
    lineHeight: 36,
    letterSpacing: 0.3,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 28,
    width: '90%',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 5,
  },
  signInButtonText: {
    color: '#D41172',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 15,
    paddingHorizontal: 28,
    width: '90%',
    alignItems: 'center',
    borderRadius: 50,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  welcomeImage: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
});

export default WelcomeScreen;
