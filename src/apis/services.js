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
