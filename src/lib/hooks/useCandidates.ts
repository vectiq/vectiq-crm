import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from '@/lib/services/candidates';
import type { Candidate } from '@/types';

export function useCandidates(filters?: { opportunityId?: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['candidates', filters];

  const query = useQuery({
    queryKey,
    queryFn: () => getCandidates(filters)
  });

  const createMutation = useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Candidate> }) => updateCandidate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const handleCreateCandidate = useCallback(async (data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateCandidate = useCallback(async (id: string, data: Partial<Candidate>) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const handleDeleteCandidate = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    candidates: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createCandidate: handleCreateCandidate,
    updateCandidate: handleUpdateCandidate,
    deleteCandidate: handleDeleteCandidate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}