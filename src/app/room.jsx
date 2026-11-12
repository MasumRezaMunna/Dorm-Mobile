/**
 * Rooms Screen — Public Dorm Rooms Directory & Occupancy.
 * Displays all dorm rooms, floors, rent per seat, capacity, and current residents.
 */
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useRooms } from '../features/rooms/hooks/useRooms';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Colors from '../constants/colors';
import { formatCurrency, formatDate } from '../utils/helpers';

const FILTERS = ['all', 'available', 'occupied'];

export default function RoomScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const { data: rooms = [], isLoading, refetch, isRefetching } = useRooms(
    filter === 'all' ? undefined : filter
  );

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Dorm Rooms</Text>
          <Text style={styles.subtitle}>Facilities, capacity & roommates</Text>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
        contentContainerStyle={styles.scroll}
      >
        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalRooms}</Text>
            <Text style={styles.statLbl}>Total Rooms</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#10b981' }]}>{availableRooms}</Text>
            <Text style={styles.statLbl}>Available</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#f59e0b' }]}>{occupiedRooms}</Text>
            <Text style={styles.statLbl}>Occupied</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={{ gap: 12 }}>
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </View>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={({ size, color }) => <Ionicons name="bed-outline" size={size} color={color} />}
            title="No rooms match this filter"
          />
        ) : (
          rooms.map((room, idx) => {
            const occupants = room.members || [];
            const capacity = room.capacity || 1;
            const occPct = Math.min(100, Math.round((occupants.length / capacity) * 100));

            return (
              <Animated.View key={room._id} entering={FadeInDown.delay(idx * 40).duration(300)} style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <View style={styles.roomBadge}>
                    <Ionicons name="bed" size={18} color="#a78bfa" />
                    <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
                  </View>
                  <Badge label={room.status || 'available'} colorKey={room.status || 'available'} />
                </View>

                <Text style={styles.roomMeta}>
                  Floor {room.floor} • {room.type ? room.type.toUpperCase() : 'STANDARD'} • Rent: {formatCurrency(room.rent)}/month
                </Text>

                {/* Progress Bar */}
                <View style={styles.barWrapper}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${occPct}%`,
                          backgroundColor: occPct >= 100 ? '#f43f5e' : '#7c3aed',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barText}>{occupants.length}/{capacity} occupied ({capacity - occupants.length} spots left)</Text>
                </View>

                {/* Roommates */}
                <Text style={styles.roommatesHeader}>Occupants:</Text>
                {occupants.length === 0 ? (
                  <Text style={styles.noOccupants}>No residents assigned to this room.</Text>
                ) : (
                  <View style={styles.occupantsGrid}>
                    {occupants.map((occ, i) => (
                      <View key={occ._id || i} style={styles.occupantItem}>
                        <Avatar uri={occ.userId?.photoURL} name={occ.userId?.displayName} size={28} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.occName} numberOfLines={1}>
                            {occ.userId?.displayName || 'Resident'}
                          </Text>
                          {occ.joinDate ? (
                            <Text style={styles.occDate}>Joined {formatDate(occ.joinDate)}</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Animated.View>
            );
          })
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
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterPillActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7c3aed',
  },
  filterPillText: { fontSize: 12, fontWeight: '600', color: Colors.dark.textMuted },
  filterPillTextActive: { color: '#a78bfa' },
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    alignItems: 'center',
  },
  statVal: { fontSize: 18, fontWeight: '800', color: Colors.dark.text },
  statLbl: { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  roomCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomNumber: { fontSize: 20, fontWeight: '800', color: Colors.dark.text },
  roomMeta: { fontSize: 12, color: Colors.dark.textMuted, marginBottom: 12 },
  barWrapper: { marginBottom: 14 },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    marginBottom: 6,
  },
  barFill: { height: '100%', borderRadius: 4 },
  barText: { fontSize: 11, color: Colors.dark.textDim },
  roommatesHeader: { fontSize: 12, fontWeight: '600', color: Colors.dark.textMuted, marginBottom: 8 },
  noOccupants: { fontSize: 12, color: Colors.dark.textDim, fontStyle: 'italic' },
  occupantsGrid: { gap: 8 },
  occupantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 8,
    borderRadius: 10,
  },
  occName: { fontSize: 13, fontWeight: '600', color: Colors.dark.text },
  occDate: { fontSize: 10, color: Colors.dark.textDim, marginTop: 1 },
});
