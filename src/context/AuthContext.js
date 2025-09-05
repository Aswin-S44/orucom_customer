import React, { createContext, useState, useEffect, useContext } from 'react'; // Added useContext
import auth from '@react-native-firebase/auth'; // Changed import
import { auth as firebaseAuth, firestore } from '../config/firebase'; // Make sure path is correct

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // React Native Firebase uses different syntax
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const docSnap = await firestore()
            .collection('shop-owners')
            .doc(firebaseUser.uid)
            .get();

          if (docSnap.exists) {
            setUserData(docSnap.data());
          }
        } catch (err) {
          console.log('Error fetching user data:', err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    auth().signOut();
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userData, logout, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Optional: Create a hook for easier usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
