/**
 * Manager Expenses Screen
 */
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Modal, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useExpenses, useCreateExpense, useDeleteExpense } from '../../features/expenses/hooks/useExpenses';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Colors from '../../constants/colors';
import { formatCurrency, formatDate, getCurrentMonthYear, getMonthName } from '../../utils/helpers';

const TYPES = ['grocery', 'common'];

function ExpenseModal({ visible, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({ amount: '', description: '', type: 'grocery' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>Add Expense</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modal.content}>
          <Text style={modal.label}>Expense Type</Text>
          <View style={modal.pillRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => set('type', t)}
                style={[modal.pill, form.type === t && modal.pillActive]}
              >
                <Text style={[modal.pillText, form.type === t && modal.pillTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 24 }} />
          <Input
            label="Amount (৳)"
            value={form.amount}
            onChangeText={v => set('amount', v)}
            placeholder="0"
            keyboardType="numeric"
          />
          
          <View style={{ height: 16 }} />
          <Text style={modal.label}>Description</Text>
          <TextInput
            value={form.description}
            onChangeText={v => set('description', v)}
            placeholder="What was this for?"
            placeholderTextColor={Colors.dark.textDim}
            style={modal.input}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Button
            onPress={() => onSubmit({ ...form, amount: Number(form.amount) })}
            loading={isLoading}
            disabled={!form.amount || !form.description}
            style={{ marginTop: 24 }}
          >
            Add Expense
          </Button>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ManagerExpensesScreen() {
  const router = useRouter();
  const { month, year } = getCurrentMonthYear();
  
  const { data: expenses = [], isLoading, refetch, isRefetching } = useExpenses(month, year);
  
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();

  const [modalVisible, setModalVisible] = useState(false);

  const totalGrocery = expenses.filter(e => e.type === 'grocery').reduce((sum, e) => sum + e.amount, 0);
  const totalCommon  = expenses.filter(e => e.type === 'common').reduce((sum, e) => sum + e.amount, 0);
  const totalAll     = totalGrocery + totalCommon;

  const handleSubmit = async (form) => {
    try {
      await createMutation.mutateAsync(form);
      Toast.show({ type: 'success', text1: 'Expense added!' });
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to add expense.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
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
          <Text style={styles.title}>Expenses</Text>
          <Text style={styles.subtitle}>{getMonthName(month)} {year}</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#34d399" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatCurrency(totalGrocery)}</Text>
          <Text style={styles.summaryLabel}>Grocery</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatCurrency(totalCommon)}</Text>
          <Text style={styles.summaryLabel}>Common</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#f43f5e' }]}>{formatCurrency(totalAll)}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#34d399" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.iconWrapper, { backgroundColor: item.type === 'grocery' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)' }]}>
                <Ionicons name={item.type === 'grocery' ? 'cart' : 'construct'} size={20} color={item.type === 'grocery' ? '#f59e0b' : '#3b82f6'} />
              </View>
              <View style={styles.cardMain}>
                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.metaText}>{formatDate(item.createdAt)} • {item.type}</Text>
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
              icon={({ size, color }) => <Ionicons name="wallet-outline" size={size} color={color} />}
              title="No expenses this month"
            />
          }
        />
      )}

      {modalVisible && (
        <ExpenseModal
          visible={modalVisible}
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
    width: 40, height: 40, backgroundColor: 'rgba(16,185,129,0.12)',
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
  summaryValue: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
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
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  iconWrapper: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMain: { flex: 1 },
  desc: { fontSize: 14, fontWeight: '600', color: Colors.dark.text, marginBottom: 2 },
  metaText: { fontSize: 11, color: Colors.dark.textDim, textTransform: 'capitalize' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '700', color: '#f43f5e' },
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
  pillRow: { flexDirection: 'row', gap: 8 },
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
    padding: 14, fontSize: 14, color: Colors.dark.text, height: 80,
  },
});
