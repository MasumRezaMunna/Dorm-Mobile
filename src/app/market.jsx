/**
 * Market Schedule Screen — member's duty schedule.
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import api from '../services/api';
import { QUERY_KEYS } from '../utils/constants';
import { CardSkeleton } from '../components/ui/Skeleton';
import Colors from '../constants/colors';
import { formatDate } from '../utils/helpers';

export default function MarketScreen() {
  const router = useRouter();

  const { data: mySchedules, isLoading, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.MARKET_ME,
    queryFn: async () => {
      const { data } = await api.get('/market-schedules/me');
      return data.data;
    },
  });

  const { data: todaySchedule } = useQuery({
    queryKey: QUERY_KEYS.MARKET_TODAY,
    queryFn: async () => {
      const { data } = await api.get('/market-schedules/today');
      return data.data;
    },
  });

  const schedules = mySchedules?.schedules || [];
  const summary   = mySchedules?.summary || {};

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Market Schedule</Text>
          <Text style={styles.subtitle}>Your shopping duties</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
        contentContainerStyle={styles.scroll}
      >
        {/* Today's Team */}
        {todaySchedule && (
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Ionicons name="calendar" size={16} color="#10b981" />
              <Text style={styles.todayTitle}>Today's Market Team</Text>
            </View>
            <Text style={styles.todayDate}>{formatDate(todaySchedule.date)}</Text>
            {(todaySchedule.members || []).map((m, i) => (
              <Text key={i} style={styles.todayMember}>
                • {m.userId?.displayName || m.name || 'Unknown'}
              </Text>
            ))}
          </View>
        )}

        {/* My Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.totalDuties || 0}</Text>
            <Text style={styles.statLabel}>Total Duties</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.nextAssignedDate ? formatDate(summary.nextAssignedDate) : 'None'}</Text>
            <Text style={styles.statLabel}>Next Duty</Text>
          </View>
        </View>

        {/* Schedule List */}
        <Text style={styles.sectionTitle}>My Assignments</Text>
        {isLoading ? (
          <CardSkeleton />
        ) : schedules.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={40} color="rgba(167,139,250,0.3)" />
            <Text style={styles.emptyText}>No market duties assigned yet</Text>
          </View>
        ) : (
          schedules.map((s, i) => (
            <View key={s._id || i} style={styles.scheduleRow}>
              <View style={styles.scheduleDate}>
                <Text style={styles.scheduleDateText}>{formatDate(s.date)}</Text>
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTeam}>
                  {(s.members || []).map(m => m.userId?.displayName || '?').join(', ')}
                </Text>
                {s.note && <Text style={styles.scheduleNote}>{s.note}</Text>}
              </View>
              <View style={[styles.scheduleStatus, {
                backgroundColor: s.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'
              }]}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: s.status === 'completed' ? '#10b981' : '#f59e0b' }}>
                  {s.status === 'completed' ? 'Done' : 'Upcoming'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
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
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  todayCard: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    padding: 16,
    marginBottom: 16,
  },
  todayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  todayTitle: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  todayDate: { fontSize: 12, color: Colors.dark.textMuted, marginBottom: 8 },
  todayMember: { fontSize: 13, color: Colors.dark.text, marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.dark.text, marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.dark.textDim },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark.text, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.dark.textDim },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  scheduleDate: { width: 90 },
  scheduleDateText: { fontSize: 12, color: Colors.dark.textMuted },
  scheduleInfo: { flex: 1 },
  scheduleTeam: { fontSize: 13, fontWeight: '600', color: Colors.dark.text },
  scheduleNote: { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  scheduleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
