import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  getXeroConfig,
  updateXeroConfig,
  exportCollectionAsJson,
  getSystemConfig,
  updateSystemConfig,
  getAdminStats,
  generateTestData,
  clearTestData,
  recalculateProjectTotals,
  cleanupOrphanedData,
  validateTimeEntries
} from '@/lib/services/admin';
import type { SystemConfig, TestDataOptions } from '@/types';

const QUERY_KEYS = {
  config: 'system-config',
  xeroConfig: 'xero-config',
  stats: 'admin-stats'
} as const;

export function useAdmin() {
  const queryClient = useQueryClient();

  const xeroConfigQuery = useQuery({
    queryKey: [QUERY_KEYS.xeroConfig],
    queryFn: getXeroConfig
  });

  const configQuery = useQuery({
    queryKey: [QUERY_KEYS.config],
    queryFn: getSystemConfig
  });

  const statsQuery = useQuery({
    queryKey: [QUERY_KEYS.stats],
    queryFn: getAdminStats
  });

  const updateConfigMutation = useMutation({
    mutationFn: updateSystemConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.config] });
    }
  });

  const updateXeroConfigMutation = useMutation({
    mutationFn: updateXeroConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.xeroConfig] });
    }
  });

  const generateDataMutation = useMutation({
    mutationFn: generateTestData
  });

  const clearDataMutation = useMutation({
    mutationFn: clearTestData,
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  const recalculateMutation = useMutation({
    mutationFn: recalculateProjectTotals
  });

  const cleanupMutation = useMutation({
    mutationFn: cleanupOrphanedData
  });

  const validateMutation = useMutation({
    mutationFn: validateTimeEntries
  });
  const [exportedData, setExportedData] = useState<string | undefined>();

  const exportMutation = useMutation({
    mutationFn: async (collectionName: string) => {
      const data = await exportCollectionAsJson(collectionName);
      setExportedData(JSON.stringify(data, null, 2));
    }
  });

  const handleUpdateConfig = useCallback(async (config: SystemConfig) => {
    await updateConfigMutation.mutateAsync(config);
  }, [updateConfigMutation]);

  const handleUpdateXeroConfig = useCallback(async (config: XeroConfig) => {
    await updateXeroConfigMutation.mutateAsync(config);
  }, [updateXeroConfigMutation]);

  return {
    config: configQuery.data,
    stats: statsQuery.data,
    xeroConfig: xeroConfigQuery.data,
    isLoading: configQuery.isLoading || statsQuery.isLoading,
    updateConfig: handleUpdateConfig,
    updateXeroConfig: handleUpdateXeroConfig,
    generateTestData: generateDataMutation.mutateAsync,
    clearTestData: clearDataMutation.mutateAsync,
    recalculateProjectTotals: recalculateMutation.mutateAsync,
    cleanupOrphanedData: cleanupMutation.mutateAsync,
    validateTimeEntries: validateMutation.mutateAsync,
    exportCollection: exportMutation.mutateAsync,
    exportedData,
    isUpdating: updateConfigMutation.isPending,
    isUpdatingXero: updateXeroConfigMutation.isPending,
    isGenerating: generateDataMutation.isPending,
    isClearing: clearDataMutation.isPending,
    isRecalculating: recalculateMutation.isPending,
    isCleaning: cleanupMutation.isPending,
    isValidating: validateMutation.isPending,
    isExporting: exportMutation.isPending
  };
}