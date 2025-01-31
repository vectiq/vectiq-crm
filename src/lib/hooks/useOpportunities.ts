import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '@/lib/services/opportunities';
import type { Opportunity } from '@/types';

const QUERY_KEY = 'opportunities';

export function useOpportunities() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getOpportunities
  });

  const createMutation = useMutation({
    mutationFn: createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Opportunity> }) => updateOpportunity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const handleCreateOpportunity = useCallback(async (data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateOpportunity = useCallback(async (id: string, data: Partial<Opportunity>) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const handleDeleteOpportunity = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    opportunities: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createOpportunity: handleCreateOpportunity,
    updateOpportunity: handleUpdateOpportunity,
    deleteOpportunity: handleDeleteOpportunity,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}