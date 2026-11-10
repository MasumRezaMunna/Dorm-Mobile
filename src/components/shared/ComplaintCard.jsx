import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../ui/Badge';
import Colors from '../../constants/colors';
import { formatRelativeTime, capitalize } from '../../utils/helpers';

/**
 * ComplaintCard — displays a single complaint with status and type.
 */
export default function ComplaintCard({ complaint, onPress }) {
  const isOpen = complaint.status === 'open' || complaint.status === 'in-progress';
  const iconName = isOpen ? 'time-outline' : 'checkmark-circle-outline';
  const iconColor = isOpen ? '#f59e0b' : '#10b981';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrapper, { backgroundColor: isOpen ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)' }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.main}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>{complaint.title}</Text>
            <Badge label={capitalize(complaint.status)} colorKey={complaint.status} />
          </View>
          <Text style={styles.description} numberOfLines={2}>{complaint.description}</Text>
          <View style={styles.meta}>
            <Text style={styles.type}>{capitalize(complaint.type)}</Text>
            <View style={styles.dot} />
            <Badge label={capitalize(complaint.priority)} colorKey={complaint.priority} />
            <View style={styles.dot} />
            <Text style={styles.time}>{formatRelativeTime(complaint.createdAt)}</Text>
          </View>
        </View>
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
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  main: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  type: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.dark.textDim,
  },
  time: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
});
