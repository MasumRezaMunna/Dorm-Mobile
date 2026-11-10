/**
 * Notice Detail Screen — full content of a single notice.
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useNoticeById } from '../../features/notices/hooks/useNotices';
import Badge from '../../components/ui/Badge';
import Colors from '../../constants/colors';
import { formatDate } from '../../utils/helpers';

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: notice, isLoading } = useNoticeById(id);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notice</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '60%', marginTop: 12 }]} />
        </View>
      ) : !notice ? (
        <View style={styles.centered}>
          <Text style={styles.notFound}>Notice not found.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {notice.isPinned && (
            <View style={styles.pinnedBanner}>
              <Ionicons name="pin" size={14} color="#f59e0b" />
              <Text style={styles.pinnedText}>Pinned Notice</Text>
            </View>
          )}

          <Text style={styles.title}>{notice.title}</Text>

          <View style={styles.metaRow}>
            <Badge label={notice.priority} colorKey={notice.priority} />
            <Text style={styles.date}>{formatDate(notice.createdAt)}</Text>
          </View>

          {notice.expiresAt && (
            <Text style={styles.expires}>Expires: {formatDate(notice.expiresAt)}</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  pinnedText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.dark.textDim,
  },
  expires: {
    fontSize: 12,
    color: '#f59e0b',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 20,
  },
  content: {
    fontSize: 15,
    color: Colors.dark.textMuted,
    lineHeight: 26,
  },
  loadingWrapper: {
    padding: 24,
  },
  skeletonLine: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    width: '90%',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    color: Colors.dark.textMuted,
  },
});
