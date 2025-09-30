import auth from '@react-native-firebase/auth';
import firestore, {
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from '@react-native-firebase/firestore';
import axios from 'axios';
import { BACKEND_URL, NOTIFICATION_TYPES } from '../constants/variables';
const CLOUDINARY_URL =
  'https://api.cloudinary.com/v1_1/personalprojectaswins/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'cloudinary_react';
import { GOOGLE_MAPS_API_KEY } from '@env';

export const getAllParlours = async () => {
  const querySnapshot = await firestore()
    .collection('shop-owners')
    .where('isOnboarded', '==', true)
    .where('profileCompleted', '==', true)
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
    const shopsSnapshot = await firestore()
      .collection('shop-owners')
      .where('profileCompleted', '==', true)
      .get();
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
    const shopsSnapshot = await firestore()
      .collection('shop-owners')
      .where('profileCompleted', '==', true)
      .get();
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
export const sendAppointmentNofification = async (
  customerId,
  shopId,
  appointmentType,
) => {
  try {
    console.log('CUSSTOMER ID ---------------', customerId);
    console.log('SHOP ID --------------------', shopId);
    await createNotification(customerId, shopId);
    const url = `${BACKEND_URL}/appointment`;
    const res = await axios.post(url, {
      customerId,
      shopId,
      appointmentType,
    });
    console.log('notification res---------------', res ? res : 'no res');
  } catch (error) {
    console.log('Error whilel sending notification : ', error);
  }
};

export const getCustomerById = async id => {
  try {
    console.log('ID===============', id);
    console.log('11111111111111');

    const docSnap = await firestore().collection('customers').doc(id).get();
    console.log('22222222222222');
    console.log('docSnap==============', docSnap);
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
    const customer = await getCustomerById(uid);

    console.log('updateData-------------', updateData);

    console.log(
      'CEHCK-------------------------',
      (updateData.profileImage &&
        typeof updateData.profileImage === 'string' &&
        updateData.profileImage.startsWith('file://')) ||
        updateData.profileImage.startsWith('data:image/'),
    );
    if (
      updateData.profileImage &&
      typeof updateData.profileImage === 'string' &&
      (updateData.profileImage.startsWith('file://') ||
        updateData.profileImage.startsWith('data:image/'))
    ) {
      console.log('*************************');
      const formData = new FormData();
      formData.append('file', {
        uri: updateData.profileImage,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      console.log('=====================');
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      console.log('########################');
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

export const createNotification = async (fromId, toId) => {
  try {
    const user = auth().currentUser;
    console.log('user---------', user);
    if (!user) {
      throw new Error('User not authenticated');
    }

    const notificationData = {
      fromId,
      toId,
      notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
      createdAt: new Date(),
      isRead: false,
      message: 'Sent an appointment request',
    };
    console.log('notificationData------------', notificationData);

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
export const getGalleryImagesByShopId = async shopId => {
  const querySnapshot = await firestore()
    .collection('services')
    .where('shopId', '==', shopId)
    .get();
  const images = [];
  querySnapshot.docs.map((doc, index) => {
    const data = doc.data();
    if (data.imageUrl) {
      images.push({
        id: doc.id, // Use doc.id as a unique key
        image: data.imageUrl,
      });
    }
  });
  return images;
};

export const getExpertsWithShopDetailsByShopId = async expertId => {
  try {
    console.log('expert id : ', expertId);
    const expertDoc = await firestore()
      .collection('beauty_experts')
      .doc(expertId)
      .get();

    if (expertDoc.exists) {
      const expertData = expertDoc.data();
      const shopId = expertData?.shopId;

      if (shopId) {
        const shopOwnerDoc = await firestore()
          .collection('shop-owners')
          .doc(shopId)
          .get();

        if (shopOwnerDoc.exists) {
          return {
            expert: expertData,
            shopDetails: shopOwnerDoc.data(),
          };
        } else {
          console.warn('Shop owner not found for shopId:', shopId);
          return { expert: expertData, shopDetails: null };
        }
      } else {
        console.warn('Expert data does not contain a shopId.');
        return { expert: expertData, shopDetails: null };
      }
    } else {
      console.warn('No expert found with expertId:', expertId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching expert data:', error);
    throw error;
  }
};

export const getNotificationsByCustomerId = async userId => {
  try {
    const querySnapshot = await firestore()
      .collection('notifications')
      .where('toId', '==', userId)
      .get();

    const notifications = await Promise.all(
      querySnapshot.docs.map(async doc => {
        const data = doc.data();
        const shopSnapshot = await firestore()
          .collection('shop_owners')
          .where('uid', '==', data.fromId)
          .limit(1)
          .get();

        const shop = !shopSnapshot.empty
          ? {
              id: shopSnapshot.docs[0].id,
              ...shopSnapshot.docs[0].data(),
            }
          : null;

        return { id: doc.id, ...data, shop };
      }),
    );

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async id => {
  try {
    const notificationRef = firestore().collection('notifications').doc(id);
    const docSnapshot = await notificationRef.get();

    if (!docSnapshot.exists) {
      return { success: false, message: 'Notification not found' };
    }

    await notificationRef.update({
      isRead: true,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating notification:', error);
    return { success: false, error };
  }
};

export const getNotificationsCountByCustomerId = async customerId => {
  try {
    const querySnapshot = await firestore()
      .collection('notifications')
      .where('toId', '==', customerId)
      .where('isRead', '==', false)
      .get();

    return querySnapshot?.size ?? 0;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return 0;
  }
};

export const updateCustomer = async (uid, dataToUpdate) => {
  console.log('UID-----------', uid);
  console.log('data to update--------', dataToUpdate);

  try {
    const db = getFirestore(); // ✅ modular way
    const customerRef = doc(db, 'customers', uid); // ✅ use doc()
    const docSnapshot = await getDoc(customerRef);

    if (!docSnapshot.exists()) {
      return { success: false, message: 'Customer not found' };
    }

    await updateDoc(customerRef, dataToUpdate); // ✅ modular update

    return { success: true };
  } catch (error) {
    console.error('Error updating customer:', error);
    return { success: false, error };
  }
};

export const getReviews = async placeId => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const res = await axios.get(url);
    const reviewResponse = {
      rating: 0,
      reviews: [],
    };
    if (res && res.data && res.data?.result) {
      return res.data.result;
    } else {
      return reviewResponse;
    }
  } catch (error) {
    return error;
  }
};
