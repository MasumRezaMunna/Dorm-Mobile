/**
 * Notice Detail Screen — Full content of a single notice with bookmarking,
 * sharing capabilities, and high readability styling.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useNoticeById } from '../../features/notices/hooks/useNotices';
import Badge from '../../components/ui/Badge';
import Colors from '../../constants/colors';
import { formatDate } from '../../utils/helpers';
import { useBookmarkStore } from '../../store/bookmarkStore';

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: notice, isLoading } = useNoticeById(id);

  const isBookmarked = useBookmarkStore((state) => state.bookmarkedIds.includes(id));
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  const handleShare = async () => {
    if (!notice) return;
    try {
      await Share.share({
        title: notice.title,
        message: `📢 [Dorm Solution Notice] ${notice.title}\n\n${notice.content}\n\nPublished: ${formatDate(notice.createdAt)}`,
      });
    } catch (e) {
      // dismissed
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcement</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => toggleBookmark(id)}
            style={styles.actionIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#a78bfa' : Colors.dark.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionIconBtn} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={20} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '70%', marginTop: 12 }]} />
          <View style={[styles.skeletonLine, { width: '90%', height: 100, marginTop: 24 }]} />
        </View>
      ) : !notice ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.dark.textDim} />
          <Text style={styles.notFound}>Notice not found or removed.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {notice.isPinned && (
            <View style={styles.pinnedBanner}>
              <Ionicons name="pin" size={14} color="#f59e0b" />
              <Text style={styles.pinnedText}>Pinned Dorm Announcement</Text>
            </View>
          )}

          <Text style={styles.title}>{notice.title}</Text>

          <View style={styles.metaRow}>
            <Badge label={notice.priority} />
            <Text style={styles.date}>{formatDate(notice.createdAt)}</Text>
          </View>

          {notice.expiresAt && (
            <View style={styles.expiresRow}>
              <Ionicons name="time-outline" size={14} color={Colors.dark.textDim} />
              <Text style={styles.expires}>Active until: {formatDate(notice.expiresAt)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.content}>{notice.content}</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  pinnedText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
    lineHeight: 28,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  date: {
    fontSize: 13,
    color: Colors.dark.textDim,
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  expires: {
    fontSize: 12,
    color: Colors.dark.textDim,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 18,
  },
  content: {
    fontSize: 15,
    color: Colors.dark.textMuted,
    lineHeight: 24,
  },
  loadingWrapper: {
    padding: 20,
  },
  skeletonLine: {
    height: 20,
    width: '100%',
    backgroundColor: Colors.dark.surface,
    borderRadius: 6,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFound: {
    color: Colors.dark.textDim,
    fontSize: 15,
  },
});
