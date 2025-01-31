import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getSkills,
  createSkill,
  deleteSkill,
  type Skill
} from '@/lib/services/skills';

const QUERY_KEY = 'skills';

export function useSkills() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getSkills
  });

  const createMutation = useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const handleCreateSkill = useCallback(async (data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleDeleteSkill = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    skills: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createSkill: handleCreateSkill,
    deleteSkill: handleDeleteSkill,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}