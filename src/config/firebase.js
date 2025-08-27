import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyChj19NZ-e9hrP2XU2hAm6VBJ3sj4ek-zg',
  authDomain: 'beautysaloonapp-cc0cf.firebaseapp.com',
  projectId: 'beautysaloonapp-cc0cf',
  storageBucket: 'beautysaloonapp-cc0cf.firebasestorage.app',
  messagingSenderId: '583572822214',
  appId: '1:583572822214:web:d3e446614d231e90869fc7',
  measurementId: 'G-NDD66FDQFD',
};
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
