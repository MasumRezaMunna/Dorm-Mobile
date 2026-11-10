/**
 * Notices Tab — full notice feed with search and filter.
 */
import { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useNotices } from '../../features/notices/hooks/useNotices';
import NoticeCard from '../../components/shared/NoticeCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';

const PRIORITY_FILTERS = ['all', 'urgent', 'high', 'medium', 'low'];

export default function NoticesTab() {
  const router = useRouter();
  const { data: notices = [], isLoading, refetch, isRefetching } = useNotices();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = notices.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase())
      || n.content.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || n.priority === filter;
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notice Board</Text>
        <Text style={styles.subtitle}>{notices.length} notices</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={Colors.dark.textDim} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search notices..."
          placeholderTextColor={Colors.dark.textDim}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.dark.textDim} />
          </TouchableOpacity>
        )}
      </View>

      {/* Priority Filter Pills */}
      <View style={styles.filterRow}>
        {PRIORITY_FILTERS.map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setFilter(p)}
            style={[styles.filterPill, filter === p && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === p && styles.filterTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />
          }
          renderItem={({ item }) => (
            <NoticeCard
              notice={item}
              onPress={() => router.push(`/notices/${item._id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={({ size, color }) => <Ionicons name="megaphone-outline" size={size} color={color} />}
              title="No notices found"
              subtitle={search ? 'Try a different search term.' : 'Check back later for announcements.'}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterPillActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7c3aed',
  },
  filterText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#a78bfa',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
