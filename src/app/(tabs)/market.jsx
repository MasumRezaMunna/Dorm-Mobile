/**
 * Market Tab — Today's Bazar Team, Upcoming Schedules & Duty History.
 * Publicly viewable for all dorm residents.
 */
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  useTodayMarketSchedule,
  useUpcomingMarketSchedules,
  useMarketScheduleHistory,
} from '../../features/market/hooks/useMarket';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import { formatDate } from '../../utils/helpers';

const TABS = [
  { key: 'upcoming', label: 'Upcoming Teams' },
  { key: 'history', label: 'Past History' },
];

export default function MarketTabScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const {
    data: todaySchedule,
    isLoading: todayLoading,
    refetch: refetchToday,
    isRefetching: isRefetchingToday,
  } = useTodayMarketSchedule();

  const {
    data: upcoming = [],
    isLoading: upcomingLoading,
    refetch: refetchUpcoming,
    isRefetching: isRefetchingUpcoming,
  } = useUpcomingMarketSchedules();

  const {
    data: history = [],
    isLoading: historyLoading,
    refetch: refetchHistory,
    isRefetching: isRefetchingHistory,
  } = useMarketScheduleHistory();

  const isRefetching = isRefetchingToday || isRefetchingUpcoming || isRefetchingHistory;

  const handleRefresh = () => {
    refetchToday();
    refetchUpcoming();
    refetchHistory();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Market & Bazar</Text>
        <Text style={styles.subtitle}>Shopping duties & rotation schedule</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#a78bfa" />}
        contentContainerStyle={styles.scroll}
      >
        {/* Today's Market Team Card */}
        {todayLoading ? (
          <CardSkeleton />
        ) : todaySchedule ? (
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <View style={styles.todayIconBadge}>
                <Ionicons name="basket" size={18} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.todayBadge}>TODAY'S TEAM</Text>
                <Text style={styles.todayDateText}>{formatDate(todaySchedule.marketDate)}</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>On Duty</Text>
              </View>
            </View>

            <View style={styles.membersList}>
              {(todaySchedule.members || []).map((m, i) => (
                <View key={i} style={styles.memberChip}>
                  <Ionicons name="person-circle-outline" size={18} color="#10b981" />
                  <Text style={styles.memberChipText}>{m.name || m.userId?.displayName || 'Resident'}</Text>
                </View>
              ))}
            </View>

            {todaySchedule.note && (
              <View style={styles.noteBox}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.dark.textDim} />
                <Text style={styles.noteText}>{todaySchedule.note}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noTodayCard}>
            <Ionicons name="cart-outline" size={24} color="#64748b" />
            <Text style={styles.noTodayText}>No bazar duty assigned for today.</Text>
          </View>
        )}

        {/* Tab Selector */}
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

        {/* Tab 1: Upcoming Schedules */}
        {activeTab === 'upcoming' && (
          <>
            {upcomingLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : upcoming.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="calendar-outline" size={size} color={color} />}
                title="No upcoming teams scheduled"
                subtitle="New schedules will appear when assigned by management."
              />
            ) : (
              upcoming.map((s, idx) => (
                <View key={s._id || idx} style={styles.scheduleCard}>
                  <View style={styles.scheduleCardHeader}>
                    <View style={styles.dateBadge}>
                      <Ionicons name="calendar" size={14} color="#a78bfa" />
                      <Text style={styles.dateBadgeText}>{formatDate(s.marketDate)}</Text>
                    </View>
                    <View style={styles.upcomingTag}>
                      <Text style={styles.upcomingTagText}>Upcoming</Text>
                    </View>
                  </View>

                  <Text style={styles.teamTitle}>Assigned Team:</Text>
                  <View style={styles.teamRow}>
                    {(s.members || []).map((m, i) => (
                      <View key={i} style={styles.memberTag}>
                        <Text style={styles.memberTagText}>{m.name || m.userId?.displayName || 'Resident'}</Text>
                      </View>
                    ))}
                  </View>

                  {s.note ? (
                    <Text style={styles.scheduleNote}>Note: {s.note}</Text>
                  ) : null}
                </View>
              ))
            )}
          </>
        )}

        {/* Tab 2: Past History */}
        {activeTab === 'history' && (
          <>
            {historyLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : history.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="time-outline" size={size} color={color} />}
                title="No duty history"
              />
            ) : (
              history.map((s, idx) => (
                <View key={s._id || idx} style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyDate}>{formatDate(s.marketDate)}</Text>
                    <Text style={styles.historyMembers}>
                      {(s.members || []).map((m) => m.name || m.userId?.displayName || '?').join(', ')}
                    </Text>
                  </View>
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={styles.completedBadgeText}>Done</Text>
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
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  todayCard: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    padding: 16,
    marginBottom: 16,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  todayIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBadge: { fontSize: 11, fontWeight: '800', color: '#10b981', letterSpacing: 0.5 },
  todayDateText: { fontSize: 13, color: Colors.dark.text, fontWeight: '600', marginTop: 1 },
  activePill: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activePillText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  memberChipText: { fontSize: 13, fontWeight: '600', color: Colors.dark.text },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  noteText: { fontSize: 12, color: Colors.dark.textDim, fontStyle: 'italic' },
  noTodayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 16,
  },
  noTodayText: { fontSize: 13, color: Colors.dark.textMuted },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
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
  scheduleCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 10,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateBadgeText: { fontSize: 13, fontWeight: '700', color: '#a78bfa' },
  upcomingTag: {
    backgroundColor: 'rgba(167,139,250,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  upcomingTagText: { fontSize: 11, fontWeight: '600', color: '#a78bfa' },
  teamTitle: { fontSize: 12, color: Colors.dark.textDim, marginBottom: 6 },
  teamRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  memberTag: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  memberTagText: { fontSize: 13, color: Colors.dark.text, fontWeight: '500' },
  scheduleNote: { fontSize: 12, color: Colors.dark.textDim, marginTop: 4 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  historyDate: { fontSize: 13, fontWeight: '700', color: Colors.dark.text },
  historyMembers: { fontSize: 12, color: Colors.dark.textMuted, marginTop: 2 },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadgeText: { fontSize: 11, fontWeight: '600', color: '#10b981' },
});

