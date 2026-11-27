import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useMembers = () => {
  return useQuery({
    queryKey: ['public', 'members'],
    queryFn: async () => {
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();

      const [commRes, detailRes] = await Promise.allSettled([
        api.get(`/public/community?month=${m}&year=${y}`),
        api.get(`/public/meals/monthly-detail?month=${m}&year=${y}`),
      ]);

      const commData = commRes.status === 'fulfilled' ? commRes.value.data?.data || [] : [];
      const detailData = detailRes.status === 'fulfilled' ? detailRes.value.data?.data : null;

      const detailMemberMap = {};
      const fallbackMealRate = detailData?.mealRate || 0;
      const commonCostPerMember = detailData?.commonCostPerMember || 0;

      if (detailData && Array.isArray(detailData.members)) {
        detailData.members.forEach((dm) => {
          if (dm.memberId) detailMemberMap[dm.memberId] = dm;
          if (dm.name) detailMemberMap[dm.name.trim().toLowerCase()] = dm;
        });
      }

      return commData.map((mem) => {
        const keyId = mem.memberId;
        const keyName = (mem.name || '').trim().toLowerCase();
        const dm = detailMemberMap[keyId] || detailMemberMap[keyName];

        const paid = mem.totalPaid ?? mem.paidAmount ?? 0;
        const totalMeals = mem.totalMeals ?? (dm?.totalMeals || 0);
        const mealCost = dm?.mealCost ?? Math.round(totalMeals * fallbackMealRate * 100) / 100;
        const commonCost = dm?.commonCost ?? commonCostPerMember;
        const totalCost = dm?.totalCost ?? Math.round((mealCost + commonCost) * 100) / 100;
        const afterMeal =
          mem.afterMeal !== undefined
            ? mem.afterMeal
            : Math.round((paid - totalCost) * 100) / 100;

        return {
          ...mem,
          totalPaid: paid,
          paidAmount: paid,
          mealCost,
          commonCost,
          totalCost,
          afterMeal,
        };
      });
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
  mutateAsync: async () => { },
  isPending: false,
});
