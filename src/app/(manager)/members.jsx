/**
 * Manager Members Screen — list all members with status info.
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useMembers } from '../../features/members/hooks/useMembers';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';

function MemberItem({ item }) {
  return (
    <View style={styles.item}>
      <Avatar
        uri={item.userId?.photoURL}
        name={item.userId?.displayName}
        size={48}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.userId?.displayName || 'Unknown'}</Text>
        <Text style={styles.id}>ID: {item.memberId}</Text>
        <Text style={styles.detail} numberOfLines={1}>{item.userId?.email}</Text>
      </View>
      <View style={styles.right}>
        <Badge label={item.status} colorKey={item.status} />
        {item.roomId?.roomNumber && (
          <Text style={styles.roomNum}>Room {item.roomId.roomNumber}</Text>
        )}
      </View>
    </View>
  );
}

export default function ManagerMembersScreen() {
  const router = useRouter();
  const { data: members = [], isLoading, refetch, isRefetching } = useMembers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = members.filter(m => {
    const name  = m.userId?.displayName?.toLowerCase() || '';
    const email = m.userId?.email?.toLowerCase() || '';
    const id    = m.memberId?.toLowerCase() || '';
    const matchSearch = name.includes(search.toLowerCase())
      || email.includes(search.toLowerCase())
      || id.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = members.filter(m => m.status === 'active').length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Members</Text>
          <Text style={styles.subtitle}>{activeCount} active / {members.length} total</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={Colors.dark.textDim} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, ID..."
          placeholderTextColor={Colors.dark.textDim}
          style={styles.searchInput}
        />
      </View>

      {/* Status Filter */}
      <View style={styles.filterRow}>
        {['all', 'active', 'inactive', 'left'].map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatusFilter(s)}
            style={[styles.pill, statusFilter === s && styles.pillActive]}
          >
            <Text style={[styles.pillText, statusFilter === s && styles.pillTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
          renderItem={({ item }) => <MemberItem item={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="person-outline" size={40} color="rgba(167,139,250,0.3)" />
              <Text style={styles.emptyText}>No members found</Text>
            </View>
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
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.dark.card, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.dark.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.dark.text },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border,
  },
  pillActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: '#7c3aed' },
  pillText: { fontSize: 12, color: Colors.dark.textMuted, fontWeight: '500' },
  pillTextActive: { color: '#a78bfa' },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.dark.border,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.dark.text },
  id:   { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  detail: { fontSize: 12, color: Colors.dark.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  roomNum: { fontSize: 11, color: Colors.dark.textDim, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.dark.textDim },
});
