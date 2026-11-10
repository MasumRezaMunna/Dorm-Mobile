import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';

export const useMembers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MEMBERS,
    queryFn: async () => {
      const { data } = await api.get('/members');
      return data.data || [];
    },
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MY_PROFILE,
    queryFn: async () => {
      const { data } = await api.get('/members/me');
      return data.data;
    },
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put('/members/me', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PROFILE });
    },
  });
};

export const useMyRoom = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MY_ROOM,
    queryFn: async () => {
      // Try the /rooms/my endpoint (we will add it to server)
      // Falls back to member profile roomId if needed
      try {
        const { data } = await api.get('/rooms/my');
        return data.data;
      } catch {
        // Fallback: get room from member profile
        const { data: memberData } = await api.get('/members/me');
        const roomId = memberData.data?.roomId;
        if (!roomId) return null;
        const { data: roomData } = await api.get(`/rooms/${typeof roomId === 'object' ? roomId._id : roomId}`);
        return roomData.data;
      }
    },
  });
};
