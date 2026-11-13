/**
 * Complaint Detail Screen — view full complaint info and manager response.
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useComplaintById } from '../../features/complaints/hooks/useComplaints';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';
import { formatDate, capitalize } from '../../utils/helpers';

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: complaint, isLoading } = useComplaintById(id);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Detail</Text>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : !complaint ? (
        <View style={styles.centered}>
          <Text style={styles.notFound}>Complaint not found.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Status row */}
          <View style={styles.statusRow}>
            <Badge label={capitalize(complaint.status)} colorKey={complaint.status} />
            <Badge label={capitalize(complaint.priority)} colorKey={complaint.priority} />
            <Badge label={capitalize(complaint.type)} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{complaint.title}</Text>
          <Text style={styles.date}>Submitted on {formatDate(complaint.createdAt)}</Text>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{complaint.description}</Text>
          </View>

          {/* Manager Response */}
          {complaint.response && (
            <View style={[styles.section, styles.responseSection]}>
              <View style={styles.responseHeader}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#34d399" />
                <Text style={styles.responseLabel}>Manager Response</Text>
              </View>
              <Text style={styles.responseText}>{complaint.response}</Text>
              {complaint.resolvedAt && (
                <Text style={styles.resolvedDate}>
                  Resolved on {formatDate(complaint.resolvedAt)}
                </Text>
              )}
            </View>
          )}

          {/* Images */}
          {complaint.images?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Attached Images ({complaint.images.length})</Text>
              <Text style={styles.description}>(View in full app)</Text>
            </View>
          )}
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
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 6,
    lineHeight: 28,
  },
  date: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginBottom: 20,
  },
  section: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    lineHeight: 22,
  },
  responseSection: {
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: 'rgba(6,78,59,0.2)',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34d399',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  responseText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 22,
  },
  resolvedDate: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 8,
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
