import { auth, db } from '../config/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';

// Get all parlours
export const getAllParlours = async () => {
  const q = query(
    collection(db, 'shop-owners'),
    where('isOnboarded', '==', true),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
// Get single parlour by ID
export const getParlourById = async id => {
  try {
    const docRef = doc(db, 'shop-owners', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('No such parlour exists');
    }
  } catch (error) {
    throw error;
  }
};

export const getServicesByShop = async shopId => {
  const q = query(collection(db, 'services'), where('shopId', '==', shopId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getServiceById = async (shopId, serviceId) => {
  const docRef = doc(db, 'services', serviceId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists() && docSnap.data().shopId === shopId) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createAppointment = async appointmentData => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      userId: user.uid,
      createdAt: serverTimestamp(),
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
  const q = query(collection(db, 'offers'), where('shopId', '==', shopId));
  const querySnapshot = await getDocs(q);

  const offers = await Promise.all(
    querySnapshot.docs.map(async offerDoc => {
      const offerData = offerDoc.data();
      const serviceRef = doc(db, 'services', offerData.serviceId);
      const serviceSnap = await getDoc(serviceRef);

      return {
        id: offerDoc.id,
        ...offerData,
        service: serviceSnap.exists()
          ? { id: serviceSnap.id, ...serviceSnap.data() }
          : null,
      };
    }),
  );

  return offers;
};

// export const getServicesByShopId = async shopId => {
//   const q = query(
//     collection(db, 'services'),
//     where('shopId', '==', shopId),
//     orderBy('serviceName'),
//   );

//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// };

export const getExpertsByShopId = async shopId => {
  const q = query(
    collection(db, 'beauty_experts'),
    where('shopId', '==', shopId),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// export const getShopOwnerByShopId = async shopId => {
//   const q = query(collection(db, 'shop-owners'), where('uid', '==', shopId));

//   const querySnapshot = await getDocs(q);
//   if (querySnapshot.empty) return null;

//   return {
//     id: querySnapshot.docs[0].id,
//     ...querySnapshot.docs[0].data(),
//   };
// };

export const getAppointmentsByCustomerId = async customerId => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('customerId', '==', customerId),
    );
    const querySnapshot = await getDocs(q);

    const results = await Promise.all(
      querySnapshot.docs.map(async appointmentDoc => {
        const appointmentData = appointmentDoc.data();
        const expertId = appointmentData.expertId;

        let expertData = null;
        if (expertId) {
          const expertRef = doc(db, 'beauty_experts', expertId);
          const expertSnap = await getDoc(expertRef);
          if (expertSnap.exists()) {
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
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    const allServices = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter services by search term
    const filteredServices = allServices.filter(
      service =>
        service.serviceName &&
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Get unique shop IDs
    const shopIds = [
      ...new Set(filteredServices.map(service => service.shopId)),
    ];

    if (shopIds.length === 0) return [];

    // Get shop details for each shop ID
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

// Get all shops and filter client-side
export const searchShops = async searchTerm => {
  try {
    const shopsSnapshot = await getDocs(collection(db, 'shop-owners'));
    const allShops = shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter shops by search term
    const filteredShops = allShops.filter(
      shop =>
        shop.parlourName &&
        shop.parlourName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Enhance with services
    const enhancedShops = await Promise.all(
      filteredShops.map(async shop => {
        const services = await getServicesByShopId(shop.uid || shop.id);
        return {
          ...shop,
          services,
        };
      }),
    );

    return enhancedShops;
  } catch (error) {
    console.error('Search shops error:', error);
    throw error;
  }
};

// Helper function to get shop owner by shop ID
const getShopOwnerByShopId = async shopId => {
  try {
    const shopsSnapshot = await getDocs(collection(db, 'shop-owners'));
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

// Helper function to get services by shop ID
const getServicesByShopId = async shopId => {
  try {
    const servicesSnapshot = await getDocs(collection(db, 'services'));
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
