import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useNotices = (priority = 'all') => {
  return useQuery({
    queryKey: ['public', 'notices', priority],
    queryFn: async () => {
      const url = priority && priority !== 'all'
        ? `/public/notices?priority=${priority}`
        : '/public/notices';
      const { data } = await api.get(url);
      return data.data || [];
    },
  });
};

export const useNoticeById = (id) => {
  return useQuery({
    queryKey: ['public', 'notices', id],
    queryFn: async () => {
      const { data } = await api.get(`/public/notices/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateNotice = () => ({
  mutateAsync: async () => {},
  isPending: false,
});

export const useDeleteNotice = () => ({
  mutateAsync: async () => {},
  isPending: false,
});

export const useTogglePin = () => ({
  mutateAsync: async () => {},
  isPending: false,
});
