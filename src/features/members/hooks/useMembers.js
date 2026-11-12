import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useMembers = () => {
  return useQuery({
    queryKey: ['public', 'members'],
    queryFn: async () => {
      const { data } = await api.get('/public/community');
      return data.data || [];
    },
  });
};

export const useMyRoom = () => {
  return useQuery({
    queryKey: ['public', 'rooms', 'first'],
    queryFn: async () => {
      const { data } = await api.get('/public/rooms');
      return data.data?.[0] || null;
    },
  });
};

export const useMyProfile = () => ({
  data: null,
  isLoading: false,
});

export const useUpdateMyProfile = () => ({
  mutateAsync: async () => {},
  isPending: false,
});
