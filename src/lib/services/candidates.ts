import { 
  collection,
  doc,
  getDocs, 
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Candidate } from '@/types';

const COLLECTION = 'candidates';

export async function getCandidates(filters?: { opportunityId?: string }): Promise<Candidate[]> {
  const constraints = [];
  
  // Only filter by opportunityId if explicitly provided (undefined means get all)
  if (filters?.opportunityId !== undefined) {
    constraints.push(where('opportunityId', '==', filters.opportunityId));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(
    query(collection(db, COLLECTION), ...constraints)
  );
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Candidate[];
}

export async function createCandidate(data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate> {
  const candidateRef = doc(collection(db, COLLECTION));
  
  // Clean up data by removing undefined values
  const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  const candidate: Candidate = {
    id: candidateRef.id,
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(candidateRef, candidate);
  return candidate;
}

export async function updateCandidate(id: string, data: Partial<Candidate>): Promise<void> {
  const candidateRef = doc(db, COLLECTION, id);
  await updateDoc(candidateRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCandidate(id: string): Promise<void> {
  const candidateRef = doc(db, COLLECTION, id);
  await deleteDoc(candidateRef);
}