import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GET_ME_URL } from '../services/apis'; // Ensure this points to your Node.js /me route

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const response = await fetch(GET_ME_URL, {
        method: 'GET',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('RESULT------------------', result);

      if (response.ok && result.user) {
        setUserData(result.user);
      } else {
        await logout();
      }
    } catch (error) {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    await auth().signOut();
    await AsyncStorage.removeItem('token');
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        logout,
        loading,
        setLoading,
        refreshUser,
        userId: userData?.id || userData?.uid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
