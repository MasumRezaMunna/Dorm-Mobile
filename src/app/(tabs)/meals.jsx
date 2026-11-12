/**
 * Meals Screen — Weekly Meal Menu, Monthly Transparency Breakdown & Daily Entries.
 * Displays public meal information synchronized with the backend database.
 */
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useWeeklyPlan, useMonthlySummary, useMealEntries } from '../../features/meals/hooks/useMeals';
import Avatar from '../../components/ui/Avatar';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import { formatDate, getMonthName, getCurrentMonthYear, formatCurrency } from '../../utils/helpers';

const TABS = [
  { key: 'weekly', label: 'Weekly Menu' },
  { key: 'summary', label: 'Monthly Summary' },
  { key: 'entries', label: 'Daily Entries' },
];

export default function MealsTabScreen() {
  const [activeTab, setActiveTab] = useState('weekly');
  const { month, year } = getCurrentMonthYear();

  const { data: weeklyPlan, isLoading: weeklyLoading, refetch: refetchWeekly, isRefetching: isRefetchingWeekly } = useWeeklyPlan();
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary, isRefetching: isRefetchingSummary } = useMonthlySummary(month, year);
  const { data: entries = [], isLoading: entriesLoading, refetch: refetchEntries, isRefetching: isRefetchingEntries } = useMealEntries(null, month, year);

  const isRefetching = isRefetchingWeekly || isRefetchingSummary || isRefetchingEntries;

  const handleRefresh = () => {
    refetchWeekly();
    refetchSummary();
    refetchEntries();
  };

  const daysList = weeklyPlan?.days || [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meals & Menu</Text>
        <Text style={styles.subtitle}>{getMonthName(month)} {year} • Public Meal Board</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            style={[styles.tabPill, activeTab === t.key && styles.tabPillActive]}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#a78bfa" />}
        contentContainerStyle={styles.scroll}
      >
        {/* ── 1. Weekly Menu Tab ── */}
        {activeTab === 'weekly' && (
          <>
            {weeklyLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : daysList.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="restaurant-outline" size={size} color={color} />}
                title="No weekly plan set"
                subtitle="The meal plan will appear once updated by the manager."
              />
            ) : (
              daysList.map((d, index) => (
                <View key={d.dayName || index} style={styles.weeklyCard}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{d.dayName}</Text>
                    <View style={styles.dayPill}>
                      <Ionicons name="calendar-outline" size={12} color="#a78bfa" />
                      <Text style={styles.dayPillText}>Schedule</Text>
                    </View>
                  </View>

                  <View style={styles.mealBox}>
                    <View style={styles.mealIconBadge}>
                      <Ionicons name="sunny" size={16} color="#f59e0b" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mealTypeTitle}>Lunch</Text>
                      <Text style={styles.mealMenuText}>{d.lunch || 'Standard menu'}</Text>
                      {d.lunchNote ? <Text style={styles.mealNote}>Note: {d.lunchNote}</Text> : null}
                    </View>
                  </View>

                  <View style={[styles.mealBox, { marginTop: 8 }]}>
                    <View style={[styles.mealIconBadge, { backgroundColor: 'rgba(167,139,250,0.15)' }]}>
                      <Ionicons name="moon" size={16} color="#a78bfa" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mealTypeTitle, { color: '#a78bfa' }]}>Dinner</Text>
                      <Text style={styles.mealMenuText}>{d.dinner || 'Standard menu'}</Text>
                      {d.dinnerNote ? <Text style={styles.mealNote}>Note: {d.dinnerNote}</Text> : null}
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── 2. Monthly Summary Tab ── */}
        {activeTab === 'summary' && (
          <>
            {summaryLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : !summary ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="stats-chart-outline" size={size} color={color} />}
                title="No summary data"
              />
            ) : (
              <>
                {/* Summary Metrics */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricVal}>{summary.totalMeals || 0}</Text>
                    <Text style={styles.metricLbl}>Total Meals</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricVal, { color: '#10b981' }]}>
                      ৳{(summary.mealRate || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.metricLbl}>Meal Rate</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricVal, { color: '#f59e0b' }]}>
                      {formatCurrency(summary.groceryTotal || 0)}
                    </Text>
                    <Text style={styles.metricLbl}>Grocery Cost</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={[styles.metricVal, { color: '#8b5cf6' }]}>
                      {formatCurrency(summary.commonCostPerMember || 0)}
                    </Text>
                    <Text style={styles.metricLbl}>Common / Member</Text>
                  </View>
                </View>

                {/* Per Member Breakdown */}
                <Text style={styles.sectionHeading}>Resident Breakdown ({summary.members?.length || 0})</Text>
                {(summary.members || []).map((m, i) => (
                  <View key={m.memberId || i} style={styles.memberBreakdownCard}>
                    <Avatar uri={m.photoURL} name={m.name} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      <Text style={styles.memberMeta}>
                        Room {m.roomNumber} • {m.totalMeals} meals ({m.totalLunch}L / {m.totalDinner}D)
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.memberCostVal}>{formatCurrency(m.totalCost)}</Text>
                      <Text style={styles.memberCostLbl}>Food + Common</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ── 3. Daily Entries Tab ── */}
        {activeTab === 'entries' && (
          <>
            {entriesLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : entries.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="list-outline" size={size} color={color} />}
                title="No daily entries recorded"
                subtitle="Daily meals will appear here as recorded by the manager."
              />
            ) : (
              entries.map((entry, i) => {
                const memberName = entry.memberId?.userId?.displayName || 'Resident';
                return (
                  <View key={entry._id || i} style={styles.entryRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryMemberName}>{memberName}</Text>
                      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    </View>
                    <View style={styles.entryTags}>
                      {entry.lunch > 0 && (
                        <View style={styles.tagLunch}>
                          <Text style={styles.tagLunchText}>{entry.lunch} Lunch</Text>
                        </View>
                      )}
                      {entry.dinner > 0 && (
                        <View style={styles.tagDinner}>
                          <Text style={styles.tagDinnerText}>{entry.dinner} Dinner</Text>
                        </View>
                      )}
                      <View style={styles.tagTotal}>
                        <Text style={styles.tagTotalText}>{entry.mealCount} Total</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
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
  weeklyCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayName: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(167,139,250,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayPillText: { fontSize: 11, color: '#a78bfa', fontWeight: '600' },
  mealBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
  },
  mealIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeTitle: { fontSize: 12, fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase' },
  mealMenuText: { fontSize: 14, fontWeight: '600', color: Colors.dark.text, marginTop: 2 },
  mealNote: { fontSize: 11, color: Colors.dark.textDim, marginTop: 4 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    alignItems: 'center',
  },
  metricVal: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  metricLbl: { fontSize: 11, color: Colors.dark.textDim, marginTop: 4 },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 10,
    marginTop: 8,
  },
  memberBreakdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    marginBottom: 8,
  },
  memberName: { fontSize: 14, fontWeight: '600', color: Colors.dark.text },
  memberMeta: { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  memberCostVal: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  memberCostLbl: { fontSize: 10, color: Colors.dark.textDim, marginTop: 2 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  entryMemberName: { fontSize: 14, fontWeight: '600', color: Colors.dark.text },
  entryDate: { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  entryTags: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  tagLunch: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagLunchText: { fontSize: 11, color: '#f59e0b', fontWeight: '600' },
  tagDinner: {
    backgroundColor: 'rgba(167,139,250,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagDinnerText: { fontSize: 11, color: '#a78bfa', fontWeight: '600' },
  tagTotal: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagTotalText: { fontSize: 11, color: Colors.dark.text, fontWeight: '700' },
});

