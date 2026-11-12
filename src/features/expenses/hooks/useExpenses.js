import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { getCurrentMonthYear } from '../../../utils/helpers';

export const useExpenses = (month, year, expenseType = 'all') => {
  const current = getCurrentMonthYear();
  const m = month || current.month;
  const y = year || current.year;

  return useQuery({
    queryKey: ['public', 'expenses', m, y, expenseType],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('month', m);
      params.append('year', y);
      if (expenseType && expenseType !== 'all') {
        params.append('expenseType', expenseType);
      }
      const { data } = await api.get(`/public/expenses?${params.toString()}`);
      return data.data || { expenses: [], groceryCost: 0, commonCost: 0, grandTotal: 0 };
    },
  });
};

export const useCreateExpense = () => ({
  mutateAsync: async () => {},
  isPending: false,
});

export const useDeleteExpense = () => ({
  mutate: () => {},
  isPending: false,
});
