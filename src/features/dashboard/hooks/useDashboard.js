import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';

const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

/**
 * Public Dorm Overview (Stats, Settings, Recent Notices, Today's Team)
 */
export const usePublicOverview = (month, year) => {
  const current = getCurrentMonthYear();
  const m = month || current.month;
  const y = year || current.year;

  return useQuery({
    queryKey: ['public', 'overview', m, y],
    queryFn: async () => {
      const { data } = await api.get(`/public/overview?month=${m}&year=${y}`);
      return data.data;
    },
  });
};

// Backwards-compatibility aliases
export const useMemberDashboard = () => usePublicOverview();
export const useManagerDashboard = () => usePublicOverview();

/**
 * Public Community Transparency Stats (Members, Rooms, Meals, Paid)
 */
export const useCommunityStats = (month, year) => {
  const current = getCurrentMonthYear();
  const m = month || current.month;
  const y = year || current.year;

  return useQuery({
    queryKey: ['public', 'community', m, y],
    queryFn: async () => {
      const { data } = await api.get(`/public/community?month=${m}&year=${y}`);
      return data.data || [];
    },
  });
};

/**
 * Public Dorm Settings (Dorm info, rules, address, manager contact)
 */
export const useDormSettings = () => {
  return useQuery({
    queryKey: ['public', 'settings'],
    queryFn: async () => {
      const { data } = await api.get('/public/settings');
      return data.data;
    },
  });
};
