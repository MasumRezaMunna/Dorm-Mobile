/**
 * Home Tab — Dorm Solution Dashboard
 * Theme: Dark Green Aesthetic (#0f172a bg, #1e293b surface, #059669 / #10b981 / #34d399)
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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

function QuickServiceCard({ icon, label, sublabel, onPress, color = '#10b981', badge = null }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.serviceCard}>
      <View style={[styles.serviceIconWrapper, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
        {badge ? (
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.serviceTextCol}>
        <Text style={styles.serviceLabel} numberOfLines={1}>{label}</Text>
        {sublabel ? <Text style={styles.serviceSublabel} numberOfLines={1}>{sublabel}</Text> : null}
      </View>
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeftRow}>
              <DormLogo size={42} showLabel={false} />
              <View>
                <Text style={styles.headerTitle}>Home</Text>
                <Text style={styles.headerSubtitle}>{currentMonthName} {currentYear}</Text>
              </View>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SYNCED</Text>
            </View>
          </View>

          {/* Quick Services — Dedicated Resident Hub */}
          <View style={styles.quickActionsContainer}>
            <View style={styles.quickHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Quick Services</Text>
                <Text style={styles.sectionSubtext}>Access all dorm utilities & records</Text>
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickServiceCard
                icon="megaphone-outline"
                label="Notices"
                sublabel="Circulars & news"
                color="#34d399"
                badge={notices.length > 0 ? `${notices.length}` : null}
                onPress={() => router.push('/(tabs)/notices')}
              />
              <QuickServiceCard
                icon="cart-outline"
                label="Bazar Duty"
                sublabel="Shopping teams"
                color="#10b981"
                badge={todayTeam ? 'Active' : null}
                onPress={() => router.push('/(tabs)/market')}
              />
              <QuickServiceCard
                icon="bed-outline"
                label="Room Hub"
                sublabel="Seats & capacity"
                color="#059669"
                onPress={() => router.push('/room')}
              />
              <QuickServiceCard
                icon="people-outline"
                label="Residents"
                sublabel="Member roster"
                color="#34d399"
                onPress={() => router.push('/(tabs)/community')}
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

          {/* Financial Overview Statistics Grid */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Financial Overview</Text>
            <Text style={styles.sectionSubtext}>{currentMonthName} {currentYear}</Text>
          </View>
          {isLoading ? (
            <View style={styles.statsGrid}>
              {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
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
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 6,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 2,
    fontWeight: '500',
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
    marginBottom: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
    padding: 16,
  },
  quickHeaderRow: {
    marginBottom: 12,
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
    marginTop: 2,
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
    gap: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48.5%',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  serviceIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  serviceBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#059669',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  serviceBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  serviceTextCol: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  serviceSublabel: {
    fontSize: 10,
    color: Colors.dark.textDim,
    marginTop: 1,
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
