/**
 * Meals Screen — Weekly Meal Schedule & Monthly Financial Transparency.
 * High-performance tabbed interface with Day Highlight and clean cards.
 */
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useWeeklyPlan, useMonthlySummary, useMealEntries } from '../../features/meals/hooks/useMeals';
import Avatar from '../../components/ui/Avatar';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import { formatDate, getMonthName, getCurrentMonthYear, formatCurrency } from '../../utils/helpers';

const TABS = [
  { key: 'weekly', label: 'Weekly Schedule' },
  { key: 'summary', label: 'Monthly Summary' },
  { key: 'entries', label: 'Daily Logs' },
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
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meals & Dining</Text>
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
                title="No weekly plan published"
                subtitle="The weekly dining menu will appear here once updated."
              />
            ) : (
              daysList.map((d, index) => {
                const isToday = d.dayName === todayName;
                return (
                  <View key={d.dayName || index} style={[styles.weeklyCard, isToday && styles.weeklyCardToday]}>
                    <View style={styles.dayHeader}>
                      <View style={styles.dayTitleRow}>
                        <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{d.dayName}</Text>
                        {isToday && (
                          <View style={styles.todayBadge}>
                            <Text style={styles.todayBadgeText}>TODAY</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.dayPill}>
                        <Ionicons name="calendar-outline" size={12} color="#a78bfa" />
                        <Text style={styles.dayPillText}>Routine</Text>
                      </View>
                    </View>

                    {/* Lunch */}
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

                    {/* Dinner */}
                    <View style={[styles.mealBox, { marginTop: 8 }]}>
                      <View style={[styles.mealIconBadge, { backgroundColor: 'rgba(167,139,250,0.15)' }]}>
                        <Ionicons name="moon" size={16} color="#a78bfa" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mealTypeTitle}>Dinner</Text>
                        <Text style={styles.mealMenuText}>{d.dinner || 'Standard menu'}</Text>
                        {d.dinnerNote ? <Text style={styles.mealNote}>Note: {d.dinnerNote}</Text> : null}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ── 2. Monthly Summary Tab ── */}
        {activeTab === 'summary' && (
          <>
            {summaryLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : !summary ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="calculator-outline" size={size} color={color} />}
                title="Summary not available"
                subtitle="Monthly meal metrics will appear as meals are logged."
              />
            ) : (
              <>
                <View style={styles.summaryOverviewCard}>
                  <Text style={styles.summaryTitle}>Month Financial Overview</Text>
                  <View style={styles.statGrid2}>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Total Meals</Text>
                      <Text style={styles.statBoxVal}>{summary.totalMeals ?? 0}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Meal Rate</Text>
                      <Text style={styles.statBoxVal}>{formatCurrency(summary.mealRate ?? 0)}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Grocery Cost</Text>
                      <Text style={styles.statBoxVal}>{formatCurrency(summary.totalGroceryCost ?? 0)}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Common Cost</Text>
                      <Text style={styles.statBoxVal}>{formatCurrency(summary.totalCommonCost ?? 0)}</Text>
                    </View>
                  </View>
                </View>

                {/* Per Member Breakdown */}
                <Text style={styles.subSectionTitle}>Resident Breakdown</Text>
                {(summary.memberSummaries || []).map((m, i) => (
                  <View key={m.userId?._id || i} style={styles.memberSummaryCard}>
                    <Avatar name={m.name || 'Member'} size={40} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.memberName}>{m.name || 'Resident'}</Text>
                      <Text style={styles.memberSub}>{m.totalMeals ?? 0} meals recorded</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.memberCost}>{formatCurrency(m.totalCost ?? 0)}</Text>
                      <Text style={styles.memberCostSub}>Total Share</Text>
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
                icon={({ size, color }) => <Ionicons name="calendar-outline" size={size} color={color} />}
                title="No daily logs found"
                subtitle="Daily logs appear once daily counts are entered."
              />
            ) : (
              entries.map((entry, idx) => (
                <View key={entry._id || idx} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    <View style={styles.entryBadge}>
                      <Text style={styles.entryBadgeText}>
                        Total: {(entry.lunchCount || 0) + (entry.dinnerCount || 0)} meals
                      </Text>
                    </View>
                  </View>
                  <View style={styles.entryRow}>
                    <View style={styles.entryMealCol}>
                      <Ionicons name="sunny-outline" size={14} color="#f59e0b" />
                      <Text style={styles.entryMealLabel}>Lunch: </Text>
                      <Text style={styles.entryMealCount}>{entry.lunchCount ?? 0}</Text>
                    </View>
                    <View style={styles.entryMealCol}>
                      <Ionicons name="moon-outline" size={14} color="#a78bfa" />
                      <Text style={styles.entryMealLabel}>Dinner: </Text>
                      <Text style={styles.entryMealCount}>{entry.dinnerCount ?? 0}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tabPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabPillActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  weeklyCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 12,
  },
  weeklyCardToday: {
    borderColor: 'rgba(167, 139, 250, 0.5)',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  dayNameToday: {
    color: '#a78bfa',
  },
  todayBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dayPillText: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  mealBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.dark.surface,
    padding: 12,
    borderRadius: 12,
  },
  mealIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textDim,
    textTransform: 'uppercase',
  },
  mealMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 2,
  },
  mealNote: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  summaryOverviewCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  statGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    width: '48%',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
  },
  statBoxLabel: {
    fontSize: 11,
    color: Colors.dark.textDim,
    fontWeight: '600',
  },
  statBoxVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark.text,
    marginTop: 4,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  memberSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  memberSub: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  memberCost: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
  },
  memberCostSub: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  entryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  entryBadge: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  entryBadgeText: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: '700',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  entryMealCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryMealLabel: {
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  entryMealCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.text,
  },
});
