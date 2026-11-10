/**
 * Meals Screen — My daily meals, monthly summary, weekly plan.
 */
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useMyMeals, useWeeklyPlan, useMonthlySummary } from '../features/meals/hooks/useMeals';
import { CardSkeleton } from '../components/ui/Skeleton';
import Colors from '../constants/colors';
import { formatDate, getMonthName, getCurrentMonthYear } from '../utils/helpers';

const TABS = [
  { key: 'my-meals', label: 'My Meals' },
  { key: 'weekly',   label: 'Weekly Plan' },
  { key: 'summary',  label: 'Monthly' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function TabPill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabPill, active && styles.tabPillActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function MealsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-meals');

  const { month, year } = getCurrentMonthYear();
  const { data: myMeals = [], isLoading: myLoading, refetch, isRefetching } = useMyMeals();
  const { data: weeklyPlan, isLoading: weeklyLoading } = useWeeklyPlan();
  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(month, year);

  const totalMyMeals = myMeals.reduce((s, m) => s + (m.mealCount || 0), 0);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Meals</Text>
          <Text style={styles.subtitle}>{getMonthName(month)} {year}</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TabPill key={t.key} label={t.label} active={activeTab === t.key} onPress={() => setActiveTab(t.key)} />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
        contentContainerStyle={styles.scroll}
      >
        {/* ── My Meals ── */}
        {activeTab === 'my-meals' && (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalMyMeals}</Text>
                <Text style={styles.summaryLabel}>Total Meals</Text>
              </View>
              <View style={styles.dividerV} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {myMeals.reduce((s, m) => s + (m.lunch || 0), 0)}
                </Text>
                <Text style={styles.summaryLabel}>Lunches</Text>
              </View>
              <View style={styles.dividerV} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {myMeals.reduce((s, m) => s + (m.dinner || 0), 0)}
                </Text>
                <Text style={styles.summaryLabel}>Dinners</Text>
              </View>
            </View>

            {myLoading ? (
              <CardSkeleton />
            ) : myMeals.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="restaurant-outline" size={40} color="rgba(167,139,250,0.3)" />
                <Text style={styles.emptyText}>No meal records yet</Text>
              </View>
            ) : (
              myMeals.map((meal, i) => (
                <View key={meal._id || i} style={styles.mealRow}>
                  <Text style={styles.mealDate}>{formatDate(meal.date)}</Text>
                  <View style={styles.mealCounts}>
                    {meal.lunch > 0 && (
                      <View style={styles.mealTag}>
                        <Ionicons name="sunny-outline" size={12} color="#f59e0b" />
                        <Text style={styles.mealTagText}>{meal.lunch} Lunch</Text>
                      </View>
                    )}
                    {meal.dinner > 0 && (
                      <View style={[styles.mealTag, styles.mealTagDinner]}>
                        <Ionicons name="moon-outline" size={12} color="#a78bfa" />
                        <Text style={[styles.mealTagText, { color: '#a78bfa' }]}>{meal.dinner} Dinner</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.mealTotal}>{meal.mealCount} total</Text>
                </View>
              ))
            )}
          </>
        )}

        {/* ── Weekly Plan ── */}
        {activeTab === 'weekly' && (
          weeklyLoading ? (
            <CardSkeleton />
          ) : !weeklyPlan ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No weekly plan set</Text>
            </View>
          ) : (
            Object.entries(weeklyPlan.days || {}).map(([day, menu]) => (
              <View key={day} style={styles.weeklyCard}>
                <Text style={styles.weeklyDay}>{day}</Text>
                {menu.lunch && (
                  <View style={styles.weeklyMealRow}>
                    <Ionicons name="sunny-outline" size={14} color="#f59e0b" />
                    <Text style={styles.weeklyMealText}>Lunch: {menu.lunch}</Text>
                  </View>
                )}
                {menu.dinner && (
                  <View style={styles.weeklyMealRow}>
                    <Ionicons name="moon-outline" size={14} color="#a78bfa" />
                    <Text style={styles.weeklyMealText}>Dinner: {menu.dinner}</Text>
                  </View>
                )}
              </View>
            ))
          )
        )}

        {/* ── Monthly Summary ── */}
        {activeTab === 'summary' && (
          summaryLoading ? (
            <CardSkeleton />
          ) : !summary ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No summary available</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.totalMeals || 0}</Text>
                  <Text style={styles.summaryLabel}>Total Meals</Text>
                </View>
                <View style={styles.dividerV} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>৳{(summary.mealRate || 0).toFixed(2)}</Text>
                  <Text style={styles.summaryLabel}>Meal Rate</Text>
                </View>
              </View>
              {(summary.members || []).map((m, i) => (
                <View key={m.memberId || i} style={styles.summaryMemberRow}>
                  <Text style={styles.summaryMemberName} numberOfLines={1}>{m.name}</Text>
                  <View style={styles.summaryMemberStats}>
                    <Text style={styles.summaryMemberStat}>{m.totalMeals} meals</Text>
                    <Text style={styles.summaryMemberCost}>৳{(m.mealCost || 0).toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabPillActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7c3aed',
  },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.dark.textMuted },
  tabTextActive: { color: '#a78bfa' },
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: Colors.dark.text },
  summaryLabel: { fontSize: 11, color: Colors.dark.textDim, marginTop: 4 },
  dividerV: { width: 1, backgroundColor: Colors.dark.border },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 8,
  },
  mealDate: { fontSize: 12, color: Colors.dark.textDim, width: 90 },
  mealCounts: { flex: 1, flexDirection: 'row', gap: 6 },
  mealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mealTagDinner: { backgroundColor: 'rgba(167,139,250,0.1)' },
  mealTagText: { fontSize: 11, color: '#f59e0b', fontWeight: '500' },
  mealTotal: { fontSize: 13, fontWeight: '600', color: Colors.dark.text },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.dark.textDim },
  weeklyCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 10,
  },
  weeklyDay: { fontSize: 15, fontWeight: '700', color: Colors.dark.text, marginBottom: 8 },
  weeklyMealRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  weeklyMealText: { fontSize: 13, color: Colors.dark.textMuted },
  summaryMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  summaryMemberName: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.dark.text },
  summaryMemberStats: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  summaryMemberStat: { fontSize: 12, color: Colors.dark.textMuted },
  summaryMemberCost: { fontSize: 13, fontWeight: '700', color: '#10b981' },
});
