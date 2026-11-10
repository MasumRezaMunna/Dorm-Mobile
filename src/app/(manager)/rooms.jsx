/**
 * Manager Rooms Screen
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '../../features/rooms/hooks/useRooms';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Colors from '../../constants/colors';
import { capitalize, formatCurrency } from '../../utils/helpers';

function RoomModal({ visible, onClose, onSubmit, initialData, isLoading }) {
  const [form, setForm] = useState(initialData || {
    roomNumber: '',
    floor: '',
    capacity: '',
    type: 'shared',
    rent: '',
    status: 'available',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>{initialData ? 'Edit Room' : 'Add Room'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modal.content}>
          <View style={modal.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Room Number"
                value={form.roomNumber}
                onChangeText={v => set('roomNumber', v)}
                placeholder="e.g. 101"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Floor"
                value={String(form.floor)}
                onChangeText={v => set('floor', Number(v) || '')}
                placeholder="e.g. 1"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={modal.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Capacity"
                value={String(form.capacity)}
                onChangeText={v => set('capacity', Number(v) || '')}
                placeholder="e.g. 2"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Rent (Total)"
                value={String(form.rent)}
                onChangeText={v => set('rent', Number(v) || '')}
                placeholder="e.g. 5000"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <Text style={modal.label}>Room Type</Text>
          <View style={modal.pillRow}>
            {['single', 'shared'].map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => set('type', t)}
                style={[modal.pill, form.type === t && modal.pillActive]}
              >
                <Text style={[modal.pillText, form.type === t && modal.pillTextActive]}>{capitalize(t)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modal.label}>Status</Text>
          <View style={modal.pillRow}>
            {['available', 'occupied', 'maintenance'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => set('status', s)}
                style={[modal.pill, form.status === s && modal.pillActive]}
              >
                <Text style={[modal.pillText, form.status === s && modal.pillTextActive]}>{capitalize(s)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            onPress={() => onSubmit(form)}
            loading={isLoading}
            style={{ marginTop: 24 }}
          >
            {initialData ? 'Save Changes' : 'Add Room'}
          </Button>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ManagerRoomsScreen() {
  const router = useRouter();
  const { data: rooms = [], isLoading, refetch, isRefetching } = useRooms();
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();
  const deleteMutation = useDeleteRoom();

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const filtered = rooms.filter(r => 
    String(r.roomNumber).includes(search) || String(r.floor).includes(search)
  );

  const handleSubmit = async (form) => {
    try {
      if (editingRoom) {
        await updateMutation.mutateAsync({ id: editingRoom._id, ...form });
        Toast.show({ type: 'success', text1: 'Room updated!' });
      } else {
        await createMutation.mutateAsync(form);
        Toast.show({ type: 'success', text1: 'Room created!' });
      }
      setModalVisible(false);
      setEditingRoom(null);
    } catch {
      Alert.alert('Error', 'Failed to save room.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Room', 'Are you sure?', [
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
          <Text style={styles.title}>Rooms</Text>
          <Text style={styles.subtitle}>{rooms.length} total</Text>
        </View>
        <TouchableOpacity onPress={() => { setEditingRoom(null); setModalVisible(true); }} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#a78bfa" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={Colors.dark.textDim} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by room number or floor..."
          placeholderTextColor={Colors.dark.textDim}
          style={styles.searchInput}
        />
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
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.roomNum}>Room {item.roomNumber}</Text>
                  <Badge label={item.status} colorKey={item.status} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => { setEditingRoom(item); setModalVisible(true); }}>
                    <Ionicons name="pencil-outline" size={18} color={Colors.dark.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={18} color="#f43f5e" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.infoText}>Floor {item.floor} • {capitalize(item.type)}</Text>
                <Text style={styles.infoText}>{item.members?.length || 0}/{item.capacity} Occupied</Text>
                <Text style={styles.infoText}>Rent: {formatCurrency(item.rent)}</Text>
              </View>
            </View>
          )}
        />
      )}

      {modalVisible && (
        <RoomModal
          visible={modalVisible}
          initialData={editingRoom}
          onClose={() => { setModalVisible(false); setEditingRoom(null); }}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
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
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.dark.card, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.dark.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.dark.text },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomNum: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.dark.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  content: { padding: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.dark.textMuted, marginBottom: 10, marginTop: 10 },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border,
  },
  pillActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: '#7c3aed' },
  pillText: { fontSize: 13, color: Colors.dark.textMuted, fontWeight: '500' },
  pillTextActive: { color: '#a78bfa' },
});
