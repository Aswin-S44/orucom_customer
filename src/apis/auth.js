import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { DEFAULT_AVATAR } from '../constants/images';

export const signup = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;
    await firestore().collection('customers').doc(user.uid).set({
      uid: user.uid,
      fullName: '',
      phone: '',
      email,
      createdAt: firestore.FieldValue.serverTimestamp(),
      about: '',
      profileImage: DEFAULT_AVATAR,
      fcmToken: null,
      emailVerified: false,
    });
    return user;
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw error;
  }
};
