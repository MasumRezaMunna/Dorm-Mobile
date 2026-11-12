import { useQuery } from '@tanstack/react-query';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['public', 'notifications'],
    queryFn: async () => {
      return [];
    },
  });
};

export const useMarkRead = () => ({
  mutate: () => {},
  isPending: false,
});

export const useMarkAllRead = () => ({
  mutate: () => {},
  isPending: false,
});

export const useDeleteNotification = () => ({
  mutate: () => {},
  isPending: false,
});
