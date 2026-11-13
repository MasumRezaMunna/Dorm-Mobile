/**
 * Complaints List Screen
 */
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useComplaints } from '../../features/complaints/hooks/useComplaints';
import ComplaintCard from '../../components/shared/ComplaintCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/layout/ScreenWrapper';
import Colors from '../../constants/colors';

export default function ComplaintsScreen() {
  const router = useRouter();
  const { data: complaints = [], isLoading, refetch, isRefetching } = useComplaints();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader
          title="My Complaints"
          subtitle="Report and track your issues"
          right={
            <TouchableOpacity
              onPress={() => router.push('/complaints/create')}
              style={styles.addBtn}
            >
              <Ionicons name="add" size={22} color="#34d399" />
            </TouchableOpacity>
          }
        />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#34d399" />
          }
          renderItem={({ item }) => (
            <ComplaintCard
              complaint={item}
              onPress={() => router.push(`/complaints/${item._id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={({ size, color }) => <Ionicons name="checkmark-circle-outline" size={size} color={color} />}
              title="No complaints yet"
              subtitle="Tap + to report an issue."
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/complaints/create')}
        style={styles.fab}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
});
