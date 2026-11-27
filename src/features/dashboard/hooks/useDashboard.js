import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';

const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

/**
 * Public Dorm Overview (Stats, Settings, Recent Notices, Today's Team, Payments & Balances)
 */
export const usePublicOverview = (month, year) => {
  const current = getCurrentMonthYear();
  const m = month || current.month;
  const y = year || current.year;

  return useQuery({
    queryKey: ['public', 'overview', m, y],
    queryFn: async () => {
      const [overviewRes, commRes] = await Promise.allSettled([
        api.get(`/public/overview?month=${m}&year=${y}`),
        api.get(`/public/community?month=${m}&year=${y}`),
      ]);

      const overview = overviewRes.status === 'fulfilled' ? overviewRes.value.data?.data : {};
      const community = commRes.status === 'fulfilled' ? commRes.value.data?.data : [];

      let totalPaid = 0;
      if (Array.isArray(community)) {
        totalPaid = community.reduce((s, mem) => s + (mem.totalPaid ?? mem.paidAmount ?? 0), 0);
      }
      totalPaid = Math.round(totalPaid * 100) / 100;

      const monthlyExpenses =
        overview?.monthlyExpenses ??
        ((overview?.groceryCost || 0) + (overview?.commonCost || 0));
      const netBalance = Math.round((totalPaid - monthlyExpenses) * 100) / 100;

      return {
        ...overview,
        totalPaid,
        netBalance,
        community,
      };
    },
  });
};

// Backwards-compatibility aliases
export const useMemberDashboard = () => usePublicOverview();
export const useManagerDashboard = () => usePublicOverview();

/**
 * Public Community Transparency Stats (Members, Rooms, Meals, Paid, After Deduction)
 */
export const useCommunityStats = (month, year) => {
  const current = getCurrentMonthYear();
  const m = month || current.month;
  const y = year || current.year;

  return useQuery({
    queryKey: ['public', 'community', m, y],
    queryFn: async () => {
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

/**
 * Public Dorm Settings (Dorm info, rules, address, manager contact)
 */
export const useDormSettings = () => {
  return useQuery({
    queryKey: ['public', 'settings'],
    queryFn: async () => {
      const { data } = await api.get('/public/settings');
      return data.data;
    },
  });
};
