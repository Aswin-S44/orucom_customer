import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { DEFAULT_AVATAR } from '../constants/images';
import { BACKEND_URL, USER_TYPES } from '../constants/variables';
import axios from 'axios';
import { generateRandomName } from '../utils/utils';

export const signup = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;
    await firestore().collection('customers').doc(user.uid).set({
      uid: user.uid,
      fullName: generateRandomName(),
      phone: '',
      email,
      createdAt: firestore.FieldValue.serverTimestamp(),
      profileImage: DEFAULT_AVATAR,
      fcmToken: null,
      emailVerified: false,
      otp: '123456',
    });

    // Promise.allSettled([
    //   axios.post(
    //     `https://beauty-parlor-app-backend.onrender.com/api/v1/user/send-otp`,
    //     {
    //       email,
    //       userType: USER_TYPES.CUSTOMER,
    //     },
    //   ),
    // ]).then(results => {
    //   results.forEach(r => {
    //     if (r.status === 'rejected') {
    //       console.log(
    //         'OTP API ERROR:',
    //         r.reason.response?.data || r.reason.message,
    //       );
    //     } else {
    //       console.log('OTP API SUCCESS:', r.value.data);
    //     }
    //   });
    // });

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

export const resentOTP = async email => {
  console.log('CLICKED--------------', email ? email : 'no email');
  const res = await axios.post(
    `https://beauty-parlor-app-backend.onrender.com/api/v1/user/send-otp`,
    {
      email,
      userType: USER_TYPES.CUSTOMER,
    },
  );
  console.log('RESET OTP RES==================', res ? res : 'no res');
};
