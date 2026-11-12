import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';

export const usePayments = (month, year) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS, month, year],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/payments?month=${month}&year=${year}`);
        return data.data || [];
      } catch {
        return [];
      }
    },
  });
};

export const useCreatePayment = () => ({
  mutateAsync: async () => {},
  isPending: false,
});

export const useDeletePayment = () => ({
  mutate: () => {},
  isPending: false,
});
