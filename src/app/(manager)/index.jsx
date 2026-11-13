/**
 * Manager Dashboard Screen
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useManagerDashboard } from '../../features/dashboard/hooks/useDashboard';
import StatCard from '../../components/shared/StatCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';
import { formatCurrency } from '../../utils/helpers';

function NavCard({ icon, label, route, color = '#10b981' }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(route)}
      activeOpacity={0.8}
      style={styles.navCard}
    >
      <View style={[styles.navIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.navLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.dark.textDim} />
    </TouchableOpacity>
  );
}

export default function ManagerDashboardScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useManagerDashboard();

  const overview = data?.overview || data || {};

  const stats = [
    {
      title: 'Active Members',
      value: isLoading ? '...' : overview.activeMembers ?? 0,
      subtitle: `${overview.totalMembers ?? 0} total`,
      gradientColors: ['#059669', '#10b981'],
      icon: ({ size, color }) => <Ionicons name="people" size={size} color={color} />,
    },
    {
      title: 'Rooms',
      value: isLoading ? '...' : `${overview.occupiedRooms ?? 0}/${overview.totalRooms ?? 0}`,
      subtitle: `${overview.availableRooms ?? 0} available`,
      gradientColors: ['#3b82f6', '#2563eb'],
      icon: ({ size, color }) => <Ionicons name="bed" size={size} color={color} />,
    },
    {
      title: 'Monthly Income',
      value: isLoading ? '...' : formatCurrency(overview.monthlyIncome ?? 0),
      subtitle: 'Collected this month',
      gradientColors: ['#10b981', '#059669'],
      icon: ({ size, color }) => <Ionicons name="trending-up" size={size} color={color} />,
    },
    {
      title: 'Total Expenses',
      value: isLoading ? '...' : formatCurrency(overview.monthlyExpenses ?? 0),
      subtitle: 'Grocery + Common',
      gradientColors: ['#f43f5e', '#dc2626'],
      icon: ({ size, color }) => <Ionicons name="trending-down" size={size} color={color} />,
    },
    {
      title: 'Meal Rate',
      value: isLoading ? '...' : formatCurrency(overview.mealRate ?? 0),
      subtitle: 'Per meal this month',
      gradientColors: ['#f59e0b', '#ea580c'],
      icon: ({ size, color }) => <Ionicons name="restaurant" size={size} color={color} />,
    },
    {
      title: 'Net Balance',
      value: isLoading ? '...' : formatCurrency(overview.netBalance ?? 0),
      subtitle: 'Income − Expenses',
      gradientColors: (overview.netBalance ?? 0) >= 0 ? ['#10b981', '#059669'] : ['#f43f5e', '#dc2626'],
      icon: ({ size, color }) => <Ionicons name="wallet" size={size} color={color} />,
    },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#34d399" />}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Manager Dashboard</Text>
              <Text style={styles.subtitle}>11/38 Home Admin Panel</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.dark.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <Text style={styles.sectionTitle}>Overview</Text>
          {isLoading ? (
            <View style={styles.grid}>
              {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
            </View>
          ) : (
            <View style={styles.grid}>
              {stats.map((s, i) => (
                <Animated.View key={s.title} entering={FadeInDown.delay(i * 70)} style={styles.statItem}>
                  <StatCard {...s} />
                </Animated.View>
              ))}
            </View>
          )}

          {/* Management Nav */}
          <Text style={styles.sectionTitle}>Management</Text>
          <NavCard icon="people-outline" label="Members" route="/(manager)/members" color="#34d399" />
          <NavCard icon="bed-outline"    label="Rooms"   route="/(manager)/rooms"   color="#10b981" />
          <NavCard icon="alert-circle-outline" label="Complaints" route="/(manager)/complaints" color="#f59e0b" />
          <NavCard icon="megaphone-outline" label="Notices" route="/(manager)/notices" color="#059669" />
          <NavCard icon="restaurant-outline" label="Meals" route="/(manager)/meals" color="#10b981" />
          <NavCard icon="cart-outline"   label="Market Schedule" route="/(manager)/market" color="#34d399" />
          <NavCard icon="settings-outline" label="Dorm Settings" route="/(manager)/settings" color="#64748b" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  notifBtn: {
    width: 40, height: 40,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
    marginTop: 20,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { width: '48%' },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 10,
  },
  navIcon: {
    width: 44, height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
  },
});
