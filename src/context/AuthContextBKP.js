import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false); // New state for email verification

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsEmailVerified(firebaseUser.emailVerified); // Set verification status from Firebase Auth

        try {
          const docSnap = await firestore()
            .collection('customers') // Changed to 'customers' based on your signup function
            .doc(firebaseUser.uid)
            .get();

          if (docSnap.exists) {
            const data = docSnap.data();
            setUserData(data);
            // Optionally, if you rely solely on Firestore for verification status:
            // setIsEmailVerified(data.emailVerified || firebaseUser.emailVerified);
          } else {
            // Handle case where user document might not exist immediately after signup
            setUserData(null);
          }
        } catch (err) {
          console.log('Error fetching user data:', err);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    auth().signOut();
    setUser(null);
    setUserData(null);
    setIsEmailVerified(false);
  };

  // Function to refresh user and verification status, useful after OTP
  const refreshUser = async () => {
    const firebaseUser = auth().currentUser;
    if (firebaseUser) {
      await firebaseUser.reload(); // Reloads the latest user data from Firebase
      setUser(auth().currentUser); // Update user state with reloaded data
      setIsEmailVerified(auth().currentUser.emailVerified);

      try {
        const docSnap = await firestore()
          .collection('customers')
          .doc(firebaseUser.uid)
          .get();
        if (docSnap.exists) {
          setUserData(docSnap.data());
          // Ensure your Firestore `emailVerified` flag is also updated
          // setIsEmailVerified(docSnap.data().emailVerified || auth().currentUser.emailVerified);
        }
      } catch (err) {
        console.log('Error refreshing user data:', err);
      }
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
        refreshUser, // Expose refreshUser for OTP screen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
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
