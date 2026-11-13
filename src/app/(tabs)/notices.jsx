/**
 * Notices Tab — full notice feed with live search, priority filtering,
 * and Bookmarked filter for instant offline retrieval.
 * Theme: Emerald & Mint Green on Dark Slate (#0f172a)
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useNotices } from '../../features/notices/hooks/useNotices';
import NoticeCard from '../../components/shared/NoticeCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import { useBookmarkStore } from '../../store/bookmarkStore';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'bookmarked', label: 'Bookmarked' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

export default function NoticesTab() {
  const router = useRouter();
  const { data: notices = [], isLoading, refetch, isRefetching } = useNotices();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const bookmarkedIds = useBookmarkStore((state) => state.bookmarkedIds);

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filter === 'all') return true;
      if (filter === 'bookmarked') return bookmarkedIds.includes(n._id);
      return n.priority === filter;
    });
  }, [notices, search, filter, bookmarkedIds]);

  const renderItem = useCallback(
    ({ item }) => (
      <NoticeCard
        notice={item}
        onPress={() => router.push(`/notices/${item._id}`)}
      />
    ),
    [router]
  );

  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notice Board</Text>
          <Text style={styles.subtitle}>
            {notices.length} active announcement{notices.length === 1 ? '' : 's'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setFilter(filter === 'bookmarked' ? 'all' : 'bookmarked')}
          style={[styles.savedHeaderBtn, filter === 'bookmarked' && styles.savedHeaderBtnActive]}
        >
          <Ionicons
            name={filter === 'bookmarked' ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={filter === 'bookmarked' ? '#ffffff' : '#34d399'}
          />
          <Text style={[styles.savedBtnText, filter === 'bookmarked' && styles.savedBtnTextActive]}>
            {bookmarkedIds.length} Saved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={Colors.dark.textDim} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search announcements or topics..."
          placeholderTextColor={Colors.dark.textDim}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.dark.textDim} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredNotices}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#34d399" />
          }
          ListEmptyComponent={
            <EmptyState
              icon={({ size, color }) => (
                <Ionicons
                  name={filter === 'bookmarked' ? 'bookmark-outline' : 'megaphone-outline'}
                  size={size}
                  color={color}
                />
              )}
              title={filter === 'bookmarked' ? 'No saved notices' : 'No notices found'}
              subtitle={
                filter === 'bookmarked'
                  ? 'Tap the bookmark icon on any notice to save it for quick offline reference.'
                  : 'Try adjusting your search query or filter.'
              }
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
    backgroundColor: Colors.dark.bg, // #0f172a
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  savedHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  savedHeaderBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#10b981',
  },
  savedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
  },
  savedBtnTextActive: {
    color: '#ffffff',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface, // #1e293b
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterPillActive: {
    backgroundColor: '#059669', // Emerald green
    borderColor: '#10b981',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
