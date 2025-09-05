// import { initializeApp } from 'firebase/app';
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// const firebaseConfig = {
//   apiKey: 'AIzaSyChj19NZ-e9hrP2XU2hAm6VBJ3sj4ek-zg',
//   authDomain: 'beautysaloonapp-cc0cf.firebaseapp.com',
//   projectId: 'beautysaloonapp-cc0cf',
//   storageBucket: 'beautysaloonapp-cc0cf.firebasestorage.app',
//   messagingSenderId: '583572822214',
//   appId: '1:583572822214:web:d3e446614d231e90869fc7',
//   measurementId: 'G-NDD66FDQFD',
// };
// const app = initializeApp(firebaseConfig);

// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage),
// });

// const db = getFirestore(app);
// const storage = getStorage(app);

// export { auth, db, storage };

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import { firebase } from '@react-native-firebase/app';

// If you need to manually initialize (optional - usually auto-initialized)
// Make sure you have google-services.json (Android) and GoogleService-Info.plist (iOS)
/*
const firebaseConfig = {
  // your config here
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
*/

// Export the Firebase services
export { auth, firestore, storage, messaging, firebase };

// Get the default app
const app = firebase.app();
export { app };
