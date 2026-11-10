import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';

export const useMarketSchedules = (month, year) => {
  return useQuery({
    queryKey: ['market', 'schedules', month, year],
    queryFn: async () => {
      const { data } = await api.get(`/market-schedules?month=${month}&year=${year}`);
      return data.data || [];
    },
  });
};

export const useMarketStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_STATS,
    queryFn: async () => {
      const { data } = await api.get('/market-schedules/stats');
      return data.data;
    },
  });
};

export const useCreateMarketSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/market-schedules', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'schedules'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_STATS });
    },
  });
};

export const useUpdateMarketScheduleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.patch(`/market-schedules/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'schedules'] });
    },
  });
};

export const useDeleteMarketSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/market-schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'schedules'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKET_STATS });
    },
  });
};
