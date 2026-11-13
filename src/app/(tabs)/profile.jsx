/**
 * Profile Tab — Dorm Resident / Facility Info
 * Operates in companion mode without personal authentication.
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useDormSettings } from '../../features/dashboard/hooks/useDashboard';
import Colors from '../../constants/colors';

export default function ProfileTab() {
  const router = useRouter();
  const { data: settings } = useDormSettings();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Dorm Profile</Text>
          </View>

          {/* Dorm Companion Card */}
          <View style={styles.card}>
            <View style={styles.avatarCircle}>
              <Ionicons name="home" size={32} color="#34d399" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dormName}>{settings?.dormName || '11/38 Home'}</Text>
              <Text style={styles.companionText}>Mobile Companion Edition</Text>
              <View style={styles.statusPill}>
                <View style={styles.greenDot} />
                <Text style={styles.statusPillText}>Public Resident Access</Text>
              </View>
            </View>
          </View>

          {/* Quick Shortcuts */}
          <Text style={styles.sectionTitle}>Facilities & Features</Text>
          <TouchableOpacity onPress={() => router.push('/room')} style={styles.navRow}>
            <View style={[styles.navIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
              <Ionicons name="bed-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.navLabel}>Rooms & Occupancy</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textDim} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(tabs)/meals')} style={styles.navRow}>
            <View style={[styles.navIcon, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
              <Ionicons name="restaurant-outline" size={20} color="#10b981" />
            </View>
            <Text style={styles.navLabel}>Weekly Meal Menu</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textDim} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(tabs)/market')} style={styles.navRow}>
            <View style={[styles.navIcon, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
              <Ionicons name="cart-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.navLabel}>Bazar Duty Schedule</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textDim} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(manager)/expenses')} style={styles.navRow}>
            <View style={[styles.navIcon, { backgroundColor: 'rgba(236,72,153,0.15)' }]}>
              <Ionicons name="wallet-outline" size={20} color="#ec4899" />
            </View>
            <Text style={styles.navLabel}>Dorm Expenses</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textDim} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.navRow}>
            <View style={[styles.navIcon, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#10b981" />
            </View>
            <Text style={styles.navLabel}>Dorm Rules & Contacts</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textDim} />
          </TouchableOpacity>

          {/* Contact Box */}
          <View style={styles.contactBox}>
            <Text style={styles.contactTitle}>Emergency & Helpline</Text>
            <Text style={styles.contactDesc}>
              For room issues, complaints, or questions, contact your dorm manager directly:
            </Text>
            <Text style={styles.contactPhone}>{settings?.managerContact || 'Contact manager via office'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark.text },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 18,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dormName: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  companionText: { fontSize: 12, color: Colors.dark.textMuted, marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  statusPillText: { fontSize: 11, color: '#10b981', fontWeight: '600' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 10,
  },
  navIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.dark.text },
  contactBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 18,
    marginTop: 16,
  },
  contactTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark.text, marginBottom: 6 },
  contactDesc: { fontSize: 12, color: Colors.dark.textMuted, lineHeight: 18, marginBottom: 8 },
  contactPhone: { fontSize: 15, fontWeight: '700', color: '#10b981' },
});
