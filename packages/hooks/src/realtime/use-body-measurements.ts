import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type BodyMeasurement = {
  id: string;
  date: string;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  // Add other fields as needed for charts
  createdAt: string;
};

type FetchResponse = {
  success: boolean;
  measurements: BodyMeasurement[];
  pagination: { total: number; limit: number; offset: number; hasMore: boolean };
};

export function useBodyMeasurementsHistory(limit = 20) {
  return useQuery({
    queryKey: ['body-measurements-history', limit],
    queryFn: async (): Promise<BodyMeasurement[]> => {
      const res = await fetch(`/api/body-measurements?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = (await res.json()) as FetchResponse;
      return data.measurements.reverse(); // Reverse for charts (oldest first)
    },
  });
}

export function useImportMeasurements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/body-measurements/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({ error: 'Invalid response from server' }));

      if (!res.ok) {
        throw new Error(data?.error || `Import failed (${res.status})`);
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(`Import completed: ${data.imported?.length || 0} measurements imported`);
      queryClient.invalidateQueries({ queryKey: ['body-measurements-history'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Refresh current profile too
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    },
  });
}
