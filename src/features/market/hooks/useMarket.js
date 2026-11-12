import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useTodayMarketSchedule = () => {
  return useQuery({
    queryKey: ['public', 'market', 'today'],
    queryFn: async () => {
      const { data } = await api.get('/public/market-schedules/today');
      return data.data;
    },
  });
};

export const useUpcomingMarketSchedules = () => {
  return useQuery({
    queryKey: ['public', 'market', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/public/market-schedules/upcoming');
      return data.data || [];
    },
  });
};

export const useMarketScheduleHistory = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['public', 'market', 'history', page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/public/market-schedules/history?page=${page}&limit=${limit}`);
      return data.data || [];
    },
  });
};

// Aliases for backwards compatibility
export const useMarketSchedules = () => useUpcomingMarketSchedules();
export const useMarketStats = () => useTodayMarketSchedule();

export const useCreateMarketSchedule = () => ({
  mutateAsync: async () => {},
  isPending: false,
});

export const useUpdateMarketScheduleStatus = () => ({
  mutateAsync: async () => {},
  isPending: false,
});

export const useDeleteMarketSchedule = () => ({
  mutateAsync: async () => {},
  isPending: false,
});
