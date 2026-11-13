import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { getCurrentMonthYear } from '../../../utils/helpers';

export const useWeeklyPlan = (dateString) => {
  return useQuery({
    queryKey: ['public', 'meals', 'weekly-plan', dateString],
    queryFn: async () => {
      const url = dateString ? `/public/meals/weekly-plan?date=${dateString}` : '/public/meals/weekly-plan';
      const { data } = await api.get(url);
      return data.data;
    },
  });
};

export const useMonthlySummary = (month, year) => {
  const current = getCurrentMonthYear();
  const m = month || current.month;
  const y = year || current.year;

  return useQuery({
    queryKey: ['public', 'meals', 'monthly-detail', m, y],
    queryFn: async () => {
      const { data } = await api.get(`/public/meals/monthly-detail?month=${m}&year=${y}`);
      return data.data;
    },
  });
};

export const useMealEntries = (date, month, year, limit = 200) => {
  return useQuery({
    queryKey: ['public', 'meals', 'entries', date, month, year, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (limit) params.append('limit', limit);
      const { data } = await api.get(`/public/meals/entries?${params.toString()}`);
      return data.data || [];
    },
  });
};

// Alias for backwards compatibility
export const useMyMeals = () => useMealEntries();
