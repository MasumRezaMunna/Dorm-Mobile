import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { getCurrentMonthYear } from '../../../utils/helpers';

export const useWeeklyPlan = (dateString) => {
  return useQuery({
    queryKey: ['public', 'meals', 'weekly-plan', dateString],
    queryFn: async () => {
      const url = dateString ? `/public/meals/weekly-plan?date=${dateString}` : '/public/meals/weekly-plan';
      const { data } = await api.get(url);
      return data.data;
    },
  });
};

export const useMonthlySummary = (month, year) => {
  const current = getCurrentMonthYear();
  const m = month || current.month;
  const y = year || current.year;

  return useQuery({
    queryKey: ['public', 'meals', 'monthly-detail', m, y],
    queryFn: async () => {
      const [detailRes, commRes] = await Promise.allSettled([
        api.get(`/public/meals/monthly-detail?month=${m}&year=${y}`),
        api.get(`/public/community?month=${m}&year=${y}`),
      ]);

      const detailData = detailRes.status === 'fulfilled' ? detailRes.value.data?.data : null;
      const commData = commRes.status === 'fulfilled' ? commRes.value.data?.data : [];

      if (!detailData) {
        return null;
      }

      // Build community payment lookup map by memberId and lowercased name
      const payMap = {};
      if (Array.isArray(commData)) {
        commData.forEach((c) => {
          if (c.memberId) payMap[c.memberId] = c.totalPaid ?? c.paidAmount ?? 0;
          if (c.name) payMap[c.name.trim().toLowerCase()] = c.totalPaid ?? c.paidAmount ?? 0;
        });
      }

      const enrichedMembers = (detailData.members || []).map((mem) => {
        const memId = mem.memberId;
        const memNameKey = (mem.name || '').trim().toLowerCase();
        const paidAmount =
          mem.paidAmount !== undefined
            ? mem.paidAmount
            : (payMap[memId] ?? payMap[memNameKey] ?? 0);

        const totalCost = mem.totalCost || ((mem.mealCost || 0) + (mem.commonCost || 0));
        const afterMeal =
          mem.afterMeal !== undefined
            ? mem.afterMeal
            : Math.round((paidAmount - totalCost) * 100) / 100;

        return {
          ...mem,
          paidAmount,
          afterMeal,
          totalCost,
        };
      });

      const totalPaid = Math.round(
        enrichedMembers.reduce((sum, member) => sum + (member.paidAmount || 0), 0) * 100
      ) / 100;
      const totalExpense =
        detailData.totalExpense ||
        ((detailData.groceryTotal || 0) + (detailData.commonTotal || 0));
      const netBalance = Math.round((totalPaid - totalExpense) * 100) / 100;

      return {
        ...detailData,
        members: enrichedMembers,
        totalPaid,
        netBalance,
      };
    },
  });
};

export const useMealEntries = (date, month, year, limit = 200) => {
  return useQuery({
    queryKey: ['public', 'meals', 'entries', date, month, year, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (limit) params.append('limit', limit);
      const { data } = await api.get(`/public/meals/entries?${params.toString()}`);
      return data.data || [];
    },
  });
};

// Alias for backwards compatibility
export const useMyMeals = () => useMealEntries();
