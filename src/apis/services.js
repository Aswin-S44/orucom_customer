import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import { BACKEND_URL, NOTIFICATION_TYPES } from '../constants/variables';
const CLOUDINARY_URL =
  'https://api.cloudinary.com/v1_1/personalprojectaswins/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'cloudinary_react';

export const getAllParlours = async () => {
  const querySnapshot = await firestore()
    .collection('shop-owners')
    .where('isOnboarded', '==', true)
    .get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getParlourById = async id => {
  try {
    const docSnap = await firestore().collection('shop-owners').doc(id).get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('No such parlour exists');
    }
  } catch (error) {
    throw error;
  }
};

export const getServicesByShop = async shopId => {
  const querySnapshot = await firestore()
    .collection('services')
    .where('shopId', '==', shopId)
    .get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getServiceById = async (shopId, serviceId) => {
  const docSnap = await firestore().collection('services').doc(serviceId).get();

  if (docSnap.exists && docSnap.data().shopId === shopId) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createAppointment = async appointmentData => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const docRef = await firestore()
      .collection('appointments')
      .add({
        ...appointmentData,
        userId: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      id: docRef.id,
      message: 'Appointment created successfully',
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getOffersByShop = async shopId => {
  const querySnapshot = await firestore()
    .collection('offers')
    .where('shopId', '==', shopId)
    .get();

  const offers = await Promise.all(
    querySnapshot.docs.map(async offerDoc => {
      const offerData = offerDoc.data();
      const serviceSnap = await firestore()
        .collection('services')
        .doc(offerData.serviceId)
        .get();

      return {
        id: offerDoc.id,
        ...offerData,
        service: serviceSnap.exists
          ? { id: serviceSnap.id, ...serviceSnap.data() }
          : null,
      };
    }),
  );

  return offers;
};

export const getExpertsByShopId = async shopId => {
  const querySnapshot = await firestore()
    .collection('beauty_experts')
    .where('shopId', '==', shopId)
    .get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getAppointmentsByCustomerId = async customerId => {
  try {
    const querySnapshot = await firestore()
      .collection('appointments')
      .where('customerId', '==', customerId)
      .get();

    const results = await Promise.all(
      querySnapshot.docs.map(async appointmentDoc => {
        const appointmentData = appointmentDoc.data();
        const expertId = appointmentData.expertId;

        let expertData = null;
        if (expertId) {
          const expertSnap = await firestore()
            .collection('beauty_experts')
            .doc(expertId)
            .get();
          if (expertSnap.exists) {
            expertData = { id: expertSnap.id, ...expertSnap.data() };
          }
        }

        return {
          id: appointmentDoc.id,
          ...appointmentData,
          expert: expertData,
        };
      }),
    );

    return results;
  } catch (error) {
    console.error('Error fetching appointments with expert data:', error);
    throw error;
  }
};

export const searchShopsByService = async searchTerm => {
  try {
    const servicesSnapshot = await firestore().collection('services').get();
    const allServices = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filteredServices = allServices.filter(
      service =>
        service.serviceName &&
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const shopIds = [
      ...new Set(filteredServices.map(service => service.shopId)),
    ];

    if (shopIds.length === 0) return [];

    const shopsPromises = shopIds.map(async shopId => {
      const shopOwner = await getShopOwnerByShopId(shopId);
      if (shopOwner) {
        const services = await getServicesByShopId(shopId);
        return {
          id: shopId,
          ...shopOwner,
          services,
        };
      }
      return null;
    });

    const shops = await Promise.all(shopsPromises);
    return shops.filter(shop => shop !== null);
  } catch (error) {
    console.error('Search shops by service error:', error);
    throw error;
  }
};

export const searchShops = async searchTerm => {
  try {
    const shopsSnapshot = await firestore().collection('shop-owners').get();
    const allShops = shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (!searchTerm) {
      return allShops;
    }

    const filteredShops = allShops.filter(
      shop =>
        shop.parlourName &&
        shop.parlourName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return filteredShops;
  } catch (error) {
    console.error('Search shops error:', error);
    throw error;
  }
};

const getShopOwnerByShopId = async shopId => {
  try {
    const shopsSnapshot = await firestore().collection('shop-owners').get();
    const allShops = shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return allShops.find(shop => shop.uid === shopId || shop.id === shopId);
  } catch (error) {
    console.error('Get shop owner error:', error);
    return null;
  }
};

const getServicesByShopId = async shopId => {
  try {
    const servicesSnapshot = await firestore().collection('services').get();
    const allServices = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return allServices.filter(service => service.shopId === shopId);
  } catch (error) {
    console.error('Get services error:', error);
    return [];
  }
};
export const sendAppointmentNofification = async (customerId, shopId) => {
  try {
    const res = await axios.post(
      `https://beauty-parlor-app-backend.onrender.com/api/v1/user/appointment`,
      {
        customerId,
        shopId,
      },
    );
    console.log('notification res---------------', res ? res : 'no res')
  } catch (error) {
    console.log('Error whilel sending notification : ', error);
  }
};

export const getCustomerById = async id => {
  try {
    const docSnap = await firestore().collection('customers').doc(id).get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('No such cusstomer exists');
    }
  } catch (error) {
    throw error;
  }
};

export const updateUserData = async (uid, updateData) => {
  try {
    console.log('update data---------', updateData);
    if (
      updateData.profileImage &&
      typeof updateData.profileImage === 'string' &&
      updateData.profileImage.startsWith('file://')
    ) {
      const formData = new FormData();
      formData.append('file', {
        uri: updateData.profileImage,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      console.log(
        'responseData---------',
        responseData ? responseData : 'no responseData',
      );
      if (responseData.secure_url) {
        updateData.profileImage = responseData.secure_url;
      } else {
        return false;
      }
    }

    await firestore().collection('customers').doc(uid).update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

export const createNotification = async notification => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const notificationData = {
      fromId: '7UMCTcRXfNPOi3xNd3ha297qhJF2',
      toId: 'GbsbBUL7GBVqfH2gIdPtjwUao0n1',
      notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
      createdAt: new Date(),
      isRead: false,
      message: 'Sent an appointment request',
    };

    const docRef = await firestore()
      .collection('notifications')
      .add(notificationData);

    return {
      success: true,
      id: docRef.id,
      message: 'notification created successfully',
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};
