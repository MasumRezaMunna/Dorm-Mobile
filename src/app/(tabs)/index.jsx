/**
 * Home Tab — Dorm Solution Main Dashboard
 * Displays live dorm overview, statistics, quick actions, today's market team,
 * meal menu preview, and recent announcements.
 *
 * All data is fetched from public read-only endpoints without login.
 */
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { usePublicOverview } from '../../features/dashboard/hooks/useDashboard';
import { useWeeklyPlan } from '../../features/meals/hooks/useMeals';
import StatCard from '../../components/shared/StatCard';
import NoticeCard from '../../components/shared/NoticeCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';
import { formatCurrency, formatDate, getMonthName } from '../../utils/helpers';

// ─── Quick Action Item ────────────────────────────────────────────────────────
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
  const { data, isLoading, refetch, isRefetching } = usePublicOverview();
  const { data: weeklyPlan } = useWeeklyPlan();

  const currentMonthName = data?.month ? getMonthName(data.month) : getMonthName(new Date().getMonth() + 1);
  const currentYear = data?.year || new Date().getFullYear();

  // ─── Dorm Statistics Cards ──────────────────────────────────────────────────
  const stats = [
    {
      title: 'Active Members',
      value: isLoading ? '...' : (data?.activeMembers ?? 0),
      subtitle: `${data?.totalMembers ?? 0} total residents`,
      gradientColors: ['#8b5cf6', '#6d28d9'],
      icon: ({ size, color }) => <Ionicons name="people" size={size} color={color} />,
    },
    {
      title: 'Rooms Occupancy',
      value: isLoading ? '...' : `${data?.occupiedRooms ?? 0}/${data?.totalRooms ?? 0}`,
      subtitle: `${data?.availableRooms ?? 0} available`,
      gradientColors: ['#3b82f6', '#2563eb'],
      icon: ({ size, color }) => <Ionicons name="bed" size={size} color={color} />,
    },
    {
      title: 'Total Meals',
      value: isLoading ? '...' : (data?.totalMeals ?? 0),
      subtitle: `In ${currentMonthName}`,
      gradientColors: ['#f59e0b', '#ea580c'],
      icon: ({ size, color }) => <Ionicons name="restaurant" size={size} color={color} />,
    },
    {
      title: 'Meal Rate',
      value: isLoading ? '...' : formatCurrency(data?.mealRate ?? 0),
      subtitle: 'Average per meal',
      gradientColors: ['#10b981', '#059669'],
      icon: ({ size, color }) => <Ionicons name="trending-up" size={size} color={color} />,
    },
    {
      title: 'Common Cost',
      value: isLoading ? '...' : formatCurrency(data?.commonCostPerMember ?? 0),
      subtitle: 'Per active member',
      gradientColors: ['#ec4899', '#be185d'],
      icon: ({ size, color }) => <Ionicons name="receipt" size={size} color={color} />,
    },
    {
      title: 'Total Expenses',
      value: isLoading ? '...' : formatCurrency(data?.monthlyExpenses ?? 0),
      subtitle: 'Grocery + Common',
      gradientColors: ['#6366f1', '#4338ca'],
      icon: ({ size, color }) => <Ionicons name="wallet" size={size} color={color} />,
    },
  ];

  const notices = data?.recentNotices || [];
  const todayTeam = data?.todayMarketTeam;

  // Derive today's meal if available
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];
  const todayMenu = weeklyPlan?.days?.find((d) => d.dayName === todayName);

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
              <View style={styles.brandBadge}>
                <Ionicons name="home" size={14} color="#a78bfa" />
                <Text style={styles.brandBadgeText}>Dorm Solution</Text>
              </View>
              <Text style={styles.greeting}>{data?.dormName || '11/38 Home'}</Text>
              <Text style={styles.subGreeting}>
                {data?.address ? data.address : 'Dorm Management System'}
              </Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            <QuickAction
              icon="megaphone-outline"
              label="Notices"
              color="#a78bfa"
              onPress={() => router.push('/(tabs)/notices')}
            />
            <QuickAction
              icon="restaurant-outline"
              label="Meals & Plan"
              color="#10b981"
              onPress={() => router.push('/meals')}
            />
            <QuickAction
              icon="cart-outline"
              label="Market Team"
              color="#f59e0b"
              onPress={() => router.push('/market')}
            />
            <QuickAction
              icon="bed-outline"
              label="Rooms"
              color="#3b82f6"
              onPress={() => router.push('/room')}
            />
            <QuickAction
              icon="people-outline"
              label="Community"
              color="#8b5cf6"
              onPress={() => router.push('/(tabs)/community')}
            />
            <QuickAction
              icon="wallet-outline"
              label="Expenses"
              color="#ec4899"
              onPress={() => router.push('/(manager)/expenses')}
            />
          </View>

          {/* Today's Market Team Card */}
          {todayTeam && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.cardHighlight}>
              <View style={styles.cardHighlightHeader}>
                <View style={styles.highlightBadge}>
                  <Ionicons name="basket" size={14} color="#f59e0b" />
                  <Text style={styles.highlightBadgeText}>Today's Bazar Duty</Text>
                </View>
                <Text style={styles.highlightDate}>{formatDate(todayTeam.marketDate)}</Text>
              </View>
              <Text style={styles.teamMembersText}>
                {(todayTeam.members || []).map((m) => m.name || m.userId?.displayName || 'Resident').join(', ')}
              </Text>
              {todayTeam.note && (
                <Text style={styles.teamNoteText}>Note: {todayTeam.note}</Text>
              )}
            </Animated.View>
          )}

          {/* Today's Menu Preview */}
          {todayMenu && (
            <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.cardMenu}>
              <View style={styles.cardHighlightHeader}>
                <View style={[styles.highlightBadge, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                  <Ionicons name="restaurant" size={14} color="#10b981" />
                  <Text style={[styles.highlightBadgeText, { color: '#10b981' }]}>Today's Menu ({todayName})</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/meals')}>
                  <Text style={styles.seeAll}>Full Plan</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.menuItemRow}>
                <Ionicons name="sunny-outline" size={14} color="#f59e0b" />
                <Text style={styles.menuLabel}>Lunch:</Text>
                <Text style={styles.menuValue} numberOfLines={1}>{todayMenu.lunch || 'Not specified'}</Text>
              </View>
              <View style={styles.menuItemRow}>
                <Ionicons name="moon-outline" size={14} color="#a78bfa" />
                <Text style={styles.menuLabel}>Dinner:</Text>
                <Text style={styles.menuValue} numberOfLines={1}>{todayMenu.dinner || 'Not specified'}</Text>
              </View>
            </Animated.View>
          )}

          {/* Overview Stats Grid */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Dorm Statistics ({currentMonthName} {currentYear})</Text>
          </View>
          {isLoading ? (
            <View style={styles.statsGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {stats.map((stat, i) => (
                <Animated.View key={stat.title} entering={FadeInDown.delay(i * 60).springify()} style={styles.statItem}>
                  <StatCard {...stat} />
                </Animated.View>
              ))}
            </View>
          )}

          {/* Recent Notices Section */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Announcements & Notices</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notices')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {notices.length === 0 && !isLoading ? (
            <View style={styles.emptyNoticeBox}>
              <Ionicons name="megaphone-outline" size={24} color={Colors.dark.textDim} />
              <Text style={styles.emptyNoticeText}>No announcements posted yet</Text>
            </View>
          ) : (
            notices.slice(0, 3).map((notice, i) => (
              <Animated.View key={notice._id || i} entering={FadeInDown.delay(i * 60)}>
                <NoticeCard
                  notice={notice}
                  onPress={() => router.push(`/notices/${notice._id}`)}
                />
              </Animated.View>
            ))
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(167,139,250,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.4,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
    marginTop: 18,
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
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  quickBtn: {
    alignItems: 'center',
    width: '31%',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 11,
    color: Colors.dark.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardHighlight: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    padding: 16,
    marginTop: 14,
  },
  cardMenu: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    padding: 16,
    marginTop: 12,
  },
  cardHighlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highlightBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
  },
  highlightDate: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  teamMembersText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  teamNoteText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  menuValue: {
    fontSize: 13,
    color: Colors.dark.text,
    fontWeight: '500',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: '48%',
  },
  emptyNoticeBox: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  emptyNoticeText: {
    fontSize: 13,
    color: Colors.dark.textDim,
  },
});
