/**
 * Profile Tab — view/edit member profile and emergency contact.
 * Matches the web app's ProfilePage.
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import useAuthStore from '../../store/authStore';
import { useMyProfile, useUpdateMyProfile } from '../../features/members/hooks/useMembers';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Colors from '../../constants/colors';

export default function ProfileTab() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateMyProfile();

  const [form, setForm] = useState({
    phone: '',
    nid: '',
    occupation: '',
    emergencyContact: { name: '', phone: '', relation: '' },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        phone: profile.phone || '',
        nid: profile.nid || '',
        occupation: profile.occupation || '',
        emergencyContact: profile.emergencyContact || { name: '', phone: '', relation: '' },
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(form);
      Toast.show({ type: 'success', text1: 'Profile updated!', position: 'top' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update profile', position: 'top' });
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const setEC = (field, value) => setForm(prev => ({
    ...prev,
    emergencyContact: { ...prev.emergencyContact, [field]: value },
  }));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.dark.textMuted} />
            </TouchableOpacity>
          </View>

          {/* User card */}
          <View style={styles.userCard}>
            <Avatar uri={user?.photoURL} name={user?.displayName} size={64} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.displayName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Ionicons
                  name={user?.role === 'manager' ? 'shield-checkmark' : 'person'}
                  size={11}
                  color="#a78bfa"
                />
                <Text style={styles.roleText}>{user?.role === 'manager' ? 'Manager' : 'Member'}</Text>
              </View>
            </View>
          </View>

          {/* Room Info */}
          {profile?.roomId && (
            <View style={styles.infoRow}>
              <Ionicons name="bed-outline" size={16} color={Colors.dark.textMuted} />
              <Text style={styles.infoText}>
                Room {profile.roomId.roomNumber} · Floor {profile.roomId.floor}
              </Text>
            </View>
          )}
          {profile?.memberId && (
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={16} color={Colors.dark.textMuted} />
              <Text style={styles.infoText}>Member ID: {profile.memberId}</Text>
            </View>
          )}

          {/* Edit Form */}
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.formSection}>
            <Input
              label="Phone Number"
              value={form.phone}
              onChangeText={v => setForm(p => ({ ...p, phone: v }))}
              placeholder="+8801700000000"
              keyboardType="phone-pad"
              icon={({ size, color }) => <Ionicons name="call-outline" size={size} color={color} />}
            />
            <View style={{ height: 16 }} />
            <Input
              label="NID / Passport"
              value={form.nid}
              onChangeText={v => setForm(p => ({ ...p, nid: v }))}
              placeholder="National ID number"
              icon={({ size, color }) => <Ionicons name="document-text-outline" size={size} color={color} />}
            />
            <View style={{ height: 16 }} />
            <Input
              label="Occupation"
              value={form.occupation}
              onChangeText={v => setForm(p => ({ ...p, occupation: v }))}
              placeholder="Student / Engineer / Business"
              icon={({ size, color }) => <Ionicons name="briefcase-outline" size={size} color={color} />}
            />
          </View>

          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.formSection}>
            <Input
              label="Contact Name"
              value={form.emergencyContact.name}
              onChangeText={v => setEC('name', v)}
              placeholder="Relative's full name"
            />
            <View style={{ height: 16 }} />
            <Input
              label="Relation"
              value={form.emergencyContact.relation}
              onChangeText={v => setEC('relation', v)}
              placeholder="e.g. Father, Mother, Brother"
            />
            <View style={{ height: 16 }} />
            <Input
              label="Phone Number"
              value={form.emergencyContact.phone}
              onChangeText={v => setEC('phone', v)}
              placeholder="Emergency phone number"
              keyboardType="phone-pad"
              icon={({ size, color }) => <Ionicons name="call-outline" size={size} color={color} />}
            />
          </View>

          <Button
            onPress={handleSave}
            loading={updateMutation.isPending}
            style={{ marginTop: 24 }}
          >
            Save Profile
          </Button>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color="#f43f5e" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  notifBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 20,
    marginBottom: 12,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: 'rgba(167,139,250,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginTop: 24,
    marginBottom: 14,
  },
  formSection: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(244,63,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.2)',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f43f5e',
  },
});
