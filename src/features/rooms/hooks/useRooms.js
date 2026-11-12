import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useRooms = (status, floor) => {
  return useQuery({
    queryKey: ['public', 'rooms', status, floor],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (floor)  params.append('floor', floor);
      const query = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get(`/public/rooms${query}`);
      return data.data || [];
    },
  });
};

export const useRoomById = (id) => {
  return useQuery({
    queryKey: ['public', 'rooms', id],
    queryFn: async () => {
      const { data } = await api.get(`/public/rooms/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateRoom = () => ({
  mutateAsync: async () => {},
  isPending: false,
});

export const useUpdateRoom = () => ({
  mutateAsync: async () => {},
  isPending: false,
});

export const useDeleteRoom = () => ({
  mutate: () => {},
  isPending: false,
});
