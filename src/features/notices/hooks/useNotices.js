import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';

export const useNotices = () => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTICES,
    queryFn: async () => {
      const { data } = await api.get('/notices');
      return data.data || [];
    },
  });
};

export const useNoticeById = (id) => {
  return useQuery({
    queryKey: ['notices', id],
    queryFn: async () => {
      const { data } = await api.get(`/notices/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/notices', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTICES });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/notices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTICES });
    },
  });
};

export const useTogglePin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.put(`/notices/${id}/pin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTICES });
    },
  });
};
