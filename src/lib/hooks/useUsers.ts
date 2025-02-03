import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { updateProfile as updateFirebaseProfile, updateEmail, sendPasswordResetEmail } from 'firebase/auth';
import { getUsers, getCurrentUser,} from '@/lib/services/users';
import { auth } from '@/lib/firebase';
import type { User } from '@/types';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export function useUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: [USERS_KEY],
    queryFn: getUsers,
    staleTime: 1000 * 60 // 1 minute
  });

  const currentUserQuery = useQuery({
    queryKey: [CURRENT_USER_KEY],
    queryFn: getCurrentUser
  });


  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  return {
    users: usersQuery.data ?? [],
    currentUser: currentUserQuery.data ?? null,
    isAdmin: currentUserQuery.data?.role === 'admin',
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    sendPasswordReset,
  };
}