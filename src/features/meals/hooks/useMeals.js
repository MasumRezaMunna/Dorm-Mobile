import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';
import { getCurrentMonthYear } from '../../../utils/helpers';

export const useMyMeals = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MY_MEALS,
    queryFn: async () => {
      const { data } = await api.get('/meals/my');
      return data.data || [];
    },
  });
};

export const useWeeklyPlan = () => {
  return useQuery({
    queryKey: QUERY_KEYS.WEEKLY_PLAN,
    queryFn: async () => {
      const { data } = await api.get('/meals/weekly-plan');
      return data.data;
    },
  });
};

export const useMonthlySummary = (month, year) => {
  const current = getCurrentMonthYear();
  return useQuery({
    queryKey: ['meals', 'monthly-detail', month, year],
    queryFn: async () => {
      const { data } = await api.get(`/meals/monthly-detail?month=${month}&year=${year}`);
      return data.data;
    },
  });
};
