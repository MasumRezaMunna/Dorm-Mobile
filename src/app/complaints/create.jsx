/**
 * Create Complaint Screen — form with type, priority, title, description.
 * Uses React Hook Form + Zod for validation.
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useCreateComplaint } from '../../features/complaints/hooks/useComplaints';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ScreenHeader } from '../../components/layout/ScreenWrapper';
import Colors from '../../constants/colors';
import { COMPLAINT_TYPES, COMPLAINT_PRIORITIES } from '../../utils/constants';

const schema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Please describe the issue in detail'),
  type:        z.string(),
  priority:    z.string(),
});

function SelectPill({ options, value, onChange }) {
  return (
    <View style={styles.pillRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.pill, value === opt.value && styles.pillActive]}
        >
          <Text style={[styles.pillText, value === opt.value && styles.pillTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CreateComplaintScreen() {
  const router = useRouter();
  const createMutation = useCreateComplaint();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      type: 'maintenance',
      priority: 'medium',
    },
  });

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      Toast.show({ type: 'success', text1: 'Complaint submitted!', position: 'top' });
      router.back();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit complaint.');
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>New Complaint</Text>
              <Text style={styles.subtitle}>Report an issue to management</Text>
            </View>
          </View>

          {/* Type */}
          <Text style={styles.label}>Type of Issue</Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <SelectPill options={COMPLAINT_TYPES} value={value} onChange={onChange} />
            )}
          />

          {/* Priority */}
          <Text style={styles.label}>Priority</Text>
          <Controller
            control={control}
            name="priority"
            render={({ field: { value, onChange } }) => (
              <SelectPill options={COMPLAINT_PRIORITIES} value={value} onChange={onChange} />
            )}
          />

          {/* Title */}
          <View style={{ marginTop: 20 }}>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Issue Title"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Brief description of the problem"
                  error={errors.title?.message}
                />
              )}
            />
          </View>

          {/* Description */}
          <View style={{ marginTop: 16 }}>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Description"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Describe the issue in detail..."
                  error={errors.description?.message}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  style={{ height: 120 }}
                />
              )}
            />
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={createMutation.isPending}
            style={{ marginTop: 28 }}
          >
            Submit Complaint
          </Button>
        </View>
      </ScrollView>
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
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.dark.textMuted,
    marginBottom: 10,
    marginTop: 20,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pillActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7c3aed',
  },
  pillText: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#a78bfa',
  },
});
