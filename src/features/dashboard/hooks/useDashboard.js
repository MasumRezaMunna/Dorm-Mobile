import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';

const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const useMemberDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_MEMBER,
    queryFn: async () => {
      const { month, year } = getCurrentMonthYear();
      const { data } = await api.get(`/dashboard/member?month=${month}&year=${year}`);
      return data.data;
    },
  });
};

export const useManagerDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_MANAGER,
    queryFn: async () => {
      const { month, year } = getCurrentMonthYear();
      const { data } = await api.get(`/dashboard/manager?month=${month}&year=${year}`);
      return data.data;
    },
  });
};

export const useCommunityStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COMMUNITY,
    queryFn: async () => {
      const { month, year } = getCurrentMonthYear();
      const { data } = await api.get(`/dashboard/community?month=${month}&year=${year}`);
      return data.data || [];
    },
  });
};
