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
  import type { Lead } from '@/types';
  
  const COLLECTION = 'leads';
  
  export async function getLeads(): Promise<Lead[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
      )
    );
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Lead[];
  }
  
  export async function createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const leadRef = doc(collection(db, COLLECTION));
    const lead: Lead = {
      id: leadRef.id,
      ...leadData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(leadRef, lead);
    return lead;
  }
  
  export async function updateLead(id: string, leadData: Partial<Lead>): Promise<void> {
    const leadRef = doc(db, COLLECTION, id);
    await updateDoc(leadRef, {
      ...leadData,
      updatedAt: serverTimestamp(),
    });
  }
  
  export async function deleteLead(id: string): Promise<void> {
    const leadRef = doc(db, COLLECTION, id);
    await deleteDoc(leadRef);
  }