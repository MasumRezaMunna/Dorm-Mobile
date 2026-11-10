/**
 * Manager Settings Screen — view/edit dorm-wide settings.
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import api from '../../services/api';
import { QUERY_KEYS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Colors from '../../constants/colors';

export default function ManagerSettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: QUERY_KEYS.SETTINGS,
    queryFn: async () => {
      const { data } = await api.get('/settings');
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put('/settings', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
      Toast.show({ type: 'success', text1: 'Settings saved!', position: 'top' });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save settings.');
    },
  });

  const [form, setForm] = useState({
    dormName: '',
    currency: '৳',
    mealRate: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        dormName: settings.dormName || '',
        currency: settings.currency || '৳',
        mealRate: String(settings.mealRate || ''),
        phone:    settings.contact?.phone || '',
        address:  settings.contact?.address || '',
      });
    }
  }, [settings]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    updateMutation.mutate({
      dormName: form.dormName,
      currency: form.currency,
      mealRate: parseFloat(form.mealRate) || 0,
      contact: { phone: form.phone, address: form.address },
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Dorm Settings</Text>
          <Text style={styles.subtitle}>Configure 11/38 Home</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Dorm Info</Text>
          <View style={styles.section}>
            <Input
              label="Dorm Name"
              value={form.dormName}
              onChangeText={v => set('dormName', v)}
              placeholder="11/38 Home"
              icon={({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />}
            />
            <View style={{ height: 16 }} />
            <Input
              label="Currency Symbol"
              value={form.currency}
              onChangeText={v => set('currency', v)}
              placeholder="৳"
              icon={({ size, color }) => <Ionicons name="cash-outline" size={size} color={color} />}
            />
          </View>

          <Text style={styles.sectionTitle}>Meal</Text>
          <View style={styles.section}>
            <Input
              label="Meal Rate (per meal)"
              value={form.mealRate}
              onChangeText={v => set('mealRate', v)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              icon={({ size, color }) => <Ionicons name="restaurant-outline" size={size} color={color} />}
            />
          </View>

          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.section}>
            <Input
              label="Phone"
              value={form.phone}
              onChangeText={v => set('phone', v)}
              placeholder="Contact phone number"
              keyboardType="phone-pad"
              icon={({ size, color }) => <Ionicons name="call-outline" size={size} color={color} />}
            />
            <View style={{ height: 16 }} />
            <Input
              label="Address"
              value={form.address}
              onChangeText={v => set('address', v)}
              placeholder="Dorm address"
              multiline
              numberOfLines={3}
              style={{ height: 80 }}
              textAlignVertical="top"
            />
          </View>

          <Button
            onPress={handleSave}
            loading={updateMutation.isPending}
            style={{ marginTop: 28 }}
          >
            Save Settings
          </Button>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, backgroundColor: Colors.dark.card,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
  },
});
