/**
 * Meals Screen — Complete Lunch & Dinner Meal Management & Financial Transparency
 * Strictly TWO meals: Lunch & Dinner only.
 * Theme: Premium Dark Green (#0f172a bg, #1e293b surface, #059669 / #10b981 / #34d399)
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  useWeeklyPlan,
  useMonthlySummary,
  useMealEntries,
} from '../../features/meals/hooks/useMeals';
import Avatar from '../../components/ui/Avatar';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import {
  formatDate,
  getMonthName,
  getCurrentMonthYear,
  formatCurrency,
} from '../../utils/helpers';

const MEAL_TABS = [
  { key: 'overview', label: 'Overview & Daily' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'summary', label: 'Monthly Summary' },
  { key: 'routine', label: 'Weekly Menu' },
];

export default function MealsTabScreen() {
  const current = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(current.month);
  const [selectedYear, setSelectedYear] = useState(current.year);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedDates, setExpandedDates] = useState({});
  const [searchDate, setSearchDate] = useState('');

  // Previous month calculation
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    const isCurrent = selectedMonth === current.month && selectedYear === current.year;
    if (isCurrent) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const isCurrentMonth = selectedMonth === current.month && selectedYear === current.year;

  // Data queries
  const {
    data: weeklyPlan,
    isLoading: weeklyLoading,
    refetch: refetchWeekly,
    isRefetching: isRefetchingWeekly,
  } = useWeeklyPlan();

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
    isRefetching: isRefetchingSummary,
  } = useMonthlySummary(selectedMonth, selectedYear);

  const {
    data: prevSummary,
    refetch: refetchPrevSummary,
  } = useMonthlySummary(prevMonth, prevYear);

  const {
    data: entries = [],
    isLoading: entriesLoading,
    refetch: refetchEntries,
    isRefetching: isRefetchingEntries,
  } = useMealEntries(null, selectedMonth, selectedYear, 200);

  const isRefetching = isRefetchingWeekly || isRefetchingSummary || isRefetchingEntries;

  const handleRefresh = () => {
    refetchWeekly();
    refetchSummary();
    refetchPrevSummary();
    refetchEntries();
  };

  // Toggle expandable daily cards
  const toggleDateExpand = (dateKey) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // ─── Financial & Metric Calculations (Lunch & Dinner ONLY) ───
  const mealRate = summary?.mealRate || 0;
  const groceryTotal = summary?.groceryTotal || 0;
  const members = summary?.members || [];

  // Monthly totals from member aggregated stats
  const monthlyLunch = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.totalLunch || 0), 0);
  }, [members]);

  const monthlyDinner = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.totalDinner || 0), 0);
  }, [members]);

  const monthlyTotalMeals = summary?.totalMeals || (monthlyLunch + monthlyDinner);
  const monthlyLunchExpense = monthlyLunch * mealRate;
  const monthlyDinnerExpense = monthlyDinner * mealRate;
  const totalMealExpense = groceryTotal || (monthlyTotalMeals * mealRate);

  // Today's stats calculation
  const todayStats = useMemo(() => {
    const now = new Date();
    const todayEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });

    const lunch = todayEntries.reduce((s, e) => s + (e.lunch || 0), 0);
    const dinner = todayEntries.reduce((s, e) => s + (e.dinner || 0), 0);
    const total = lunch + dinner;
    const cost = total * mealRate;

    return { lunch, dinner, total, cost };
  }, [entries, mealRate]);

  // Group entries by date for Daily Breakdown
  const dailyGroups = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const d = new Date(e.date);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

      if (!map[dateKey]) {
        map[dateKey] = {
          date: e.date,
          dateKey,
          lunch: 0,
          dinner: 0,
          total: 0,
          entries: [],
        };
      }
      map[dateKey].lunch += e.lunch || 0;
      map[dateKey].dinner += e.dinner || 0;
      map[dateKey].total += (e.lunch || 0) + (e.dinner || 0);
      map[dateKey].entries.push(e);
    });

    return Object.values(map).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [entries]);

  // Filtered daily list by search
  const filteredDailyList = useMemo(() => {
    if (!searchDate.trim()) return dailyGroups;
    const q = searchDate.toLowerCase().trim();
    return dailyGroups.filter((g) => {
      const formatted = formatDate(g.date).toLowerCase();
      return formatted.includes(q) || g.dateKey.includes(q);
    });
  }, [dailyGroups, searchDate]);

  // Logged days count & average daily meals
  const loggedDaysCount = dailyGroups.length;
  const avgDailyMeals =
    loggedDaysCount > 0 ? (monthlyTotalMeals / loggedDaysCount).toFixed(1) : '0';

  // Lunch vs Dinner percentage ratio
  const lunchPct =
    monthlyTotalMeals > 0 ? Math.round((monthlyLunch / monthlyTotalMeals) * 100) : 50;
  const dinnerPct = monthlyTotalMeals > 0 ? 100 - lunchPct : 50;

  // Previous month comparison
  const prevTotalMeals = prevSummary?.totalMeals || 0;
  const prevMealRate = prevSummary?.mealRate || 0;
  const prevExpense = prevSummary?.groceryTotal || 0;

  const mealsDiff = monthlyTotalMeals - prevTotalMeals;
  const rateDiff = mealRate - prevMealRate;

  // Today routine name
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      {/* Header with Month Navigator */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meals & Dining</Text>
          <Text style={styles.headerSubtitle}>
            Lunch & Dinner management • {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>

        {/* Month Selector Controls */}
        <View style={styles.monthControls}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrowBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color="#34d399" />
          </TouchableOpacity>
          <View style={styles.monthLabelBox}>
            <Text style={styles.monthLabelText}>
              {getMonthName(selectedMonth).slice(0, 3)} {selectedYear}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.navArrowBtn, isCurrentMonth && styles.navArrowBtnDisabled]}
            disabled={isCurrentMonth}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={18} color={isCurrentMonth ? '#475569' : '#34d399'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {MEAL_TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[styles.tabPill, activeTab === t.key && styles.tabPillActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#34d399" />}
        contentContainerStyle={styles.scroll}
      >
        {/* ══════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW & DAILY BREAKDOWN
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* ── Section A: Meal Overview Card ── */}
            <Animated.View entering={FadeInDown.duration(350)} style={styles.heroOverviewCard}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.heroSubHeader}>
                    {isCurrentMonth ? "TODAY'S DINING OVERVIEW" : 'MONTH DINING OVERVIEW'}
                  </Text>
                  <View style={styles.todayCountRow}>
                    <Text style={styles.todayCountBig}>
                      {isCurrentMonth ? todayStats.total : monthlyTotalMeals}
                    </Text>
                    <Text style={styles.todayCountLabel}>
                      {isCurrentMonth ? "today's meals" : 'total meals'}
                    </Text>
                  </View>
                </View>

                <View style={styles.ratePill}>
                  <Text style={styles.ratePillLabel}>MEAL RATE</Text>
                  <Text style={styles.ratePillValue}>{formatCurrency(mealRate)}</Text>
                </View>
              </View>

              {/* Today's Lunch & Dinner Quick Splits */}
              {isCurrentMonth && (
                <View style={styles.todaySplitsRow}>
                  <View style={styles.splitBox}>
                    <View style={styles.splitHeader}>
                      <Ionicons name="sunny" size={14} color="#10b981" />
                      <Text style={styles.splitLabel}>Today's Lunch</Text>
                    </View>
                    <Text style={styles.splitValue}>{todayStats.lunch} meals</Text>
                    <Text style={styles.splitCost}>{formatCurrency(todayStats.lunch * mealRate)}</Text>
                  </View>

                  <View style={styles.splitBox}>
                    <View style={styles.splitHeader}>
                      <Ionicons name="moon" size={14} color="#34d399" />
                      <Text style={styles.splitLabel}>Today's Dinner</Text>
                    </View>
                    <Text style={styles.splitValue}>{todayStats.dinner} meals</Text>
                    <Text style={styles.splitCost}>{formatCurrency(todayStats.dinner * mealRate)}</Text>
                  </View>
                </View>
              )}

              {/* Monthly Stats Grid */}
              <View style={styles.overviewGrid}>
                <View style={styles.gridStatItem}>
                  <Text style={styles.gridStatLabel}>Monthly Lunch</Text>
                  <Text style={styles.gridStatValue}>{monthlyLunch}</Text>
                  <Text style={styles.gridStatSub}>{formatCurrency(monthlyLunchExpense)}</Text>
                </View>

                <View style={styles.gridStatItem}>
                  <Text style={styles.gridStatLabel}>Monthly Dinner</Text>
                  <Text style={styles.gridStatValue}>{monthlyDinner}</Text>
                  <Text style={styles.gridStatSub}>{formatCurrency(monthlyDinnerExpense)}</Text>
                </View>

                <View style={styles.gridStatItem}>
                  <Text style={styles.gridStatLabel}>Total Meals</Text>
                  <Text style={styles.gridStatValue}>{monthlyTotalMeals}</Text>
                  <Text style={styles.gridStatSub}>Avg {avgDailyMeals}/day</Text>
                </View>

                <View style={styles.gridStatItem}>
                  <Text style={styles.gridStatLabel}>Meal Expense</Text>
                  <Text style={[styles.gridStatValue, { color: '#34d399' }]}>
                    {formatCurrency(totalMealExpense)}
                  </Text>
                  <Text style={styles.gridStatSub}>Grocery food cost</Text>
                </View>
              </View>

              {/* Lunch vs Dinner Balance Bar */}
              <View style={styles.balanceBarWrapper}>
                <View style={styles.balanceBar}>
                  <View style={[styles.balanceSegmentLunch, { width: `${lunchPct}%` }]} />
                  <View style={[styles.balanceSegmentDinner, { width: `${dinnerPct}%` }]} />
                </View>
                <View style={styles.balanceLegendRow}>
                  <View style={styles.legendDotItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.legendText}>Lunch: {lunchPct}% ({monthlyLunch})</Text>
                  </View>
                  <View style={styles.legendDotItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#34d399' }]} />
                    <Text style={styles.legendText}>Dinner: {dinnerPct}% ({monthlyDinner})</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* ── Section B: Daily Meal Breakdown ── */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Daily Meal Breakdown</Text>
                <Text style={styles.sectionSub}>Date-by-date lunch & dinner records</Text>
              </View>
              <Text style={styles.countBadge}>{filteredDailyList.length} days logged</Text>
            </View>

            {/* Date Search */}
            <View style={styles.searchBar}>
              <Ionicons name="calendar-outline" size={16} color={Colors.dark.textDim} />
              <TextInput
                value={searchDate}
                onChangeText={setSearchDate}
                placeholder="Filter by date (e.g. Nov 12)..."
                placeholderTextColor={Colors.dark.textDim}
                style={styles.searchInput}
              />
              {searchDate.length > 0 && (
                <TouchableOpacity onPress={() => setSearchDate('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.dark.textDim} />
                </TouchableOpacity>
              )}
            </View>

            {/* Daily Cards */}
            {entriesLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </View>
            ) : filteredDailyList.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="restaurant-outline" size={size} color={color} />}
                title="No meal logs recorded"
                subtitle={`No daily lunch or dinner entries logged for ${getMonthName(selectedMonth)} ${selectedYear}.`}
              />
            ) : (
              filteredDailyList.map((dayGroup, idx) => {
                const isExpanded = !!expandedDates[dayGroup.dateKey];
                const dayLunchCost = dayGroup.lunch * mealRate;
                const dayDinnerCost = dayGroup.dinner * mealRate;
                const dayTotalCost = dayGroup.total * mealRate;

                return (
                  <View key={dayGroup.dateKey} style={styles.dailyCard}>
                    <TouchableOpacity
                      onPress={() => toggleDateExpand(dayGroup.dateKey)}
                      activeOpacity={0.7}
                      style={styles.dailyCardHeader}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.dateRow}>
                          <Ionicons name="calendar" size={14} color="#34d399" />
                          <Text style={styles.dailyDateText}>{formatDate(dayGroup.date)}</Text>
                        </View>
                        <Text style={styles.dailyCostText}>
                          Daily Cost: {formatCurrency(dayTotalCost)}
                        </Text>
                      </View>

                      {/* Counts Pill Badges */}
                      <View style={styles.dailyBadgesRow}>
                        <View style={styles.lunchPill}>
                          <Ionicons name="sunny" size={12} color="#10b981" />
                          <Text style={styles.lunchPillText}>L: {dayGroup.lunch}</Text>
                        </View>
                        <View style={styles.dinnerPill}>
                          <Ionicons name="moon" size={12} color="#34d399" />
                          <Text style={styles.dinnerPillText}>D: {dayGroup.dinner}</Text>
                        </View>
                        <View style={styles.totalPill}>
                          <Text style={styles.totalPillText}>{dayGroup.total}</Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={Colors.dark.textDim}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Breakdown Sub-Row */}
                    <View style={styles.dailySubInfoRow}>
                      <Text style={styles.dailyCostDetail}>
                        Lunch: {dayGroup.lunch} × {formatCurrency(mealRate)} = {formatCurrency(dayLunchCost)}
                      </Text>
                      <Text style={styles.dailyCostDetail}>
                        Dinner: {dayGroup.dinner} × {formatCurrency(mealRate)} = {formatCurrency(dayDinnerCost)}
                      </Text>
                    </View>

                    {/* Expanded Members List */}
                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        <Text style={styles.expandedTitle}>Resident Meal Logs ({dayGroup.entries.length})</Text>
                        {dayGroup.entries.map((entry, eIdx) => {
                          const mName =
                            entry.memberId?.userId?.displayName ||
                            entry.memberId?.memberId ||
                            'Resident';
                          const mPhoto = entry.memberId?.userId?.photoURL;
                          return (
                            <View key={entry._id || eIdx} style={styles.memberEntryRow}>
                              <Avatar uri={mPhoto} name={mName} size={30} />
                              <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.memberEntryName}>{mName}</Text>
                                {entry.note ? (
                                  <Text style={styles.memberEntryNote}>{entry.note}</Text>
                                ) : null}
                              </View>
                              <View style={styles.memberEntryCounts}>
                                <Text style={styles.memberEntryL}>L: {entry.lunch || 0}</Text>
                                <Text style={styles.memberEntryD}>D: {entry.dinner || 0}</Text>
                                <Text style={styles.memberEntryT}>
                                  ={(entry.lunch || 0) + (entry.dinner || 0)}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: LUNCH DETAILED SECTION
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'lunch' && (
          <>
            {/* Lunch Summary Card */}
            <Animated.View entering={FadeInDown.duration(300)} style={styles.mealSpecificCard}>
              <View style={styles.mealSpecificHeader}>
                <View style={styles.mealSpecificIconWrapperLunch}>
                  <Ionicons name="sunny" size={24} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealSpecificBadge}>LUNCH MANAGEMENT</Text>
                  <Text style={styles.mealSpecificTitle}>Daytime Meal Service</Text>
                </View>
              </View>

              <View style={styles.specificMetricsRow}>
                <View style={styles.specificMetricItem}>
                  <Text style={styles.specificMetricLabel}>Today's Lunch</Text>
                  <Text style={styles.specificMetricValue}>{todayStats.lunch}</Text>
                  <Text style={styles.specificMetricSub}>{formatCurrency(todayStats.lunch * mealRate)}</Text>
                </View>

                <View style={styles.specificMetricItem}>
                  <Text style={styles.specificMetricLabel}>Monthly Lunch</Text>
                  <Text style={styles.specificMetricValue}>{monthlyLunch}</Text>
                  <Text style={styles.specificMetricSub}>{lunchPct}% of all meals</Text>
                </View>

                <View style={styles.specificMetricItem}>
                  <Text style={styles.specificMetricLabel}>Lunch Rate</Text>
                  <Text style={styles.specificMetricValue}>{formatCurrency(mealRate)}</Text>
                  <Text style={styles.specificMetricSub}>Per meal unit</Text>
                </View>

                <View style={styles.specificMetricItem}>
                  <Text style={styles.specificMetricLabel}>Total Lunch Expense</Text>
                  <Text style={[styles.specificMetricValue, { color: '#10b981' }]}>
                    {formatCurrency(monthlyLunchExpense)}
                  </Text>
                  <Text style={styles.specificMetricSub}>{getMonthName(selectedMonth)}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Lunch History List */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Daily Lunch Log History</Text>
              <Text style={styles.countBadge}>{dailyGroups.length} days recorded</Text>
            </View>

            {dailyGroups.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="sunny-outline" size={size} color={color} />}
                title="No lunch records found"
                subtitle="Lunch entries will appear as daily logs are entered."
              />
            ) : (
              dailyGroups.map((g, idx) => (
                <View key={g.dateKey || idx} style={styles.mealHistoryCard}>
                  <View style={styles.mealHistoryHeader}>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={14} color="#10b981" />
                      <Text style={styles.mealHistoryDate}>{formatDate(g.date)}</Text>
                    </View>
                    <View style={styles.lunchPill}>
                      <Ionicons name="sunny" size={12} color="#10b981" />
                      <Text style={styles.lunchPillText}>{g.lunch} lunch meals</Text>
                    </View>
                  </View>
                  <Text style={styles.mealHistoryCost}>
                    Expense: {g.lunch} × {formatCurrency(mealRate)} = {formatCurrency(g.lunch * mealRate)}
                  </Text>
                </View>
              ))
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: DINNER DETAILED SECTION
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'dinner' && (
          <>
            {/* Dinner Summary Card */}
            <Animated.View entering={FadeInDown.duration(300)} style={styles.mealSpecificCard}>
              <View style={styles.mealSpecificHeader}>
                <View style={styles.mealSpecificIconWrapperDinner}>
                  <Ionicons name="moon" size={24} color="#34d399" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealSpecificBadge}>DINNER MANAGEMENT</Text>
                  <Text style={styles.mealSpecificTitle}>Night Dining Service</Text>
                </View>
              </View>

              <View style={styles.specificMetricsRow}>
                <View style={styles.specificMetricItem}>
                  <Text style={styles.specificMetricLabel}>Today's Dinner</Text>
                  <Text style={styles.specificMetricValue}>{todayStats.dinner}</Text>
                  <Text style={styles.specificMetricSub}>{formatCurrency(todayStats.dinner * mealRate)}</Text>
                </View>

                <View style={styles.specificMetricItem}>
                  <Text style={styles.specificMetricLabel}>Monthly Dinner</Text>
                  <Text style={styles.specificMetricValue}>{monthlyDinner}</Text>
                  <Text style={styles.specificMetricSub}>{dinnerPct}% of all meals</Text>
                </View>

                <View style={styles.specificMetricItem}>
                  <Text style={styles.specificMetricLabel}>Dinner Rate</Text>
                  <Text style={styles.specificMetricValue}>{formatCurrency(mealRate)}</Text>
                  <Text style={styles.specificMetricSub}>Per meal unit</Text>
                </View>

                <View style={styles.specificMetricItem}>
                  <Text style={styles.specificMetricLabel}>Total Dinner Expense</Text>
                  <Text style={[styles.specificMetricValue, { color: '#34d399' }]}>
                    {formatCurrency(monthlyDinnerExpense)}
                  </Text>
                  <Text style={styles.specificMetricSub}>{getMonthName(selectedMonth)}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Dinner History List */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Daily Dinner Log History</Text>
              <Text style={styles.countBadge}>{dailyGroups.length} days recorded</Text>
            </View>

            {dailyGroups.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="moon-outline" size={size} color={color} />}
                title="No dinner records found"
                subtitle="Dinner entries will appear as daily logs are entered."
              />
            ) : (
              dailyGroups.map((g, idx) => (
                <View key={g.dateKey || idx} style={styles.mealHistoryCard}>
                  <View style={styles.mealHistoryHeader}>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={14} color="#34d399" />
                      <Text style={styles.mealHistoryDate}>{formatDate(g.date)}</Text>
                    </View>
                    <View style={styles.dinnerPill}>
                      <Ionicons name="moon" size={12} color="#34d399" />
                      <Text style={styles.dinnerPillText}>{g.dinner} dinner meals</Text>
                    </View>
                  </View>
                  <Text style={styles.mealHistoryCost}>
                    Expense: {g.dinner} × {formatCurrency(mealRate)} = {formatCurrency(g.dinner * mealRate)}
                  </Text>
                </View>
              ))
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: MONTHLY MEAL SUMMARY & COMPARISON
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'summary' && (
          <>
            {/* Monthly Financial Aggregates */}
            <Animated.View entering={FadeInDown.duration(350)} style={styles.summaryOverviewCard}>
              <Text style={styles.summaryTitle}>
                {getMonthName(selectedMonth)} {selectedYear} Final Summary
              </Text>
              <Text style={styles.summarySubtitle}>Full meal consumption and expense breakdown</Text>

              <View style={styles.statGrid2}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Total Monthly Lunch</Text>
                  <Text style={styles.statBoxVal}>{monthlyLunch}</Text>
                  <Text style={styles.statBoxSub}>{formatCurrency(monthlyLunchExpense)}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Total Monthly Dinner</Text>
                  <Text style={styles.statBoxVal}>{monthlyDinner}</Text>
                  <Text style={styles.statBoxSub}>{formatCurrency(monthlyDinnerExpense)}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Total Monthly Meals</Text>
                  <Text style={styles.statBoxVal}>{monthlyTotalMeals}</Text>
                  <Text style={styles.statBoxSub}>Across {members.length} members</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Active Meal Rate</Text>
                  <Text style={styles.statBoxVal}>{formatCurrency(mealRate)}</Text>
                  <Text style={styles.statBoxSub}>Per meal</Text>
                </View>

                <View style={[styles.statBox, { width: '100%' }]}>
                  <Text style={styles.statBoxLabel}>Total Meal Expense (Grocery Fund)</Text>
                  <Text style={[styles.statBoxVal, { fontSize: 24, color: '#34d399' }]}>
                    {formatCurrency(totalMealExpense)}
                  </Text>
                  <Text style={styles.statBoxSub}>Daily average: {avgDailyMeals} meals/day</Text>
                </View>
              </View>
            </Animated.View>

            {/* Previous Month Comparison */}
            <View style={styles.compareCard}>
              <View style={styles.compareHeader}>
                <Ionicons name="git-compare-outline" size={18} color="#34d399" />
                <Text style={styles.compareTitle}>
                  Comparison vs {getMonthName(prevMonth)} {prevYear}
                </Text>
              </View>

              <View style={styles.compareGrid}>
                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>Meals Count</Text>
                  <Text style={styles.compareVal}>{monthlyTotalMeals}</Text>
                  <Text style={styles.compareSub}>
                    Prev: {prevTotalMeals}{' '}
                    {prevTotalMeals > 0 && (
                      <Text style={{ color: mealsDiff >= 0 ? '#34d399' : '#f43f5e' }}>
                        ({mealsDiff >= 0 ? `+${mealsDiff}` : mealsDiff})
                      </Text>
                    )}
                  </Text>
                </View>

                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>Meal Rate</Text>
                  <Text style={styles.compareVal}>{formatCurrency(mealRate)}</Text>
                  <Text style={styles.compareSub}>
                    Prev: {formatCurrency(prevMealRate)}{' '}
                    {prevMealRate > 0 && (
                      <Text style={{ color: rateDiff <= 0 ? '#34d399' : '#f43f5e' }}>
                        ({rateDiff <= 0 ? `-${formatCurrency(Math.abs(rateDiff))}` : `+${formatCurrency(rateDiff)}`})
                      </Text>
                    )}
                  </Text>
                </View>

                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>Total Meal Cost</Text>
                  <Text style={styles.compareVal}>{formatCurrency(totalMealExpense)}</Text>
                  <Text style={styles.compareSub}>Prev: {formatCurrency(prevExpense)}</Text>
                </View>
              </View>
            </View>

            {/* Resident Breakdown Table */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Resident Breakdown ({members.length})</Text>
              <Text style={styles.sectionSub}>Lunch, Dinner & Individual Cost</Text>
            </View>

            {summaryLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </View>
            ) : members.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="people-outline" size={size} color={color} />}
                title="No resident records"
                subtitle="Resident summaries will calculate as meals are entered."
              />
            ) : (
              members.map((m, i) => (
                <View key={m.memberId || i} style={styles.memberSummaryCard}>
                  <Avatar uri={m.photoURL} name={m.name || 'Member'} size={40} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.memberName}>{m.name || 'Resident'}</Text>
                    <Text style={styles.memberRoom}>
                      Room {m.roomNumber || 'N/A'} • ID: {m.memberId || '—'}
                    </Text>
                    <View style={styles.memberCountsBadgeRow}>
                      <Text style={styles.memberCountBadgeL}>Lunch: {m.totalLunch || 0}</Text>
                      <Text style={styles.memberCountBadgeD}>Dinner: {m.totalDinner || 0}</Text>
                      <Text style={styles.memberCountBadgeT}>Total: {m.totalMeals || 0}</Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.memberCost}>{formatCurrency(m.mealCost || 0)}</Text>
                    <Text style={styles.memberCostSub}>Meal Share</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 5: WEEKLY ROUTINE MENU
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'routine' && (
          <>
            <View style={styles.routineHeaderBox}>
              <Ionicons name="restaurant" size={20} color="#34d399" />
              <View style={{ flex: 1 }}>
                <Text style={styles.routineHeaderTitle}>Weekly Dining Routine</Text>
                <Text style={styles.routineHeaderSub}>Standard recurring Lunch and Dinner menu</Text>
              </View>
            </View>

            {weeklyLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </View>
            ) : (weeklyPlan?.days || []).length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="restaurant-outline" size={size} color={color} />}
                title="No weekly plan published"
                subtitle="The dining routine will appear once configured by management."
              />
            ) : (
              (weeklyPlan?.days || []).map((d, index) => {
                const isToday = d.dayName === todayName;
                return (
                  <View
                    key={d.dayName || index}
                    style={[styles.weeklyCard, isToday && styles.weeklyCardToday]}
                  >
                    <View style={styles.dayHeader}>
                      <View style={styles.dayTitleRow}>
                        <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                          {d.dayName}
                        </Text>
                        {isToday && (
                          <View style={styles.todayBadge}>
                            <Text style={styles.todayBadgeText}>TODAY</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.dayPill}>
                        <Ionicons name="calendar-outline" size={12} color="#10b981" />
                        <Text style={styles.dayPillText}>Routine</Text>
                      </View>
                    </View>

                    {/* Lunch Menu */}
                    <View style={styles.mealBox}>
                      <View style={styles.mealIconBadgeLunch}>
                        <Ionicons name="sunny" size={16} color="#10b981" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mealTypeTitle}>Lunch Menu</Text>
                        <Text style={styles.mealMenuText}>{d.lunch || 'Standard Lunch'}</Text>
                        {d.lunchNote ? (
                          <Text style={styles.mealNote}>Note: {d.lunchNote}</Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Dinner Menu */}
                    <View style={[styles.mealBox, { marginTop: 8 }]}>
                      <View style={styles.mealIconBadgeDinner}>
                        <Ionicons name="moon" size={16} color="#34d399" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mealTypeTitle}>Dinner Menu</Text>
                        <Text style={styles.mealMenuText}>{d.dinner || 'Standard Dinner'}</Text>
                        {d.dinnerNote ? (
                          <Text style={styles.mealNote}>Note: {d.dinnerNote}</Text>
                        ) : null}
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
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg, // #0f172a
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  navArrowBtn: {
    padding: 6,
  },
  navArrowBtnDisabled: {
    opacity: 0.35,
  },
  monthLabelBox: {
    paddingHorizontal: 6,
  },
  monthLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
  },
  tabScrollWrapper: {
    marginBottom: 10,
  },
  tabRow: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  tabPill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabPillActive: {
    backgroundColor: '#059669', // Emerald Green
    borderColor: '#10b981',
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
    paddingBottom: 90,
  },
  heroOverviewCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.24)',
    padding: 16,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroSubHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textDim,
    letterSpacing: 0.6,
  },
  todayCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  todayCountBig: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.6,
  },
  todayCountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34d399',
  },
  ratePill: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  ratePillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    letterSpacing: 0.5,
  },
  ratePillValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34d399',
    marginTop: 1,
  },
  todaySplitsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  splitBox: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  splitValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  splitCost: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 1,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  gridStatItem: {
    width: '48.5%',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  gridStatLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: '600',
  },
  gridStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  gridStatSub: {
    fontSize: 10,
    color: Colors.dark.textDim,
    marginTop: 1,
  },
  balanceBarWrapper: {
    marginTop: 4,
  },
  balanceBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  balanceSegmentLunch: {
    backgroundColor: '#10b981',
    height: '100%',
  },
  balanceSegmentDinner: {
    backgroundColor: '#34d399',
    height: '100%',
  },
  balanceLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  legendDotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.dark.textDim,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  sectionSub: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  countBadge: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 13,
    marginLeft: 8,
  },
  dailyCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dailyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dailyDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  dailyCostText: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  dailyBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lunchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lunchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  dinnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(52, 211, 153, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dinnerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  totalPill: {
    backgroundColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  totalPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  dailySubInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  dailyCostDetail: {
    fontSize: 10,
    color: Colors.dark.textDim,
  },
  expandedContent: {
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  expandedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  memberEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  memberEntryName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  memberEntryNote: {
    fontSize: 10,
    color: Colors.dark.textDim,
  },
  memberEntryCounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberEntryL: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  memberEntryD: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '600',
  },
  memberEntryT: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  mealSpecificCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    padding: 16,
    marginBottom: 14,
  },
  mealSpecificHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  mealSpecificIconWrapperLunch: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealSpecificIconWrapperDinner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealSpecificBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.6,
  },
  mealSpecificTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 1,
  },
  specificMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specificMetricItem: {
    width: '48.5%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  specificMetricLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: '600',
  },
  specificMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  specificMetricSub: {
    fontSize: 10,
    color: Colors.dark.textDim,
    marginTop: 1,
  },
  mealHistoryCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 8,
  },
  mealHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealHistoryDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  mealHistoryCost: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  summaryOverviewCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    padding: 16,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  summarySubtitle: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 2,
    marginBottom: 14,
  },
  statGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    width: '48.5%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  statBoxVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  statBoxSub: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  compareCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
    padding: 14,
    marginBottom: 14,
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  compareTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34d399',
  },
  compareGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  compareItem: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 10,
    padding: 8,
  },
  compareLabel: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    fontWeight: '600',
  },
  compareVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  compareSub: {
    fontSize: 10,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  memberSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  memberRoom: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 1,
  },
  memberCountsBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  memberCountBadgeL: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  memberCountBadgeD: {
    fontSize: 10,
    color: '#34d399',
    fontWeight: '600',
  },
  memberCountBadgeT: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  memberCost: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34d399',
  },
  memberCostSub: {
    fontSize: 10,
    color: Colors.dark.textDim,
  },
  routineHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 12,
  },
  routineHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  routineHeaderSub: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  weeklyCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 10,
  },
  weeklyCardToday: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
    backgroundColor: 'rgba(6, 78, 59, 0.15)',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  dayNameToday: {
    color: '#34d399',
  },
  todayBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
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
  },
  dayPillText: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  mealBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 10,
    borderRadius: 12,
  },
  mealIconBadgeLunch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealIconBadgeDinner: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
  },
  mealMenuText: {
    fontSize: 13,
    color: Colors.dark.text,
    fontWeight: '600',
    marginTop: 2,
  },
  mealNote: {
    fontSize: 10,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
});
