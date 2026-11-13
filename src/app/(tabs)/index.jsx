/**
 * Home Tab — Dorm Solution Dashboard
 * Theme: Dark Green Aesthetic (#0f172a bg, #1e293b surface, #059669 / #10b981 / #34d399)
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { usePublicOverview } from '../../features/dashboard/hooks/useDashboard';
import { useWeeklyPlan } from '../../features/meals/hooks/useMeals';
import StatCard from '../../components/shared/StatCard';
import NoticeCard from '../../components/shared/NoticeCard';
import DormLogo from '../../components/shared/DormLogo';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';
import { formatCurrency, formatDate, getMonthName } from '../../utils/helpers';

function QuickAction({ icon, label, onPress, color = '#10b981', badge = null }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={styles.quickBtn}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
        {badge ? (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.quickLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = usePublicOverview();
  const { data: weeklyPlan } = useWeeklyPlan();

  const currentMonthName = useMemo(() => {
    return data?.month ? getMonthName(data.month) : getMonthName(new Date().getMonth() + 1);
  }, [data?.month]);

  const currentYear = data?.year || new Date().getFullYear();

  // Primary live stats
  const stats = useMemo(() => [
    {
      title: 'Active Residents',
      value: isLoading ? '...' : (data?.activeMembers ?? 0),
      subtitle: `${data?.totalMembers ?? 0} total registered`,
      gradientColors: ['#059669', '#10b981'],
      icon: ({ size, color }) => <Ionicons name="people" size={size} color={color} />,
    },
    {
      title: 'Rooms Capacity',
      value: isLoading ? '...' : `${data?.occupiedRooms ?? 0}/${data?.totalRooms ?? 0}`,
      subtitle: `${data?.availableRooms ?? 0} seats open`,
      gradientColors: ['#047857', '#059669'],
      icon: ({ size, color }) => <Ionicons name="bed" size={size} color={color} />,
    },
    {
      title: 'Monthly Meals',
      value: isLoading ? '...' : (data?.totalMeals ?? 0),
      subtitle: `${currentMonthName} count`,
      gradientColors: ['#f59e0b', '#ea580c'],
      icon: ({ size, color }) => <Ionicons name="restaurant" size={size} color={color} />,
    },
    {
      title: 'Current Rate',
      value: isLoading ? '...' : formatCurrency(data?.mealRate ?? 0),
      subtitle: 'Average per meal',
      gradientColors: ['#10b981', '#34d399'],
      icon: ({ size, color }) => <Ionicons name="trending-up" size={size} color={color} />,
    },
    {
      title: 'Common Cost',
      value: isLoading ? '...' : formatCurrency(data?.commonCostPerMember ?? 0),
      subtitle: 'Per active member',
      gradientColors: ['#059669', '#064e3b'],
      icon: ({ size, color }) => <Ionicons name="receipt" size={size} color={color} />,
    },
    {
      title: 'Total Expenses',
      value: isLoading ? '...' : formatCurrency(data?.monthlyExpenses ?? 0),
      subtitle: 'Grocery & Common',
      gradientColors: ['#047857', '#10b981'],
      icon: ({ size, color }) => <Ionicons name="wallet" size={size} color={color} />,
    },
  ], [data, isLoading, currentMonthName]);

  const notices = data?.recentNotices || [];
  const todayTeam = data?.todayMarketTeam;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];
  const todayMenu = weeklyPlan?.days?.find((d) => d.dayName === todayName);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#34d399"
          />
        }
      >
        <View style={styles.content}>
          {/* Top Brand & Status Bar */}
          <View style={styles.header}>
            <DormLogo
              size={42}
              subtitle={data?.dormName ? `${data.dormName} • Live System` : 'Dormitory Management'}
            />
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SYNCED</Text>
            </View>
          </View>

          {/* Quick Access Action Hub */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionHeading}>Quick Services</Text>
            <View style={styles.quickGrid}>
              <QuickAction
                icon="megaphone-outline"
                label="Notices"
                color="#34d399"
                badge={notices.length > 0 ? `${notices.length}` : null}
                onPress={() => router.push('/(tabs)/notices')}
              />
              <QuickAction
                icon="restaurant-outline"
                label="Meal Plan"
                color="#10b981"
                onPress={() => router.push('/(tabs)/meals')}
              />
              <QuickAction
                icon="cart-outline"
                label="Bazar Duty"
                color="#f59e0b"
                onPress={() => router.push('/(tabs)/market')}
              />
              <QuickAction
                icon="bed-outline"
                label="Room Hub"
                color="#059669"
                onPress={() => router.push('/(tabs)/community')}
              />
              <QuickAction
                icon="people-outline"
                label="Residents"
                color="#34d399"
                onPress={() => router.push('/(tabs)/community')}
              />
              <QuickAction
                icon="call-outline"
                label="Helpline"
                color="#10b981"
                onPress={() => router.push('/settings')}
              />
            </View>
          </View>

          {/* Today's Market Team Highlight */}
          {todayTeam && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.highlightCardMarket}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.highlightBadgeMarket}>
                  <Ionicons name="basket" size={14} color="#f59e0b" />
                  <Text style={styles.highlightBadgeTextMarket}>Today's Bazar Team</Text>
                </View>
                <Text style={styles.highlightDate}>{formatDate(todayTeam.marketDate)}</Text>
              </View>
              <Text style={styles.teamMembersText}>
                {(todayTeam.members || []).map((m) => m.name || m.userId?.displayName || 'Resident').join(', ')}
              </Text>
              {todayTeam.note ? (
                <Text style={styles.teamNoteText}>Note: {todayTeam.note}</Text>
              ) : null}
            </Animated.View>
          )}

          {/* Today's Dining Menu */}
          {todayMenu && (
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.highlightCardMeals}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.highlightBadgeMeals}>
                  <Ionicons name="restaurant" size={14} color="#10b981" />
                  <Text style={styles.highlightBadgeTextMeals}>Today's Dining ({todayName})</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/meals')}>
                  <Text style={styles.linkText}>Weekly Menu →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.menuItemRow}>
                <Ionicons name="sunny-outline" size={15} color="#f59e0b" />
                <Text style={styles.menuLabel}>Lunch:</Text>
                <Text style={styles.menuValue} numberOfLines={1}>{todayMenu.lunch || 'Standard menu'}</Text>
              </View>
              <View style={styles.menuItemRow}>
                <Ionicons name="moon-outline" size={15} color="#34d399" />
                <Text style={styles.menuLabel}>Dinner:</Text>
                <Text style={styles.menuValue} numberOfLines={1}>{todayMenu.dinner || 'Standard menu'}</Text>
              </View>
            </Animated.View>
          )}

          {/* Dorm Overview Statistics Grid */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Financial & Dorm Overview</Text>
            <Text style={styles.sectionSubtext}>{currentMonthName} {currentYear}</Text>
          </View>
          {isLoading ? (
            <View style={styles.statsGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {stats.map((stat, i) => (
                <Animated.View key={stat.title} entering={FadeInDown.delay(i * 40)} style={styles.statItem}>
                  <StatCard {...stat} />
                </Animated.View>
              ))}
            </View>
          )}

          {/* Latest Announcements */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Latest Notices</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notices')}>
              <Text style={styles.linkText}>View Board →</Text>
            </TouchableOpacity>
          </View>
          {notices.length === 0 && !isLoading ? (
            <View style={styles.emptyNoticeBox}>
              <Ionicons name="megaphone-outline" size={26} color={Colors.dark.textDim} />
              <Text style={styles.emptyNoticeText}>No announcements posted</Text>
            </View>
          ) : (
            notices.slice(0, 3).map((notice, i) => (
              <Animated.View key={notice._id || i} entering={FadeInDown.delay(i * 50)}>
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
    backgroundColor: Colors.dark.bg, // #0f172a
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
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
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.6,
  },
  quickActionsContainer: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    letterSpacing: -0.2,
  },
  sectionSubtext: {
    fontSize: 12,
    color: Colors.dark.textDim,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 22,
  },
  linkText: {
    fontSize: 13,
    color: '#34d399',
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  quickBtn: {
    alignItems: 'center',
    width: '31%',
    backgroundColor: Colors.dark.card, // #1e293b
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#059669',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  quickLabel: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  highlightCardMarket: {
    backgroundColor: 'rgba(245, 158, 11, 0.07)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.22)',
    padding: 16,
    marginTop: 12,
  },
  highlightCardMeals: {
    backgroundColor: 'rgba(6, 78, 59, 0.25)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 16,
    marginTop: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  highlightBadgeMarket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highlightBadgeTextMarket: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
  },
  highlightBadgeMeals: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highlightBadgeTextMeals: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  highlightDate: {
    fontSize: 12,
    color: Colors.dark.textDim,
  },
  teamMembersText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
    lineHeight: 20,
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
    paddingVertical: 28,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  emptyNoticeText: {
    fontSize: 13,
    color: Colors.dark.textDim,
  },
});
