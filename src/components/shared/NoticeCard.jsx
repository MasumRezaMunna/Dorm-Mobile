import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../ui/Badge';
import Colors from '../../constants/colors';
import { formatRelativeTime } from '../../utils/helpers';
import { useBookmarkStore } from '../../store/bookmarkStore';

/**
 * NoticeCard — displays a single notice with priority accents and bookmarking.
 * Optimized with React.memo for high-performance FlatList rendering.
 */
function NoticeCardComponent({ notice, onPress }) {
  const isBookmarked = useBookmarkStore((state) => state.bookmarkedIds.includes(notice._id));
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  const isUrgent = notice.priority === 'urgent' || notice.priority === 'high';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        styles.card,
        isUrgent && styles.cardUrgent,
        notice.isPinned && styles.cardPinned,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.main}>
          <View style={styles.topStatusRow}>
            {notice.isPinned && (
              <View style={styles.pinnedRow}>
                <Ionicons name="pin" size={12} color="#f59e0b" />
                <Text style={styles.pinnedText}>Pinned</Text>
              </View>
            )}
            {isUrgent && (
              <View style={styles.urgentRow}>
                <Ionicons name="alert-circle" size={12} color="#f43f5e" />
                <Text style={styles.urgentText}>Priority Attention</Text>
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {notice.title}
          </Text>
          <Text style={styles.content} numberOfLines={2}>
            {notice.content}
          </Text>

          <View style={styles.meta}>
            <Badge label={notice.priority} />
            <Text style={styles.time}>{formatRelativeTime(notice.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actionCol}>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={(e) => {
              e.stopPropagation();
              toggleBookmark(notice._id);
            }}
            style={styles.bookmarkBtn}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isBookmarked ? '#a78bfa' : Colors.dark.textDim}
            />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={16} color={Colors.dark.textDim} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const NoticeCard = memo(NoticeCardComponent);
export default NoticeCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 12,
  },
  cardPinned: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  cardUrgent: {
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  main: {
    flex: 1,
  },
  topStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinnedText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '700',
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244,63,94,0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentText: {
    fontSize: 11,
    color: '#f43f5e',
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  content: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: Colors.dark.textDim,
  },
  actionCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  bookmarkBtn: {
    padding: 4,
  },
});
