/**
 * Manager Market Schedule Screen
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Modal, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useMarketSchedules, useMarketStats, useCreateMarketSchedule, useDeleteMarketSchedule } from '../../features/market/hooks/useMarket';
import { useMembers } from '../../features/members/hooks/useMembers';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Colors from '../../constants/colors';
import { formatDate, getCurrentMonthYear, getMonthName } from '../../utils/helpers';

function CreateScheduleModal({ visible, onClose, onSubmit, isLoading, members }) {
  const [form, setForm] = useState({ date: '', memberIds: [], note: '' });

  const toggleMember = (id) => {
    setForm(p => ({
      ...p,
      memberIds: p.memberIds.includes(id) ? p.memberIds.filter(m => m !== id) : [...p.memberIds, id],
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>Assign Market Duty</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modal.content}>
          <Text style={modal.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={form.date}
            onChangeText={v => setForm(p => ({ ...p, date: v }))}
            placeholder="e.g. 2026-07-28"
            placeholderTextColor={Colors.dark.textDim}
            style={modal.input}
          />
          
          <Text style={modal.label}>Select Members</Text>
          <View style={modal.pillRow}>
            {members.map(m => (
              <TouchableOpacity
                key={m._id}
                onPress={() => toggleMember(m._id)}
                style={[modal.pill, form.memberIds.includes(m._id) && modal.pillActive]}
              >
                <Text style={[modal.pillText, form.memberIds.includes(m._id) && modal.pillTextActive]}>
                  {m.userId?.displayName || 'Unknown'} (Rm {m.roomId?.roomNumber})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modal.label}>Note (Optional)</Text>
          <TextInput
            value={form.note}
            onChangeText={v => setForm(p => ({ ...p, note: v }))}
            placeholder="Any special instructions..."
            placeholderTextColor={Colors.dark.textDim}
            style={modal.input}
          />

          <Button
            onPress={() => onSubmit(form)}
            loading={isLoading}
            disabled={!form.date || form.memberIds.length === 0}
            style={{ marginTop: 24 }}
          >
            Assign Schedule
          </Button>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ManagerMarketScreen() {
  const router = useRouter();
  const { month, year } = getCurrentMonthYear();
  
  const { data: schedules = [], isLoading, refetch, isRefetching } = useMarketSchedules(month, year);
  const { data: stats } = useMarketStats();
  const { data: members = [] } = useMembers();

  const createMutation = useCreateMarketSchedule();
  const deleteMutation = useDeleteMarketSchedule();

  const [modalVisible, setModalVisible] = useState(false);

  const activeMembers = members.filter(m => m.status === 'active');

  const handleSubmit = async (form) => {
    try {
      await createMutation.mutateAsync({
        date: form.date,
        members: form.memberIds,
        note: form.note,
      });
      Toast.show({ type: 'success', text1: 'Schedule assigned!' });
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to assign schedule.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Schedule', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Market Schedule</Text>
          <Text style={styles.subtitle}>{getMonthName(month)} {year}</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#a78bfa" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{stats?.completedCount || 0}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{stats?.upcomingCount || 0}</Text>
          <Text style={styles.summaryLabel}>Upcoming</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardMain}>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
                <Text style={styles.team}>
                  {(item.members || []).map(m => m.userId?.displayName || m.name || '?').join(', ')}
                </Text>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: item.status === 'completed' ? '#10b981' : '#f59e0b' }}>
                    {item.status === 'completed' ? 'Done' : 'Upcoming'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 4, marginTop: 8 }}>
                  <Ionicons name="trash-outline" size={16} color="#f43f5e" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={({ size, color }) => <Ionicons name="cart-outline" size={size} color={color} />}
              title="No market duties assigned"
            />
          }
        />
      )}

      {modalVisible && (
        <CreateScheduleModal
          visible={modalVisible}
          members={activeMembers}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, backgroundColor: Colors.dark.card,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  addBtn: {
    width: 40, height: 40, backgroundColor: 'rgba(167,139,250,0.12)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  summaryLabel: { fontSize: 11, color: Colors.dark.textDim, marginTop: 4 },
  dividerV: { width: 1, backgroundColor: Colors.dark.border },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 10,
  },
  cardMain: { flex: 1 },
  date: { fontSize: 14, fontWeight: '700', color: Colors.dark.text, marginBottom: 4 },
  team: { fontSize: 13, color: Colors.dark.textMuted, marginBottom: 4 },
  note: { fontSize: 11, color: Colors.dark.textDim, fontStyle: 'italic' },
  cardRight: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.dark.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.dark.textMuted, marginBottom: 10, marginTop: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    borderWidth: 1, borderColor: Colors.dark.border,
    padding: 14, fontSize: 14, color: Colors.dark.text,
  },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: 8,
  },
  pillActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: '#7c3aed' },
  pillText: { fontSize: 13, color: Colors.dark.textMuted, fontWeight: '500' },
  pillTextActive: { color: '#a78bfa' },
});
