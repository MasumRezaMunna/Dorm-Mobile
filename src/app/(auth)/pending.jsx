/**
 * Pending Screen — shown when user is authenticated but member profile
 * is not yet 'active'. Matches the web app's /pending page.
 */
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';

export default function PendingScreen() {
  const { logout, refreshPendingStatus, user } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPendingStatus();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <LinearGradient colors={['#0f0f23', '#13131f']} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Ionicons name="time-outline" size={48} color="#f59e0b" />
        </View>

        <Text style={styles.title}>Account Pending</Text>
        <Text style={styles.subtitle}>
          Hi {user?.displayName?.split(' ')[0] || 'there'}! Your account is awaiting activation
          by the dorm manager. This usually takes a short time.
        </Text>

        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isRefreshing}
          activeOpacity={0.85}
          style={styles.refreshBtn}
        >
          <LinearGradient
            colors={['#7c3aed', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.refreshBtnInner}
          >
            {isRefreshing
              ? <ActivityIndicator size="small" color="#fff" />
              : <>
                  <Ionicons name="refresh-outline" size={16} color="#fff" />
                  <Text style={styles.refreshBtnText}>Check Again</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.7}
          style={styles.logoutBtn}
        >
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Logging out...' : 'Sign out'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(30,30,48,0.95)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 32,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  email: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 28,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
  },
  refreshBtn: {
    width: '100%',
    borderRadius: 14,
    marginBottom: 12,
  },
  refreshBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  refreshBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutBtn: {
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 14,
    color: '#64748b',
  },
});
