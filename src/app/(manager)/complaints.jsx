/**
 * Manager Complaints Screen — view and manage all complaints.
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useAllComplaints, useUpdateComplaint } from '../../features/complaints/hooks/useComplaints';
import ComplaintCard from '../../components/shared/ComplaintCard';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';
import { capitalize, formatDate } from '../../utils/helpers';

const STATUS_OPTIONS = ['open', 'in-progress', 'resolved', 'closed'];

function ResponseModal({ complaint, visible, onClose, onSubmit, isLoading }) {
  const [status, setStatus] = useState(complaint?.status || 'open');
  const [response, setResponse] = useState(complaint?.response || '');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>Update Complaint</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modal.content}>
          <Text style={modal.label}>Change Status</Text>
          <View style={modal.pillRow}>
            {STATUS_OPTIONS.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                style={[modal.pill, status === s && modal.pillActive]}
              >
                <Text style={[modal.pillText, status === s && modal.pillTextActive]}>
                  {capitalize(s)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modal.label}>Manager Response (optional)</Text>
          <TextInput
            value={response}
            onChangeText={setResponse}
            placeholder="Add a response or update for the resident..."
            placeholderTextColor={Colors.dark.textDim}
            style={modal.input}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={() => onSubmit({ status, response })}
            disabled={isLoading}
            style={[modal.submitBtn, isLoading && { opacity: 0.5 }]}
          >
            <Text style={modal.submitText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ManagerComplaintsScreen() {
  const router = useRouter();
  const { data: complaints = [], isLoading, refetch, isRefetching } = useAllComplaints();
  const updateMutation = useUpdateComplaint();

  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = filterStatus === 'all'
    ? complaints
    : complaints.filter(c => c.status === filterStatus);

  const handleUpdate = async (values) => {
    try {
      await updateMutation.mutateAsync({ id: selected._id, ...values });
      Toast.show({ type: 'success', text1: 'Complaint updated!', position: 'top' });
      setModalVisible(false);
      setSelected(null);
    } catch {
      Alert.alert('Error', 'Failed to update complaint.');
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Complaints</Text>
          <Text style={styles.subtitle}>{complaints.length} total</Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {['all', ...STATUS_OPTIONS].map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setFilterStatus(s)}
            style={[styles.pill, filterStatus === s && styles.pillActive]}
          >
            <Text style={[styles.pillText, filterStatus === s && styles.pillTextActive]}>
              {capitalize(s)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#34d399" />}
          renderItem={({ item }) => (
            <ComplaintCard
              complaint={item}
              onPress={() => {
                setSelected(item);
                setModalVisible(true);
              }}
            />
          )}
        />
      )}

      {selected && (
        <ResponseModal
          complaint={selected}
          visible={modalVisible}
          onClose={() => { setModalVisible(false); setSelected(null); }}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
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
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: Colors.dark.card,
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  pillActive: { backgroundColor: '#059669', borderColor: '#10b981' },
  pillText: { fontSize: 12, color: Colors.dark.textMuted, fontWeight: '500' },
  pillTextActive: { color: '#ffffff', fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.dark.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.dark.textMuted, marginBottom: 10, marginTop: 16 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border,
  },
  pillActive: { backgroundColor: '#059669', borderColor: '#10b981' },
  pillText: { fontSize: 13, color: Colors.dark.textMuted, fontWeight: '500' },
  pillTextActive: { color: '#ffffff', fontWeight: '700' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    borderWidth: 1, borderColor: Colors.dark.border,
    padding: 14, fontSize: 14, color: Colors.dark.text, height: 120,
  },
  submitBtn: {
    marginTop: 24, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#059669', alignItems: 'center',
  },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
