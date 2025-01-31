import { 
    collection,
    doc,
    getDocs, 
    setDoc,
    deleteDoc,
    serverTimestamp,
  } from 'firebase/firestore';
  import { db } from '@/lib/firebase';
  
  const COLLECTION = 'skills';
  
  export interface Skill {
    id: string;
    name: string;
    category?: string;
    createdAt?: any;
    updatedAt?: any;
  }
  
  export async function getSkills(): Promise<Skill[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Skill[];
  }
  
  export async function createSkill(data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Skill> {
    const skillRef = doc(collection(db, COLLECTION));
    const skill: Skill = {
      id: skillRef.id,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(skillRef, skill);
    return skill;
  }
  
  export async function deleteSkill(id: string): Promise<void> {
    const skillRef = doc(db, COLLECTION, id);
    await deleteDoc(skillRef);
  }