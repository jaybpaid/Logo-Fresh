import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Occasion } from '../types';

export const fetchOccasions = async (): Promise<Occasion[]> => {
  try {
    const occasionsCol = collection(db, 'occasions');
    const snapshot = await getDocs(occasionsCol);
    const occasionsList = snapshot.docs.map(doc => doc.data() as Occasion);
    return occasionsList;
  } catch (error) {
    console.error("Error fetching occasions: ", error);
    // In a real app, you might want to handle this more gracefully
    // For now, we'll return an empty array to prevent app crash
    return [];
  }
};
