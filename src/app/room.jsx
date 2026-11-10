/**
 * My Room Screen — room details and roommates list.
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useMyRoom } from '../features/members/hooks/useMembers';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Colors from '../constants/colors';
import { formatDate, formatCurrency } from '../utils/helpers';

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

export default function RoomScreen() {
  const router = useRouter();
  const { data: room, isLoading, refetch, isRefetching } = useMyRoom();

  const occupants = room?.currentOccupants || room?.members || [];
  const capacity  = room?.capacity || 1;
  const fillPct   = Math.min(100, (occupants.length / capacity) * 100);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>My Room</Text>
          <Text style={styles.subtitle}>Room details and roommates</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : !room ? (
        <EmptyState
          icon={({ size, color }) => <Ionicons name="bed-outline" size={size} color={color} />}
          title="No room assigned"
          subtitle="Please contact your manager."
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
          contentContainerStyle={styles.scroll}
        >
          {/* Room Card */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.roomCard}>
            <View style={styles.roomHeader}>
              <View style={styles.roomIcon}>
                <Ionicons name="bed" size={28} color="#a78bfa" />
              </View>
              <Badge label={room.status} colorKey={room.status} />
            </View>
            <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
            <Text style={styles.roomType}>{room.type} · Floor {room.floor}</Text>

            {/* Occupancy Bar */}
            <View style={styles.barWrapper}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${fillPct}%` }]} />
              </View>
              <Text style={styles.barText}>{occupants.length}/{capacity} occupied</Text>
            </View>

            {/* Details */}
            <View style={styles.details}>
              <InfoRow label="Floor" value={String(room.floor)} />
              <InfoRow label="Type" value={room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : ''} />
              <InfoRow label="Capacity" value={`${capacity} persons`} />
              <InfoRow label="Monthly Rent" value={formatCurrency(room.rent)} />
              {room.amenities?.length > 0 && (
                <InfoRow label="Amenities" value={room.amenities.join(', ')} />
              )}
            </View>
          </Animated.View>

          {/* Roommates */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.roommatesCard}>
            <View style={styles.roommatesHeader}>
              <Ionicons name="people" size={18} color="#a78bfa" />
              <Text style={styles.roommatesTitle}>Roommates</Text>
            </View>
            {occupants.length === 0 ? (
              <Text style={styles.noRoomates}>No other occupants in this room.</Text>
            ) : (
              occupants.map((m, i) => (
                <View key={m._id || i} style={[styles.roommateRow, i < occupants.length - 1 && styles.roommateRowBorder]}>
                  <Avatar uri={m.avatar || m.photoURL} name={m.name || m.userId?.displayName} size={40} />
                  <View style={styles.roommateInfo}>
                    <Text style={styles.roommateName}>{m.name || m.userId?.displayName || 'Unknown'}</Text>
                    <Text style={styles.roommateDetail}>{m.phone || m.email || m.userId?.email || ''}</Text>
                  </View>
                  <Text style={styles.joinDate}>Since {formatDate(m.joinDate)}</Text>
                </View>
              ))
            )}
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  roomCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 20,
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomIcon: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -1,
    marginBottom: 4,
  },
  roomType: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  barWrapper: {
    marginBottom: 16,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    marginBottom: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  barText: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
    textTransform: 'capitalize',
  },
  roommatesCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
  },
  roommatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  roommatesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  noRoomates: {
    fontSize: 13,
    color: Colors.dark.textDim,
    paddingVertical: 8,
  },
  roommateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  roommateRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  roommateInfo: {
    flex: 1,
  },
  roommateName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  roommateDetail: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  joinDate: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
});
