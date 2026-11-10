import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../ui/Badge';
import Colors from '../../constants/colors';
import { formatRelativeTime } from '../../utils/helpers';

/**
 * NoticeCard — displays a single notice in the notice feed.
 */
export default function NoticeCard({ notice, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.main}>
          {notice.isPinned && (
            <View style={styles.pinnedRow}>
              <Ionicons name="pin" size={12} color="#f59e0b" />
              <Text style={styles.pinnedText}>Pinned</Text>
            </View>
          )}
          <Text style={styles.title} numberOfLines={2}>{notice.title}</Text>
          <Text style={styles.content} numberOfLines={3}>{notice.content}</Text>
          <View style={styles.meta}>
            <Badge label={notice.priority} />
            <Text style={styles.time}>{formatRelativeTime(notice.createdAt)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.dark.textDim} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  main: {
    flex: 1,
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  pinnedText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  content: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginBottom: 10,
    lineHeight: 19,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
});
