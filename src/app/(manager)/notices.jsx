/**
 * Manager Notices Screen — create, pin, delete notices.
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useNotices, useCreateNotice, useDeleteNotice, useTogglePin } from '../../features/notices/hooks/useNotices';
import NoticeCard from '../../components/shared/NoticeCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function CreateModal({ visible, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>Create Notice</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modal.content}>
          <Text style={modal.label}>Priority</Text>
          <View style={modal.pillRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => set('priority', p)}
                style={[modal.pill, form.priority === p && modal.pillActive]}
              >
                <Text style={[modal.pillText, form.priority === p && modal.pillTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={modal.label}>Title</Text>
          <TextInput
            value={form.title}
            onChangeText={v => set('title', v)}
            placeholder="Notice title..."
            placeholderTextColor={Colors.dark.textDim}
            style={modal.input}
          />
          <Text style={modal.label}>Content</Text>
          <TextInput
            value={form.content}
            onChangeText={v => set('content', v)}
            placeholder="Notice content..."
            placeholderTextColor={Colors.dark.textDim}
            style={[modal.input, { height: 150 }]}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={() => onSubmit(form)}
            disabled={isLoading || !form.title || !form.content}
            style={[modal.submitBtn, (isLoading || !form.title || !form.content) && { opacity: 0.5 }]}
          >
            <Text style={modal.submitText}>{isLoading ? 'Creating...' : 'Create Notice'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ManagerNoticesScreen() {
  const router = useRouter();
  const { data: notices = [], isLoading, refetch, isRefetching } = useNotices();
  const createMutation = useCreateNotice();
  const deleteMutation = useDeleteNotice();
  const togglePin      = useTogglePin();

  const [createVisible, setCreateVisible] = useState(false);

  const handleCreate = async (form) => {
    try {
      await createMutation.mutateAsync(form);
      Toast.show({ type: 'success', text1: 'Notice created!', position: 'top' });
      setCreateVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to create notice.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Notice', 'Are you sure?', [
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
          <Text style={styles.title}>Notices</Text>
          <Text style={styles.subtitle}>{notices.length} notices</Text>
        </View>
        <TouchableOpacity onPress={() => setCreateVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#a78bfa" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
          renderItem={({ item }) => (
            <View style={styles.noticeWrapper}>
              <NoticeCard notice={item} onPress={() => {}} />
              <View style={styles.noticeActions}>
                <TouchableOpacity onPress={() => togglePin.mutate(item._id)} style={styles.actionBtn}>
                  <Ionicons name={item.isPinned ? 'pin' : 'pin-outline'} size={16} color="#f59e0b" />
                  <Text style={styles.actionText}>{item.isPinned ? 'Unpin' : 'Pin'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={[styles.actionBtn, styles.deleteBtn]}>
                  <Ionicons name="trash-outline" size={16} color="#f43f5e" />
                  <Text style={[styles.actionText, { color: '#f43f5e' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity onPress={() => setCreateVisible(true)} style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <CreateModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
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
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  noticeWrapper: { marginBottom: 4 },
  noticeActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: -4,
    marginBottom: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  deleteBtn: { borderColor: 'rgba(244,63,94,0.2)' },
  actionText: { fontSize: 12, fontWeight: '500', color: '#f59e0b' },
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 16,
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
  label: { fontSize: 13, fontWeight: '500', color: Colors.dark.textMuted, marginBottom: 10, marginTop: 16 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border,
  },
  pillActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: '#7c3aed' },
  pillText: { fontSize: 12, color: Colors.dark.textMuted, fontWeight: '500' },
  pillTextActive: { color: '#a78bfa' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    borderWidth: 1, borderColor: Colors.dark.border,
    padding: 14, fontSize: 14, color: Colors.dark.text,
  },
  submitBtn: {
    marginTop: 24, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#7c3aed', alignItems: 'center',
  },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
