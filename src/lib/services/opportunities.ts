import { 
    collection,
    doc,
    getDocs, 
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where,
    orderBy
  } from 'firebase/firestore';
  import { db } from '@/lib/firebase';
  import type { Opportunity } from '@/types';
  
  const COLLECTION = 'opportunities';
  
  export async function getOpportunities(): Promise<Opportunity[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
      )
    );
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Opportunity[];
  }
  
  export async function createOpportunity(opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Opportunity> {
    const opportunityRef = doc(collection(db, COLLECTION));
    const opportunity: Opportunity = {
      id: opportunityRef.id,
      ...opportunityData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(opportunityRef, opportunity);
    return opportunity;
  }
  
  export async function updateOpportunity(id: string, opportunityData: Partial<Opportunity>): Promise<void> {
    const opportunityRef = doc(db, COLLECTION, id);
    await updateDoc(opportunityRef, {
      ...opportunityData,
      updatedAt: serverTimestamp(),
    });
  }
  
  export async function deleteOpportunity(id: string): Promise<void> {
    const opportunityRef = doc(db, COLLECTION, id);
    await deleteDoc(opportunityRef);
  }