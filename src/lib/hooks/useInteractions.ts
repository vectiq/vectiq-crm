import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getInteractions,
  createInteraction,
} from '@/lib/services/interactions';
import type { Interaction } from '@/types';

export function useInteractions(filters: { leadId?: string; opportunityId?: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['interactions', filters];

  const query = useQuery({
    queryKey,
    queryFn: () => getInteractions(filters)
  });

  const createMutation = useMutation({
    mutationFn: createInteraction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const handleCreateInteraction = useCallback(async (data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  return {
    interactions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createInteraction: handleCreateInteraction,
    isCreating: createMutation.isPending,
  };
}