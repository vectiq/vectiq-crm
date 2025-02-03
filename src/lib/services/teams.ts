import { 
  collection,
  doc,
  getDocs, 
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Team } from '@/types';

const COLLECTION = 'teams';

export async function getTeams(): Promise<Team[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Team[];
}

