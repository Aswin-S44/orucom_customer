import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // store user data
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //     // Listen for auth state changes
  //     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //         if (firebaseUser) {
  //             // Fetch Firestore user profile
  //             const docRef = doc(db, "shop-owners", firebaseUser.uid);
  //             const docSnap = await getDoc(docRef);

  //             if (docSnap.exists()) {
  //                 setUser({ ...firebaseUser, ...docSnap.data() });
  //             } else {
  //                 setUser(firebaseUser);
  //             }
  //         } else {
  //             setUser(null);
  //         }
  //         setLoading(false);
  //     });

  //     return unsubscribe;
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      if (loading) {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [loading]);

  const logout = () => {
    setUser(null);
    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
