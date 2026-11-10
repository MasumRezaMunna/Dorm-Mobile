/**
 * Notifications Screen — list with mark-read, mark-all-read, delete.
 */
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '../features/notifications/hooks/useNotifications';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Colors from '../constants/colors';
import { formatRelativeTime } from '../utils/helpers';

const TYPE_ICONS = {
  bill:      { name: 'receipt-outline',       color: '#a78bfa' },
  payment:   { name: 'cash-outline',          color: '#10b981' },
  notice:    { name: 'megaphone-outline',     color: '#f59e0b' },
  complaint: { name: 'alert-circle-outline',  color: '#f43f5e' },
  visitor:   { name: 'person-outline',        color: '#3b82f6' },
  meal:      { name: 'restaurant-outline',    color: '#f59e0b' },
  system:    { name: 'information-circle-outline', color: '#64748b' },
};

function NotifItem({ item, onRead, onDelete }) {
  const icon = TYPE_ICONS[item.type] || TYPE_ICONS.system;
  return (
    <TouchableOpacity
      onPress={() => !item.isRead && onRead(item._id)}
      activeOpacity={0.8}
      style={[styles.item, !item.isRead && styles.itemUnread]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: `${icon.color}22` }]}>
        <Ionicons name={icon.name} size={20} color={icon.color} />
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.itemTime}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(item._id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={16} color={Colors.dark.textDim} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications = [], isLoading, refetch, isRefetching } = useNotifications();
  const markRead    = useMarkRead();
  const markAll     = useMarkAllRead();
  const deleteNotif = useDeleteNotification();

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
          {unread > 0 && <Text style={styles.unreadCount}>{unread} unread</Text>}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={() => markAll.mutate()} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />
          }
          renderItem={({ item }) => (
            <NotifItem
              item={item}
              onRead={id => markRead.mutate(id)}
              onDelete={id => deleteNotif.mutate(id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={({ size, color }) => <Ionicons name="notifications-off-outline" size={size} color={color} />}
              title="No notifications"
              subtitle="You're all caught up!"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  unreadCount: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderRadius: 10,
  },
  markAllText: { fontSize: 12, color: '#a78bfa', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  itemUnread: {
    backgroundColor: 'rgba(167,139,250,0.04)',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a78bfa',
  },
  textWrapper: { flex: 1 },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 3,
  },
  itemMessage: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemTime: { fontSize: 11, color: Colors.dark.textDim },
  deleteBtn: { padding: 4 },
});
