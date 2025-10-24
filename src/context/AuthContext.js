import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsEmailVerified(firebaseUser.emailVerified);
        setUserId(firebaseUser.uid);
        await AsyncStorage.setItem('user_uid', firebaseUser.uid);
        try {
          const docSnap = await firestore()
            .collection('customers')
            .doc(firebaseUser.uid)
            .get();
          if (docSnap.exists) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
          }
        } catch {
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsEmailVerified(false);
        setUserId(null);
        await AsyncStorage.removeItem('user_uid');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth().signOut();
    setUser(null);
    setUserData(null);
    setIsEmailVerified(false);
    setUserId(null);
    await AsyncStorage.removeItem('user_uid');
  };

  const refreshUser = async () => {
    const firebaseUser = auth().currentUser;
    if (firebaseUser) {
      await firebaseUser.reload();
      setUser(auth().currentUser);
      setIsEmailVerified(auth().currentUser.emailVerified);
      setUserId(auth().currentUser.uid);
      try {
        const docSnap = await firestore()
          .collection('customers')
          .doc(firebaseUser.uid)
          .get();
        if (docSnap.exists) setUserData(docSnap.data());
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        logout,
        loading,
        setLoading,
        isEmailVerified,
        refreshUser,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const verifyOtp = async (email, otp) => {
  try {
    const snapshot = await firestore()
      .collection('customers')
      .where('email', '==', email)
      .get();

    if (snapshot.empty) {
      return { success: false, message: 'No user found with this email' };
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.otp && userData.otp === otp) {
      return {
        success: true,
        message: 'OTP verified successfully',
        userData: userData,
      };
    }

    return { success: false, message: 'Invalid OTP' };
  } catch (error) {
    return {
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    };
  }
};
