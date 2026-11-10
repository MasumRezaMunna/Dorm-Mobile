import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';

export const useComplaints = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MY_COMPLAINTS,
    queryFn: async () => {
      const { data } = await api.get('/complaints/my');
      return data.data || [];
    },
  });
};

export const useAllComplaints = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COMPLAINTS_ALL,
    queryFn: async () => {
      const { data } = await api.get('/complaints');
      return data.data || [];
    },
  });
};

export const useComplaintById = (id) => {
  return useQuery({
    queryKey: ['complaints', id],
    queryFn: async () => {
      const { data } = await api.get(`/complaints/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/complaints', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_COMPLAINTS });
    },
  });
};

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`/complaints/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLAINTS_ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_COMPLAINTS });
    },
  });
};
