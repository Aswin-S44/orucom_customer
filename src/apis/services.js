import auth from '@react-native-firebase/auth';
import firestore, {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from '@react-native-firebase/firestore';
import axios from 'axios';
import { BACKEND_URL, NOTIFICATION_TYPES } from '../constants/variables';

import {
  GOOGLE_MAPS_API_KEY,
  // CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_DOC,
} from '@env';
import { DEFAULT_AVATAR } from '../constants/images';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_DOC}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = 'cloudinary_react';

// export const getAllNearbyParlors = async () => {
//   const querySnapshot = await firestore()
//     .collection('shop-owners')
//     .where('isOnboarded', '==', true)
//     .where('profileCompleted', '==', true)
//     .get();

//   return querySnapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// };

export const getAllNearbyParlors = async onUpdate => {
  return firestore()
    .collection('shop-owners')
    .where('isOnboarded', '==', true)
    .where('profileCompleted', '==', true)
    .onSnapshot(snapshot => {
      const parlors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      onUpdate(parlors);
    });
};

export const getAllParlours = async () => {
  const shopSnapshot = await firestore()
    .collection('shop-owners')
    .where('isOnboarded', '==', true)
    .where('profileCompleted', '==', true)
    .get();

  const shops = shopSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  const shopIds = shops.map(shop => shop.uid);

  const [servicesSnapshot, offersSnapshot, expertsSnapshot] = await Promise.all(
    [
      firestore().collection('services').where('shopId', 'in', shopIds).get(),
      firestore().collection('offers').where('shopId', 'in', shopIds).get(),
      firestore()
        .collection('beauty_experts')
        .where('shopId', 'in', shopIds)
        .get(),
    ],
  );

  const services = servicesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  const offers = offersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  const experts = expertsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return shops.map(shop => ({
    ...shop,
    services: services.filter(s => s.shopId === shop.uid),
    offers: offers.filter(o => o.shopId === shop.uid),
    experts: experts.filter(e => e.shopId === shop.uid),
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
  // console.log('#####################');
  // console.time('firestore1111111111111111');
  const querySnapshot = await firestore()
    .collection('services')
    .where('shopId', '==', shopId)
    .get();
  //console.timeEnd('firestore------------------->');

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

export const createAppointment = async (userId, appointmentData) => {
  try {
    const docRef = await firestore()
      .collection('appointments')
      .add({
        ...appointmentData,
        userId,
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
    const appointmentsQuerySnapshot = await firestore()
      .collection('appointments')
      .where('customerId', '==', customerId)
      .get();

    if (appointmentsQuerySnapshot.empty) return [];

    const expertIds = [
      ...new Set(
        appointmentsQuerySnapshot.docs
          .map(doc => doc.data().expertId)
          .filter(id => id && id.trim() !== ''),
      ),
    ];

    let expertsMap = {};
    if (expertIds.length > 0) {
      const expertsQuerySnapshot = await firestore()
        .collection('beauty_experts')
        .where(firestore.FieldPath.documentId(), 'in', expertIds)
        .get();

      expertsMap = Object.fromEntries(
        expertsQuerySnapshot.docs.map(doc => [
          doc.id,
          { id: doc.id, ...doc.data() },
        ]),
      );
    }

    return appointmentsQuerySnapshot.docs.map(appointmentDoc => {
      const data = appointmentDoc.data();
      return {
        id: appointmentDoc.id,
        ...data,
        expert: expertsMap[data.expertId] || null,
      };
    });
  } catch (error) {
    console.error('Error fetching appointments with expert data:', error);
    throw error;
  }
};

// export const getAppointmentsByCustomerId = async customerId => {
//   try {
//     const appointmentsQuerySnapshot = await firestore()
//       .collection('appointments')
//       .where('customerId', '==', customerId)
//       .get();

//     if (appointmentsQuerySnapshot.empty) return [];

//     const expertIds = [
//       ...new Set(
//         appointmentsQuerySnapshot.docs
//           .map(doc => doc.data().expertId)
//           .filter(id => id && id.trim() !== ''),
//       ),
//     ];

//     let expertsMap = {};
//     if (expertIds.length > 0) {
//       const expertsQuerySnapshot = await firestore()
//         .collection('beauty_experts')
//         .where(firestore.FieldPath.documentId(), 'in', expertIds)
//         .get();

//       expertsMap = Object.fromEntries(
//         expertsQuerySnapshot.docs.map(doc => [
//           doc.id,
//           { id: doc.id, ...doc.data() },
//         ]),
//       );
//     }

//     return appointmentsQuerySnapshot.docs.map(appointmentDoc => {
//       const data = appointmentDoc.data();
//       return {
//         id: appointmentDoc.id,
//         ...data,
//         expert: expertsMap[data.expertId] || null,
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching appointments with expert data:', error);
//     throw error;
//   }
// };

// export const getAppointmentsByCustomerId = async customerId => {
//   try {
//     const querySnapshot = await firestore()
//       .collection('appointments')
//       .where('customerId', '==', customerId)
//       .get();

//     const results = await Promise.all(
//       querySnapshot.docs.map(async appointmentDoc => {
//         const appointmentData = appointmentDoc.data();
//         const expertId = appointmentData.expertId;

//         let expertData = null;
//         if (expertId) {
//           const expertSnap = await firestore()
//             .collection('beauty_experts')
//             .doc(expertId)
//             .get();
//           if (expertSnap.exists) {
//             expertData = { id: expertSnap.id, ...expertSnap.data() };
//           }
//         }

//         return {
//           id: appointmentDoc.id,
//           ...appointmentData,
//           expert: expertData,
//         };
//       }),
//     );

//     return results;
//   } catch (error) {
//     console.error('Error fetching appointments with expert data:', error);
//     throw error;
//   }
// };

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
// export const sendAppointmentNofification = async (
//   customerId,
//   shopId,
//   appointmentType,
//   appointmentId = null,
// ) => {
//   try {
//     const url = `${BACKEND_URL}/api/v1/user/appointment`;
//     const res = await axios.post(url, {
//       customerId,
//       shopId,
//       appointmentType,
//     });
//   } catch (error) {
//     console.log('Error whilel sending notification : ', error);
//   }
// };

// export const getCustomerById = async id => {
//   try {
//     const docSnap = await firestore().collection('customers').doc(id).get();

//     if (docSnap.exists) {
//       return { id: docSnap.id, ...docSnap.data() };
//     } else {
//       throw new Error('No such cusstomer exists');
//     }
//   } catch (error) {
//     throw error;
//   }
// };

export const getCustomerById = async id => {
  try {
    const docSnap = await firestore().collection('customers').doc(id).get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // It's often better to return null or an empty object for "not found"
      // instead of throwing an error, unless it's an exceptional case.
      // The calling code can then handle the null/empty gracefully.
      return null;
    }
  } catch (error) {
    console.error('Error fetching customer by ID:', error); // Log the error
    throw error; // Re-throw to be caught by the UI component
  }
};

export const updateUserData = async (uid, updateData) => {
  try {
    if (
      updateData.profileImage &&
      typeof updateData.profileImage === 'string' &&
      (updateData.profileImage.startsWith('file://') ||
        updateData.profileImage.startsWith('data:image/'))
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

// export const createNotification = async (fromId, toId, appointmentId) => {
//   try {
//     const notificationData = {
//       fromId,
//       toId,
//       notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
//       createdAt: new Date(),
//       isRead: false,
//       message: 'Sent an appointment request',
//       appointmentId,
//     };

//     const docRef = await firestore()
//       .collection('notifications')
//       .add(notificationData);

//     return {
//       success: true,
//       id: docRef.id,
//       message: 'notification created successfully',
//     };
//   } catch (error) {
//     console.error('Error creating appointment:', error);
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// };

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

export const getNotificationsByCustomerId = userId => {
  return new Promise(resolve => {
    const unsubscribe = firestore()
      .collection('notifications')
      .where('toId', '==', userId)
      .orderBy('createdAt', 'desc') // Order by createdAt for efficiency
      .onSnapshot(
        querySnapshot => {
          if (querySnapshot.empty) {
            resolve([]);
            return;
          }

          const notifications = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              shop: {
                parlourName: data.fromShopName || '',
                profileImage: data.fromShopProfileImage || DEFAULT_AVATAR,
              },
            };
          });

          resolve(notifications);
        },
        () => resolve([]),
      );

    return unsubscribe;
  });
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

export const deleteNotificationById = async id => {
  try {
    const notificationRef = firestore().collection('notifications').doc(id);
    await notificationRef.delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
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

export const getReviews = async (placeId, page = 0) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const res = await axios.get(url);
    if (res?.data?.result) {
      return res.data.result;
    } else {
      return { rating: 0, reviews: [] };
    }
  } catch (error) {
    return { rating: 0, reviews: [] };
  }
};

export const getOfferByServiceAndShop = async (serviceId, shopId) => {
  try {
    const querySnapshot = await firestore()
      .collection('offers')
      .where('serviceId', '==', serviceId)
      .where('shopId', '==', shopId)
      .get();

    if (!querySnapshot.empty) {
      const offerDoc = querySnapshot.docs[0];
      return { id: offerDoc.id, ...offerDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching offer:', error);
    return null;
  }
};

export const getGalleryImages = async (placeId, page = 0) => {
  //console.log('###############');
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const photos = data.result.photos || [];

    const photoUrls = photos.map(
      p =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`,
    );

    let galleryImages = [];

    if (photoUrls && photoUrls.length > 0) {
      galleryImages = photoUrls;
    }

    return galleryImages;
  } catch (error) {
    return { rating: 0, reviews: [] };
  }
};

// export const createAppointment = async (userId, appointmentData) => {
//   try {
//     const docRef = await firestore()
//       .collection('appointments')
//       .add({
//         ...appointmentData,
//         userId,
//         createdAt: firestore.FieldValue.serverTimestamp(),
//       });
//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error('Error creating appointment:', error);
//     return { success: false };
//   }
// };

// export const createAppointment = async (userId, appointmentData) => {
//   try {
//     const docRef = firestore().collection('appointments').doc();
//     docRef.set({
//       ...appointmentData,
//       userId,
//       createdAt: firestore.FieldValue.serverTimestamp(),
//     });
//     return { success: true, id: docRef.id }; // immediately return ID without waiting for network
//   } catch (error) {
//     console.error('Error creating appointment:', error);
//     return { success: false };
//   }
// };

// await firestore()
// .collection(COLLECTIONS.BEAUTY_EXPERTS)
// .add({
//   shopId: shopId,
//   ...data,
//   imageUrl,
//   createdAt: new Date(),
// });

// export const updateSlotInFirestore = async (slotId, slotData) => {
//   try {
//     await firestore()
//       .collection('slots')
//       .doc(slotId)
//       .update({
//         ...slotData,
//         updatedAt: new Date(),
//       });
//     return { success: true };
//   } catch (error) {
//     console.error('Error updating slot:', error);
//     return { success: false };
//   }
// };

// export const updateSlotInFirestore = (slotId, slotData) => {
//   try {
//     firestore()
//       .collection('slots')
//       .doc(slotId)
//       .update({
//         ...slotData,
//         updatedAt: firestore.FieldValue.serverTimestamp(),
//       });
//     return { success: true }; // return immediately without waiting for network
//   } catch (error) {
//     console.error('Error updating slot:', error);
//     return { success: false };
//   }
// };

// export const createNotification = async (fromId, toId, appointmentId) => {
//   try {
//     const docRef = await firestore().collection('notifications').add({
//       fromId,
//       toId,
//       notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
//       createdAt: new Date(),
//       isRead: false,
//       message: 'Sent an appointment request',
//       appointmentId,
//     });
//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error('Error creating notification:', error);
//     return { success: false };
//   }
// };

// export const createNotification = (fromId, toId, appointmentId) => {
//   firestore().collection('notifications').add({
//     fromId,
//     toId,
//     notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
//     createdAt: new Date(),
//     isRead: false,
//     message: 'Sent an appointment request',
//     appointmentId,
//   });
//   // Return immediately without waiting
//   return { success: true };
// };

// export const sendAppointmentNofification = async (
//   customerId,
//   shopId,
//   appointmentType,
//   appointmentId = null,
// ) => {
//   try {
//     await axios.post(`${BACKEND_URL}/api/v1/user/appointment`, {
//       customerId,
//       shopId,
//       appointmentType,
//       appointmentId,
//     });
//   } catch (error) {
//     console.log('Error sending notification:', error);
//   }
// };

// export const sendAppointmentNotification = (
//   customerId,
//   shopId,
//   appointmentType,
//   appointmentId = null,
// ) => {
//   axios
//     .post(`${BACKEND_URL}/api/v1/user/appointment`, {
//       customerId,
//       shopId,
//       appointmentType,
//       appointmentId,
//     })
//     .catch(error => {
//       console.log('Error sending notification:', error);
//     });
// };
// export const createAppointment = async (userId, appointmentData) => {
//   try {
//     const docRef = firestore().collection('appointments').doc();
//     await docRef.set({
//       ...appointmentData,
//       userId,
//       createdAt: firestore.FieldValue.serverTimestamp(),
//     });
//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error('Error creating appointment:', error);
//     return { success: false, error };
//   }
// };

// export const createAppointment = async (userId, appointmentData) => {
//   try {
//     const docRef = firestore().collection('appointments').doc();

//     await docRef.set({
//       ...appointmentData,
//       userId,
//       createdAt: firestore.FieldValue.serverTimestamp(),
//     });
//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error('Error creating appointment:', error);
//     return { success: false, error };
//   }
// };

// export const createAppointment = async (userId, appointmentData) => {
//   try {
//     console.log('USER ID-------------', userId);
//     console.log('APpointment daa : ---------------', appointmentData);
//     // const docRef = firestore().collection('appointments').doc();

//     console.log('TEST------------------', {
//       ...appointmentData,
//       userId,
//       createdAt: firestore.FieldValue.serverTimestamp(),
//     });

//     // await docRef.set({
//     //   ...appointmentData,
//     //   userId,
//     //   createdAt: firestore.FieldValue.serverTimestamp(),
//     // });

//     await firestore()
//       .collection('appointments')
//       .add({
//         ...appointmentData,
//         userId,
//         createdAt: firestore.FieldValue.serverTimestamp(),
//       });

//     return { success: true };
//   } catch (error) {
//     console.error('Error creating appointment:', error);
//     return { success: false, error };
//   }
// };

// export const updateSlotInFirestore = (slotId, slotData) => {
//   firestore()
//     .collection('slots')
//     .doc(slotId)
//     .update({
//       ...slotData,
//       updatedAt: firestore.FieldValue.serverTimestamp(),
//     });
//   return { success: true };
// };

export const updateSlotInFirestore = (slotId, slotData) => {
  firestore()
    .collection('slots')
    .doc(slotId)
    .update({
      ...slotData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  return { success: true };
};

// export const createNotification = (
//   fromId,
//   toId,
//   appointmentId,
//   customerName,
//   profileImage,
// ) => {
//   firestore()
//     .collection('notifications')
//     .add({
//       fromId,
//       toId,
//       notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
//       createdAt: firestore.FieldValue.serverTimestamp(),
//       isRead: false,
//       message: ` ${customerName} Sent an appointment request`,
//       appointmentId,
//       profileImage,
//     });
//   return { success: true };
// };

export const createNotification = (
  fromId,
  toId,
  appointmentId,
  customerName,
  profileImage,
) => {
  firestore()
    .collection('notifications')
    .add({
      fromId,
      toId,
      notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
      createdAt: firestore.FieldValue.serverTimestamp(),
      isRead: false,
      message: `${customerName} sent an appointment request`,
      appointmentId,
      profileImage,
    });
  return { success: true };
};

// export const sendAppointmentNotification = async (
//   customerId,
//   shopId,
//   appointmentType,
//   appointmentId = null,
// ) => {
//   await axios
//     .post(`${BACKEND_URL}/api/v1/user/appointment`, {
//       customerId,
//       shopId,
//       appointmentType,
//       appointmentId,
//     })
//     .catch(error => console.log('Error sending notification:', error));
// };

export const sendAppointmentNotification = async (
  customerId,
  shopId,
  appointmentType,
  appointmentId = null,
) => {
  await axios
    .post(`${BACKEND_URL}/api/v1/user/appointment`, {
      customerId,
      shopId,
      appointmentType,
      appointmentId,
    })
    .catch(error => console.log('Error sending notification:', error));
};

// export const createAppointment = async (
//   userId,
//   appointmentData,
//   profileImage,
//   slotData,
//   customerName,
// ) => {
//   try {
//     const data = {
//       ...appointmentData,
//       userId,
//       createdAt: firestore.FieldValue.serverTimestamp(),
//     };

//     //   firestore()
//     //   .collection('notifications')
//     //   .add({
//     //     fromId,
//     //     toId,
//     //     notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
//     //     createdAt: firestore.FieldValue.serverTimestamp(),
//     //     isRead: false,
//     //     message: `${customerName} sent an appointment request`,
//     //     appointmentId,
//     //     profileImage,
//     //   });
//     // return { success: true };

//     let notificationData = {
//       fromId: userId,
//       toId: appointmentData.shopId,
//       notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
//       createdAt: firestore.FieldValue.serverTimestamp(),
//       isRead: false,
//       message: `${customerName} sent an appointment request`,
//       profileImage,
//     };

//     let body = {
//       appointment: data,
//       notificationData,
//       slotData,
//     };

//     const res = await axios.post(`${BACKEND_URL}/create-appointment`, body);

//     if (res && res.data) {
//       return {
//         success: true,
//         id: res.data?.id,
//         message: 'Appointment created successfully',
//       };
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error('Error creating appointment:', error);
//     return { success: false, error };
//   }
// };
