import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} from '@/lib/services/leads';
import type { Lead } from '@/types';

const QUERY_KEY = 'leads';

export function useLeads() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getLeads
  });

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const handleCreateLead = useCallback(async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateLead = useCallback(async (id: string, data: Partial<Lead>) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const handleDeleteLead = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    leads: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createLead: handleCreateLead,
    updateLead: handleUpdateLead,
    deleteLead: handleDeleteLead,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}