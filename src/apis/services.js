import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Get all parlours
export const getAllParlours = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'shop-owners'));
    const parlours = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return parlours;
  } catch (error) {
    throw error;
  }
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
