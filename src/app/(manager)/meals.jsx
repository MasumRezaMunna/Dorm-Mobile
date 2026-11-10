/**
 * Manager Meals Screen — summary of all members' meals
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useMonthlySummary } from '../../features/meals/hooks/useMeals';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import { getCurrentMonthYear, getMonthName, formatCurrency } from '../../utils/helpers';

export default function ManagerMealsScreen() {
  const router = useRouter();
  const { month, year } = getCurrentMonthYear();
  const { data: summary, isLoading, refetch, isRefetching } = useMonthlySummary(month, year);

  const members = summary?.members || [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Meals Summary</Text>
          <Text style={styles.subtitle}>{getMonthName(month)} {year}</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary?.totalMeals || 0}</Text>
          <Text style={styles.summaryLabel}>Total Meals</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatCurrency(summary?.mealRate || 0)}</Text>
          <Text style={styles.summaryLabel}>Meal Rate</Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 2 }]}>Member</Text>
        <Text style={[styles.headerText, styles.headerCenter]}>Total Meals</Text>
        <Text style={[styles.headerText, styles.headerRight]}>Cost</Text>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item, index) => item.memberId || String(index)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
          renderItem={({ item, index }) => (
            <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
              <View style={{ flex: 2 }}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.room}>Room {item.room?.roomNumber || 'N/A'}</Text>
              </View>
              <Text style={styles.statCenter}>{item.totalMeals || 0}</Text>
              <Text style={styles.statRight}>{formatCurrency(item.mealCost || 0)}</Text>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={({ size, color }) => <Ionicons name="restaurant-outline" size={size} color={color} />}
              title="No meal data"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, backgroundColor: Colors.dark.card,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  summaryCard: {
    flexDirection: 'row', backgroundColor: Colors.dark.card,
    marginHorizontal: 16, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.dark.border, padding: 16, marginBottom: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  summaryLabel: { fontSize: 11, color: Colors.dark.textDim, marginTop: 4 },
  dividerV: { width: 1, backgroundColor: Colors.dark.border },
  tableHeader: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.dark.border, marginBottom: 4,
  },
  headerText: { fontSize: 11, fontWeight: '600', color: Colors.dark.textDim, textTransform: 'uppercase' },
  headerCenter: { flex: 1, textAlign: 'center' },
  headerRight: { flex: 1, textAlign: 'right' },
  list: { paddingBottom: 48 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  rowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  name: { fontSize: 14, fontWeight: '600', color: Colors.dark.text },
  room: { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  statCenter: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '700', color: Colors.dark.text },
  statRight: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: '700', color: '#10b981' },
});
