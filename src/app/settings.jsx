/**
 * Dorm Settings & Information Screen
 * Displays public dorm rules, address, manager contact, maintenance contact,
 * wifi details, and facilities.
 */
import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';

import { useDormSettings } from '../features/dashboard/hooks/useDashboard';
import { getCacheMetrics, clearAllCache } from '../services/cacheManager';
import { CardSkeleton } from '../components/ui/Skeleton';
import Colors from '../constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: settings, isLoading, refetch, isRefetching } = useDormSettings();
  const [cacheMetrics, setCacheMetrics] = useState({ keyCount: 0, formattedSize: 'Calculating...' });
  const [isClearing, setIsClearing] = useState(false);

  const loadMetrics = useCallback(async () => {
    const metrics = await getCacheMetrics();
    setCacheMetrics(metrics);
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const handleRefresh = async () => {
    await Promise.all([refetch(), loadMetrics()]);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache Memory',
      'This will clear stored offline data and query cache from memory. Fresh data will reload from the server. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearAllCache(queryClient);
              await loadMetrics();
              Toast.show({
                type: 'success',
                text1: 'Cache Memory Cleared',
                text2: 'Local cache memory freed successfully.',
              });
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to clear cache memory.',
              });
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Dorm Information</Text>
          <Text style={styles.subtitle}>Rules, facilities & contacts</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#34d399" />}
        contentContainerStyle={styles.scroll}
      >
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.brandingHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="home" size={28} color="#34d399" />
                </View>
                <Text style={styles.dormName}>{settings?.dormName || '11/38 Home'}</Text>
                <Text style={styles.dormTagline}>Dormitory Management System</Text>
              </View>

              <View style={styles.divider} />

              {/* Address */}
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#34d399" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Location & Address</Text>
                  <Text style={styles.infoValue}>{settings?.address || '11/38 Dhaka, Bangladesh'}</Text>
                </View>
              </View>

              {/* Manager Contact */}
              {settings?.managerContact && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#10b981" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Manager Contact</Text>
                    <Text style={styles.infoValue}>{settings.managerContact}</Text>
                  </View>
                </View>
              )}

              {/* Maintenance */}
              {settings?.maintenanceContact && (
                <View style={styles.infoRow}>
                  <Ionicons name="construct-outline" size={20} color="#f59e0b" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Maintenance Helpline</Text>
                    <Text style={styles.infoValue}>{settings.maintenanceContact}</Text>
                  </View>
                </View>
              )}

              <View style={styles.divider} />

              {/* Dorm Guidelines */}
              <Text style={styles.guidelineTitle}>Dorm Guidelines & Policies</Text>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                <Text style={styles.ruleText}>Daily lunch and dinner entries must be updated before cutoff time.</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                <Text style={styles.ruleText}>Market / Bazar duty rotation is assigned collaboratively.</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                <Text style={styles.ruleText}>Common expenses (electricity, gas, internet) are shared equally.</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                <Text style={styles.ruleText}>Quiet hours are observed from 11:00 PM to 7:00 AM.</Text>
              </View>
            </View>

            {/* Cache Memory Management Card */}
            <View style={[styles.card, { marginTop: 16 }]}>
              <View style={styles.cacheHeaderRow}>
                <View style={styles.cacheIconWrapper}>
                  <Ionicons name="server-outline" size={22} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cacheTitle}>Cache Memory & Storage</Text>
                  <Text style={styles.cacheSubtitle}>Offline persistence & fast query caching</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cacheStatsRow}>
                <View style={styles.cacheStatBox}>
                  <Text style={styles.cacheStatLabel}>Cache Memory</Text>
                  <Text style={styles.cacheStatVal}>{cacheMetrics.formattedSize}</Text>
                </View>
                <View style={styles.cacheStatBox}>
                  <Text style={styles.cacheStatLabel}>Cached Keys</Text>
                  <Text style={styles.cacheStatVal}>{cacheMetrics.keyCount} entries</Text>
                </View>
                <View style={styles.cacheStatBox}>
                  <Text style={styles.cacheStatLabel}>Status</Text>
                  <Text style={[styles.cacheStatVal, { color: '#34d399' }]}>Active</Text>
                </View>
              </View>

              <Text style={styles.cacheHelpText}>
                Cache memory retains resident directory, meal records, and expenses locally so the app opens instantly even on slow connections.
              </Text>

              <TouchableOpacity
                onPress={handleClearCache}
                disabled={isClearing}
                style={styles.clearCacheBtn}
                activeOpacity={0.8}
              >
                {isClearing ? (
                  <ActivityIndicator size="small" color="#f43f5e" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#f43f5e" />
                    <Text style={styles.clearCacheBtnText}>Clear Cache Memory</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
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
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 20,
  },
  brandingHeader: { alignItems: 'center', paddingVertical: 12 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dormName: { fontSize: 22, fontWeight: '800', color: Colors.dark.text },
  dormTagline: { fontSize: 12, color: Colors.dark.textMuted, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  infoLabel: { fontSize: 11, color: Colors.dark.textDim, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.dark.text, marginTop: 2 },
  guidelineTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark.text, marginBottom: 12 },
  ruleItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  ruleText: { fontSize: 13, color: Colors.dark.textMuted, flex: 1, lineHeight: 18 },
  cacheHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cacheIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cacheTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  cacheSubtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  cacheStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  cacheStatBox: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  cacheStatLabel: {
    fontSize: 10,
    color: Colors.dark.textDim,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cacheStatVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.text,
    marginTop: 4,
  },
  cacheHelpText: {
    fontSize: 12,
    color: Colors.dark.textDim,
    lineHeight: 18,
    marginBottom: 16,
  },
  clearCacheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  clearCacheBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f43f5e',
  },
});

