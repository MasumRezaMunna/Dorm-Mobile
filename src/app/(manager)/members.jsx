/**
 * Members Directory Screen
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
  const name = item.name || item.userId?.displayName || 'Resident';
  const photo = item.photoURL || item.userId?.photoURL;
  const room = item.room?.roomNumber || item.roomId?.roomNumber;

  return (
    <View style={styles.item}>
      <Avatar
        uri={photo}
        name={name}
        size={46}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.id}>ID: {item.memberId}</Text>
        {room && <Text style={styles.roomNum}>Room {room}</Text>}
      </View>
      <View style={styles.right}>
        <Badge label={item.status || 'active'} colorKey={item.status || 'active'} />
        {item.totalMeals !== undefined && (
          <Text style={styles.mealsText}>{item.totalMeals} meals</Text>
        )}
      </View>
    </View>
  );
}

export default function ManagerMembersScreen() {
  const router = useRouter();
  const { data: members = [], isLoading, refetch, isRefetching } = useMembers();
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) => {
    const name = (m.name || m.userId?.displayName || '').toLowerCase();
    const id = (m.memberId || '').toLowerCase();
    const room = (m.room?.roomNumber || m.roomId?.roomNumber || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || id.includes(q) || room.includes(q);
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Residents Directory</Text>
          <Text style={styles.subtitle}>{members.length} total residents</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={Colors.dark.textDim} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, ID or room..."
          placeholderTextColor={Colors.dark.textDim}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.dark.textDim} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.memberId || item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#34d399" />}
          renderItem={({ item }) => <MemberItem item={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="person-outline" size={40} color="rgba(16,185,129,0.3)" />
              <Text style={styles.emptyText}>No residents found</Text>
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
    marginHorizontal: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.dark.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.dark.text },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.dark.border,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.dark.text },
  id:   { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  roomNum: { fontSize: 12, color: '#34d399', marginTop: 2, fontWeight: '500' },
  right: { alignItems: 'flex-end', gap: 4 },
  mealsText: { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.dark.textDim },
});
