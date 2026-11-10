/**
 * Manager Payments Screen
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { usePayments, useCreatePayment, useDeletePayment } from '../../features/payments/hooks/usePayments';
import { useMembers } from '../../features/members/hooks/useMembers';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Colors from '../../constants/colors';
import { formatCurrency, formatDate, getCurrentMonthYear, getMonthName } from '../../utils/helpers';

const METHODS = ['cash', 'bkash', 'nagad', 'bank'];

function PaymentModal({ visible, onClose, onSubmit, isLoading, members }) {
  const [form, setForm] = useState({ memberId: '', amount: '', method: 'cash', transactionId: '' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>Record Payment</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modal.content}>
          <Text style={modal.label}>Select Member</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {members.map(m => (
              <TouchableOpacity
                key={m._id}
                onPress={() => set('memberId', m._id)}
                style={[modal.pill, form.memberId === m._id && modal.pillActive, { marginRight: 8 }]}
              >
                <Text style={[modal.pillText, form.memberId === m._id && modal.pillTextActive]}>
                  {m.userId?.displayName || 'Unknown'} (Room {m.roomId?.roomNumber})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Amount (৳)"
            value={form.amount}
            onChangeText={v => set('amount', v)}
            placeholder="0"
            keyboardType="numeric"
          />
          <View style={{ height: 16 }} />
          
          <Text style={modal.label}>Payment Method</Text>
          <View style={modal.pillRow}>
            {METHODS.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => set('method', m)}
                style={[modal.pill, form.method === m && modal.pillActive]}
              >
                <Text style={[modal.pillText, form.method === m && modal.pillTextActive]}>
                  {m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 16 }} />
          {['bkash', 'nagad', 'bank'].includes(form.method) && (
            <Input
              label="Transaction ID (Optional)"
              value={form.transactionId}
              onChangeText={v => set('transactionId', v)}
              placeholder="TrxID..."
            />
          )}

          <Button
            onPress={() => onSubmit({ ...form, amount: Number(form.amount) })}
            loading={isLoading}
            disabled={!form.memberId || !form.amount}
            style={{ marginTop: 24 }}
          >
            Record Payment
          </Button>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ManagerPaymentsScreen() {
  const router = useRouter();
  const { month, year } = getCurrentMonthYear();
  
  const { data: payments = [], isLoading, refetch, isRefetching } = usePayments(month, year);
  const { data: members = [] } = useMembers();
  
  const createMutation = useCreatePayment();
  const deleteMutation = useDeletePayment();

  const [modalVisible, setModalVisible] = useState(false);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const activeMembers = members.filter(m => m.status === 'active');

  const handleSubmit = async (form) => {
    try {
      await createMutation.mutateAsync(form);
      Toast.show({ type: 'success', text1: 'Payment recorded!' });
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to record payment.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Payment', 'Are you sure?', [
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
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>{getMonthName(month)} {year}</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#a78bfa" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatCurrency(totalCollected)}</Text>
          <Text style={styles.summaryLabel}>Total Collected</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{payments.length}</Text>
          <Text style={styles.summaryLabel}>Transactions</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a78bfa" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardMain}>
                <Text style={styles.memberName}>{item.memberId?.userId?.displayName || 'Unknown'}</Text>
                <Text style={styles.metaText}>
                  {formatDate(item.createdAt)} • {item.method.toUpperCase()}
                  {item.transactionId ? ` • ${item.transactionId}` : ''}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={16} color="#f43f5e" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={({ size, color }) => <Ionicons name="cash-outline" size={size} color={color} />}
              title="No payments this month"
            />
          }
        />
      )}

      {modalVisible && (
        <PaymentModal
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
  summaryValue: { fontSize: 20, fontWeight: '700', color: '#10b981' },
  summaryLabel: { fontSize: 11, color: Colors.dark.textDim, marginTop: 4 },
  dividerV: { width: 1, backgroundColor: Colors.dark.border },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 10,
  },
  cardMain: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: Colors.dark.text, marginBottom: 4 },
  metaText: { fontSize: 11, color: Colors.dark.textDim },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '700', color: '#10b981' },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.dark.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.dark.textMuted, marginBottom: 10 },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border,
  },
  pillActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: '#7c3aed' },
  pillText: { fontSize: 13, color: Colors.dark.textMuted, fontWeight: '500' },
  pillTextActive: { color: '#a78bfa' },
});
