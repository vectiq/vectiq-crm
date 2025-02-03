import {
  collection,
  doc,
  writeBatch,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
} from 'firebase/auth';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

const COLLECTION = 'users';

// User Operations
export async function getUsers(): Promise<User[]> {
  // Get all users
  const usersSnapshot = await getDocs(collection(db, COLLECTION));
  const users = usersSnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));

  return users as User[];
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const userRef = doc(db, COLLECTION, user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return null;
  }
  
  const userData = userDoc.data();
  return {
    id: user.uid,
    ...userData,
    projectAssignments: userData.projectAssignments || [],
  } as User;
}

