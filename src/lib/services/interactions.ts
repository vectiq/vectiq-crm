import { 
  collection,
  doc,
  getDocs, 
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Interaction } from '@/types';

const COLLECTION = 'interactions';

export async function getInteractions(filters: { leadId?: string; opportunityId?: string; candidateId?: string }): Promise<Interaction[]> {
  const constraints = [];
  
  if (filters.leadId) {
    constraints.push(where('leadId', '==', filters.leadId));
  }
  if (filters.opportunityId) {
    constraints.push(where('opportunityId', '==', filters.opportunityId));
  }
  if (filters.candidateId) {
    constraints.push(where('candidateId', '==', filters.candidateId));
  }
  
  constraints.push(orderBy('date', 'desc'));

  const snapshot = await getDocs(
    query(collection(db, COLLECTION), ...constraints)
  );
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Interaction[];
}

export async function createInteraction(data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interaction> {
  const interactionRef = doc(collection(db, COLLECTION));
  const interaction: Interaction = {
    id: interactionRef.id,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(interactionRef, interaction);
  return interaction;
}