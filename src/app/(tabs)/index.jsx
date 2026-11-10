/**
 * Home Tab — Member Dashboard
 * Shows: greeting, financial stats, quick actions, recent notices, market duties
 */
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import useAuthStore from '../../store/authStore';
import { useMemberDashboard, useManagerDashboard } from '../../features/dashboard/hooks/useDashboard';
import StatCard from '../../components/shared/StatCard';
import NoticeCard from '../../components/shared/NoticeCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/helpers';

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({ icon, label, onPress, color = '#7c3aed' }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.quickBtn}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  const memberQuery   = useMemberDashboard();
  const managerQuery  = useManagerDashboard();

  const { data, isLoading, refetch, isRefetching } = isManager ? managerQuery : memberQuery;

  // ─── Build stats for member ─────────────────────────────────────────────────
  const memberStats = [
    {
      title: 'Total Meals',
      value: isLoading ? '...' : (data?.mealThisMonth ?? 0),
      subtitle: 'Your meals this month',
      gradientColors: ['#f59e0b', '#ea580c'],
      icon: ({ size, color }) => <Ionicons name="restaurant" size={size} color={color} />,
    },
    {
      title: 'Food Cost',
      value: isLoading ? '...' : formatCurrency((data?.mealThisMonth ?? 0) * (data?.mealRate ?? 0)),
      subtitle: `৳${(data?.mealRate ?? 0).toFixed(2)} per meal`,
      gradientColors: ['#10b981', '#059669'],
      icon: ({ size, color }) => <Ionicons name="cart" size={size} color={color} />,
    },
    {
      title: 'Total Payable',
      value: isLoading ? '...' : formatCurrency(
        (data?.mealThisMonth ?? 0) * (data?.mealRate ?? 0) + (data?.commonCostPerMember ?? 0)
      ),
      subtitle: 'Food + common expense',
      gradientColors: ['#8b5cf6', '#6d28d9'],
      icon: ({ size, color }) => <Ionicons name="receipt" size={size} color={color} />,
    },
    {
      title: 'Amount Paid',
      value: isLoading ? '...' : formatCurrency(data?.memberPaidThisMonth ?? 0),
      subtitle: 'Payments this month',
      gradientColors: ['#3b82f6', '#2563eb'],
      icon: ({ size, color }) => <Ionicons name="trending-up" size={size} color={color} />,
    },
  ];

  // ─── Build stats for manager ────────────────────────────────────────────────
  const managerStats = [
    {
      title: 'Total Members',
      value: isLoading ? '...' : (data?.overview?.totalMembers ?? 0),
      subtitle: `${data?.overview?.activeMembers ?? 0} active`,
      gradientColors: ['#8b5cf6', '#6d28d9'],
      icon: ({ size, color }) => <Ionicons name="people" size={size} color={color} />,
    },
    {
      title: 'Rooms',
      value: isLoading ? '...' : `${data?.overview?.occupiedRooms ?? 0}/${data?.overview?.totalRooms ?? 0}`,
      subtitle: `${data?.overview?.availableRooms ?? 0} available`,
      gradientColors: ['#3b82f6', '#2563eb'],
      icon: ({ size, color }) => <Ionicons name="bed" size={size} color={color} />,
    },
    {
      title: 'Monthly Income',
      value: isLoading ? '...' : formatCurrency(data?.overview?.monthlyIncome ?? 0),
      subtitle: 'Total collected',
      gradientColors: ['#10b981', '#059669'],
      icon: ({ size, color }) => <Ionicons name="trending-up" size={size} color={color} />,
    },
    {
      title: 'Meal Rate',
      value: isLoading ? '...' : formatCurrency(data?.overview?.mealRate ?? 0),
      subtitle: 'Per meal this month',
      gradientColors: ['#f59e0b', '#ea580c'],
      icon: ({ size, color }) => <Ionicons name="restaurant" size={size} color={color} />,
    },
  ];

  const stats = isManager ? managerStats : memberStats;
  const notices = data?.notices || data?.recentNotices || [];
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#a78bfa"
          />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
              <Text style={styles.subGreeting}>Welcome to 11/38 Home</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={styles.notifBtn}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.dark.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Manager Switch Button */}
          {isManager && (
            <TouchableOpacity
              onPress={() => router.push('/(manager)')}
              activeOpacity={0.85}
              style={{ borderRadius: 14, marginBottom: 16 }}
            >
              <LinearGradient
                colors={['#7c3aed', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.managerBtn}
              >
                <Ionicons name="shield-checkmark" size={18} color="#fff" />
                <Text style={styles.managerBtnText}>Open Manager Dashboard</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Stats Grid */}
          <Text style={styles.sectionTitle}>This Month</Text>
          {isLoading ? (
            <View style={styles.statsGrid}>
              {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {stats.map((stat, i) => (
                <Animated.View key={stat.title} entering={FadeInDown.delay(i * 80).springify()} style={styles.statItem}>
                  <StatCard {...stat} />
                </Animated.View>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="alert-circle-outline"
              label="Complaints"
              color="#f59e0b"
              onPress={() => router.push('/complaints')}
            />
            <QuickAction
              icon="bed-outline"
              label="My Room"
              color="#8b5cf6"
              onPress={() => router.push('/room')}
            />
            <QuickAction
              icon="restaurant-outline"
              label="Meals"
              color="#10b981"
              onPress={() => router.push('/meals')}
            />
            <QuickAction
              icon="cart-outline"
              label="Market"
              color="#3b82f6"
              onPress={() => router.push('/market')}
            />
          </View>

          {/* Recent Notices */}
          {notices.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Recent Notices</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/notices')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {notices.slice(0, 3).map((notice, i) => (
                <Animated.View key={notice._id || i} entering={FadeInDown.delay(i * 60)}>
                  <NoticeCard
                    notice={notice}
                    onPress={() => router.push(`/notices/${notice._id}`)}
                  />
                </Animated.View>
              ))}
            </>
          )}

          {/* Open Complaints (Manager) */}
          {isManager && (data?.recentComplaints || []).length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Open Complaints</Text>
              {(data.recentComplaints || []).slice(0,3).map((c, i) => (
                <Animated.View key={c._id || i} entering={FadeInDown.delay(i * 60)}>
                  <TouchableOpacity
                    onPress={() => router.push('/(manager)/complaints')}
                    style={styles.complaintRow}
                  >
                    <Ionicons name="time-outline" size={18} color="#f59e0b" />
                    <View style={styles.complaintInfo}>
                      <Text style={styles.complaintTitle}>{c.title}</Text>
                      <Text style={styles.complaintMeta}>
                        {c.memberId?.userId?.displayName || 'Unknown'} · {c.type}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={Colors.dark.textDim} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
    letterSpacing: -0.3,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  managerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  managerBtnText: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
    marginTop: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 20,
  },
  seeAll: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: '48%',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  quickBtn: {
    alignItems: 'center',
    flex: 1,
    minWidth: '20%',
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  quickLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  complaintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 8,
  },
  complaintInfo: { flex: 1 },
  complaintTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  complaintMeta: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
});
