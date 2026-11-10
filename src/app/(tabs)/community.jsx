/**
 * Community Tab — transparency table showing all members' meals & payments.
 * Matches the web app's CommunityPage.
 */
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useCommunityStats } from '../../features/dashboard/hooks/useDashboard';
import Avatar from '../../components/ui/Avatar';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import { formatCurrency, getMonthName } from '../../utils/helpers';

const currentMonth = getMonthName(new Date().getMonth() + 1);

function MemberRow({ item, index }) {
  return (
    <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
      <Avatar uri={item.photoURL} name={item.name} size={36} />
      <View style={styles.nameCol}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.room}>Room {item.room?.roomNumber || 'N/A'}</Text>
      </View>
      <View style={styles.statCol}>
        <Text style={styles.statValue}>{item.totalMeals}</Text>
        <Text style={styles.statLabel}>meals</Text>
      </View>
      <View style={styles.statCol}>
        <Text style={styles.statValue}>{formatCurrency(item.totalPaid)}</Text>
        <Text style={styles.statLabel}>paid</Text>
      </View>
    </View>
  );
}

export default function CommunityTab() {
  const { data: members = [], isLoading, refetch, isRefetching } = useCommunityStats();

  const totalMeals = members.reduce((s, m) => s + m.totalMeals, 0);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Stats for {currentMonth}</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="people" size={20} color="#a78bfa" />
          <Text style={styles.summaryValue}>{members.length}</Text>
          <Text style={styles.summaryLabel}>Active Members</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="restaurant" size={20} color="#f59e0b" />
          <Text style={styles.summaryValue}>{totalMeals}</Text>
          <Text style={styles.summaryLabel}>Total Meals</Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 2 }]}>Member</Text>
        <Text style={[styles.headerText, styles.headerCenter]}>Meals</Text>
        <Text style={[styles.headerText, styles.headerCenter]}>Paid</Text>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16 }}>
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={item => item.memberId}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => <MemberRow item={item} index={index} />}
          ListEmptyComponent={
            <EmptyState
              icon={({ size, color }) => <Ionicons name="people-outline" size={size} color={color} />}
              title="No members found"
            />
          }
        />
      )}
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
    paddingTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  rowAlt: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  nameCol: {
    flex: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  room: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.dark.textDim,
  },
});
