import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { primaryColor } from '../../constants/colors';
import { signup } from '../../apis/auth';
import auth from '@react-native-firebase/auth';

const SignUpScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    if (
      !submitted &&
      !acceptedTerms &&
      email === '' &&
      password === '' &&
      confirmPassword === ''
    ) {
      setIsFormValid(false);
      return;
    }

    let newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (confirmPassword !== password)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!acceptedTerms)
      newErrors.terms = 'You must accept the terms and privacy policy';

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0 && acceptedTerms);
  }, [email, password, confirmPassword, acceptedTerms, submitted]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (isFormValid) {
      createAccount();
    }
  };

  const createAccount = async () => {
    setIsLoading(true);
    setSignupError('');
    try {
      const user = await signup(email, password);
      if (user) {
        await auth().currentUser.sendEmailVerification();
        navigation.navigate('OTPVerificationScreen', { userEmail: email });
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setSignupError(
          'This email is already in use. Please sign in or use a different email.',
        );
      } else {
        setSignupError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Sign Up</Text>

          {signupError ? (
            <Text style={styles.signupErrorBox}>{signupError}</Text>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View
              style={[
                styles.inputContainer,
                submitted && errors.email && { borderColor: '#D41172' },
              ]}
            >
              <Feather
                name="send"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="demo@gmail.com"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {submitted && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                submitted && errors.password && { borderColor: '#D41172' },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Type Password"
                placeholderTextColor="#888"
                secureTextEntry={securePassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setSecurePassword(!securePassword)}
              >
                <Ionicons
                  name={securePassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {submitted && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View
              style={[
                styles.inputContainer,
                submitted && errors.confirmPassword && { borderColor: '#D41172' },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Type Password"
                placeholderTextColor="#888"
                secureTextEntry={secureConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
              >
                <Ionicons
                  name={
                    secureConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                  }
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {submitted && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <Ionicons
              name={acceptedTerms ? 'checkbox' : 'square-outline'}
              size={22}
              color={acceptedTerms ? primaryColor : '#888'}
            />
            <Text style={styles.termsText}>
              I accept the{' '}
              <Text style={styles.termsLink}>policy and privacy</Text>
            </Text>
          </TouchableOpacity>
          {submitted && errors.terms && (
            <Text style={styles.errorText}>{errors.terms}</Text>
          )}

          <TouchableOpacity
            style={[
              styles.createButton,
              (!isFormValid || isLoading) && { backgroundColor: '#94A3B8', shadowOpacity: 0, elevation: 0 },
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Please wait....' : 'CREATE ACCOUNT'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {isLoading && (
          <Modal transparent animationType="fade" visible={isLoading}>
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#D41172' },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontSize: 18, marginLeft: 5, fontWeight: '500' },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#FFFBF6',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#160B26',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  signupErrorBox: {
    color: '#D41172',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF0F7',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0EF',
    fontWeight: '500',
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#1A1A1A' },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 5,
  },
  termsText: { marginLeft: 10, fontSize: 14, color: '#6B7280' },
  termsLink: { color: '#D41172', fontWeight: '600' },
  createButton: {
    backgroundColor: '#D41172',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#D41172',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
  },
  signInButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  errorText: { color: '#D41172', fontSize: 13, marginTop: 5 },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignUpScreen;
