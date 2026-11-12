/**
 * Dorm Hub Screen — Complete Dorm Community, Rooms, Expenses & Info.
 * Brings together all core website transparency and facility information.
 */
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useCommunityStats, useDormSettings } from '../../features/dashboard/hooks/useDashboard';
import { useRooms } from '../../features/rooms/hooks/useRooms';
import { useExpenses } from '../../features/expenses/hooks/useExpenses';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import { formatCurrency, formatDate, getCurrentMonthYear, getMonthName } from '../../utils/helpers';

const SECTIONS = [
  { key: 'members', label: 'Residents' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'info', label: 'Dorm Info' },
];

export default function DormHubScreen() {
  const [activeSection, setActiveSection] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const { month, year } = getCurrentMonthYear();

  // Data queries
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers, isRefetching: isRefetchingMembers } = useCommunityStats(month, year);
  const { data: rooms = [], isLoading: roomsLoading, refetch: refetchRooms, isRefetching: isRefetchingRooms } = useRooms();
  const { data: expenseData, isLoading: expensesLoading, refetch: refetchExpenses, isRefetching: isRefetchingExpenses } = useExpenses(month, year);
  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings, isRefetching: isRefetchingSettings } = useDormSettings();

  const isRefetching = isRefetchingMembers || isRefetchingRooms || isRefetchingExpenses || isRefetchingSettings;

  const handleRefresh = () => {
    refetchMembers();
    refetchRooms();
    refetchExpenses();
    refetchSettings();
  };

  // Filter members by search query
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = m.name?.toLowerCase().includes(q);
    const roomMatch = m.room?.roomNumber?.toLowerCase().includes(q);
    return nameMatch || roomMatch;
  });

  const expenses = expenseData?.expenses || [];
  const groceryCost = expenseData?.groceryCost || 0;
  const commonCost = expenseData?.commonCost || 0;
  const grandTotal = expenseData?.grandTotal || (groceryCost + commonCost);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dorm Hub</Text>
        <Text style={styles.subtitle}>Residents, Rooms, Facilities & Expenses</Text>
      </View>

      {/* Section Switcher Pills */}
      <View style={styles.sectionRow}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setActiveSection(s.key)}
            style={[styles.sectionPill, activeSection === s.key && styles.sectionPillActive]}
          >
            <Text style={[styles.sectionPillText, activeSection === s.key && styles.sectionPillTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#a78bfa" />}
        contentContainerStyle={styles.scroll}
      >
        {/* ── SECTION 1: RESIDENTS ── */}
        {activeSection === 'members' && (
          <>
            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={Colors.dark.textDim} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search resident or room..."
                placeholderTextColor={Colors.dark.textDim}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.dark.textDim} />
                </TouchableOpacity>
              )}
            </View>

            {/* Resident Count Banner */}
            <View style={styles.countBanner}>
              <Text style={styles.countBannerText}>
                Active Residents ({filteredMembers.length})
              </Text>
              <Text style={styles.countBannerSub}>{getMonthName(month)} {year}</Text>
            </View>

            {membersLoading ? (
              <View style={{ gap: 8 }}>
                {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : filteredMembers.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="people-outline" size={size} color={color} />}
                title="No residents found"
              />
            ) : (
              filteredMembers.map((m, idx) => (
                <View key={m.memberId || idx} style={styles.residentCard}>
                  <Avatar uri={m.photoURL} name={m.name} size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.residentName}>{m.name}</Text>
                    <View style={styles.residentMetaRow}>
                      <View style={styles.roomTag}>
                        <Ionicons name="bed" size={11} color="#a78bfa" />
                        <Text style={styles.roomTagText}>Room {m.room?.roomNumber || 'N/A'}</Text>
                      </View>
                      <Text style={styles.residentIdText}>ID: {m.memberId}</Text>
                    </View>
                  </View>
                  <View style={styles.residentStats}>
                    <Text style={styles.residentMealsCount}>{m.totalMeals}</Text>
                    <Text style={styles.residentMealsLabel}>meals</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── SECTION 2: ROOMS & RESIDENTS ── */}
        {activeSection === 'rooms' && (
          <>
            {roomsLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : rooms.length === 0 ? (
              <EmptyState
                icon={({ size, color }) => <Ionicons name="bed-outline" size={size} color={color} />}
                title="No rooms found"
              />
            ) : (
              rooms.map((room) => {
                const occupants = room.members || [];
                const cap = room.capacity || 1;
                const occPercent = Math.min(100, Math.round((occupants.length / cap) * 100));

                return (
                  <View key={room._id} style={styles.roomCard}>
                    <View style={styles.roomCardHeader}>
                      <View style={styles.roomBadge}>
                        <Ionicons name="bed" size={16} color="#3b82f6" />
                        <Text style={styles.roomNumberText}>Room {room.roomNumber}</Text>
                      </View>
                      <Badge label={room.status || 'available'} colorKey={room.status || 'available'} />
                    </View>

                    <Text style={styles.roomDetailsText}>
                      Floor {room.floor} • {room.type ? room.type.toUpperCase() : 'STANDARD'} • Rent: {formatCurrency(room.rent)}/seat
                    </Text>

                    {/* Progress Bar */}
                    <View style={styles.barContainer}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${occPercent}%`,
                              backgroundColor: occPercent >= 100 ? '#f43f5e' : '#3b82f6',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{occupants.length} of {cap} spots occupied</Text>
                    </View>

                    {/* Occupants */}
                    <Text style={styles.occupantsHeader}>Roommates:</Text>
                    {occupants.length === 0 ? (
                      <Text style={styles.emptyOccupantsText}>No occupants currently assigned.</Text>
                    ) : (
                      <View style={styles.occupantsList}>
                        {occupants.map((occ, i) => (
                          <View key={occ._id || i} style={styles.occupantPill}>
                            <Avatar uri={occ.userId?.photoURL} name={occ.userId?.displayName} size={22} />
                            <Text style={styles.occupantNameText}>
                              {occ.userId?.displayName || 'Resident'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ── SECTION 3: EXPENSES ── */}
        {activeSection === 'expenses' && (
          <>
            {expensesLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </View>
            ) : (
              <>
                {/* Summary Cards */}
                <View style={styles.expenseSummaryRow}>
                  <View style={styles.expenseSummaryBox}>
                    <Text style={styles.expenseSummaryVal}>{formatCurrency(groceryCost)}</Text>
                    <Text style={styles.expenseSummaryLbl}>Grocery Total</Text>
                  </View>
                  <View style={styles.expenseSummaryBox}>
                    <Text style={[styles.expenseSummaryVal, { color: '#8b5cf6' }]}>{formatCurrency(commonCost)}</Text>
                    <Text style={styles.expenseSummaryLbl}>Common Total</Text>
                  </View>
                  <View style={styles.expenseSummaryBox}>
                    <Text style={[styles.expenseSummaryVal, { color: '#f43f5e' }]}>{formatCurrency(grandTotal)}</Text>
                    <Text style={styles.expenseSummaryLbl}>Grand Total</Text>
                  </View>
                </View>

                <Text style={styles.sectionHeading}>Itemized Expenses ({expenses.length})</Text>
                {expenses.length === 0 ? (
                  <EmptyState
                    icon={({ size, color }) => <Ionicons name="wallet-outline" size={size} color={color} />}
                    title="No expenses recorded this month"
                  />
                ) : (
                  expenses.map((e, idx) => (
                    <View key={e._id || idx} style={styles.expenseItemRow}>
                      <View
                        style={[
                          styles.expenseTypeBadge,
                          { backgroundColor: e.expenseType === 'Grocery' ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)' },
                        ]}
                      >
                        <Ionicons
                          name={e.expenseType === 'Grocery' ? 'cart' : 'construct'}
                          size={18}
                          color={e.expenseType === 'Grocery' ? '#f59e0b' : '#8b5cf6'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.expenseTitle}>{e.title || e.description}</Text>
                        <Text style={styles.expenseDate}>
                          {formatDate(e.date)} • {e.expenseType}
                        </Text>
                        {e.notes ? <Text style={styles.expenseNotes}>{e.notes}</Text> : null}
                      </View>
                      <Text style={styles.expenseAmountText}>{formatCurrency(e.amount)}</Text>
                    </View>
                  ))
                )}
              </>
            )}
          </>
        )}

        {/* ── SECTION 4: DORM INFO & RULES ── */}
        {activeSection === 'info' && (
          <>
            {settingsLoading ? (
              <CardSkeleton />
            ) : (
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoLogo}>
                    <Ionicons name="home" size={24} color="#a78bfa" />
                  </View>
                  <View>
                    <Text style={styles.infoDormName}>{settings?.dormName || '11/38 Home'}</Text>
                    <Text style={styles.infoSubtitle}>Resident Information & Contacts</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Contact Items */}
                <View style={styles.contactItem}>
                  <Ionicons name="location-outline" size={18} color="#a78bfa" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactLabel}>Address</Text>
                    <Text style={styles.contactValue}>{settings?.address || '11/38 Dhaka, Bangladesh'}</Text>
                  </View>
                </View>

                {settings?.managerContact && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={18} color="#10b981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactLabel}>Manager Helpline</Text>
                      <Text style={styles.contactValue}>{settings.managerContact}</Text>
                    </View>
                  </View>
                )}

                {settings?.maintenanceContact && (
                  <View style={styles.contactItem}>
                    <Ionicons name="construct-outline" size={18} color="#f59e0b" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactLabel}>Maintenance / Emergency</Text>
                      <Text style={styles.contactValue}>{settings.maintenanceContact}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.divider} />

                {/* Default Rates & Policies */}
                <Text style={styles.policyHeading}>Dorm Policies & Utility Information</Text>
                <View style={styles.policyRow}>
                  <Text style={styles.policyKey}>Currency:</Text>
                  <Text style={styles.policyVal}>{settings?.currency || 'BDT'} ({settings?.currencySymbol || '৳'})</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyKey}>Base Meal Rate:</Text>
                  <Text style={styles.policyVal}>৳{settings?.mealRate || 70} / meal</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyKey}>Bill Generation Day:</Text>
                  <Text style={styles.policyVal}>Day {settings?.billGenerationDay || 1} of each month</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyKey}>Standard Wifi Rate:</Text>
                  <Text style={styles.policyVal}>৳{settings?.defaultRates?.wifi || 210} / month</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyKey}>Water & Gas:</Text>
                  <Text style={styles.policyVal}>Shared evenly among active residents</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 2 },
  sectionRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionPillActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7c3aed',
  },
  sectionPillText: { fontSize: 12, fontWeight: '600', color: Colors.dark.textMuted },
  sectionPillTextActive: { color: '#a78bfa' },
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.dark.text },
  countBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  countBannerText: { fontSize: 13, fontWeight: '700', color: Colors.dark.text },
  countBannerSub: { fontSize: 12, color: Colors.dark.textDim },
  residentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  residentName: { fontSize: 14, fontWeight: '700', color: Colors.dark.text },
  residentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(167,139,250,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roomTagText: { fontSize: 10, color: '#a78bfa', fontWeight: '600' },
  residentIdText: { fontSize: 11, color: Colors.dark.textDim },
  residentStats: { alignItems: 'center' },
  residentMealsCount: { fontSize: 15, fontWeight: '800', color: Colors.dark.text },
  residentMealsLabel: { fontSize: 10, color: Colors.dark.textDim },
  roomCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 12,
  },
  roomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roomBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomNumberText: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  roomDetailsText: { fontSize: 12, color: Colors.dark.textMuted, marginBottom: 12 },
  barContainer: { marginBottom: 14 },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    marginBottom: 6,
  },
  barFill: { height: '100%', borderRadius: 4 },
  barLabel: { fontSize: 11, color: Colors.dark.textDim },
  occupantsHeader: { fontSize: 12, fontWeight: '600', color: Colors.dark.textMuted, marginBottom: 6 },
  emptyOccupantsText: { fontSize: 12, color: Colors.dark.textDim, fontStyle: 'italic' },
  occupantsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  occupantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  occupantNameText: { fontSize: 12, color: Colors.dark.text, fontWeight: '500' },
  expenseSummaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  expenseSummaryBox: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    alignItems: 'center',
  },
  expenseSummaryVal: { fontSize: 15, fontWeight: '700', color: '#f59e0b' },
  expenseSummaryLbl: { fontSize: 10, color: Colors.dark.textDim, marginTop: 4 },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: Colors.dark.text, marginBottom: 10 },
  expenseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  expenseTypeBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseTitle: { fontSize: 13, fontWeight: '600', color: Colors.dark.text },
  expenseDate: { fontSize: 11, color: Colors.dark.textDim, marginTop: 2 },
  expenseNotes: { fontSize: 11, color: Colors.dark.textDim, fontStyle: 'italic', marginTop: 2 },
  expenseAmountText: { fontSize: 14, fontWeight: '700', color: '#f43f5e' },
  infoCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 18,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLogo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(167,139,250,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoDormName: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  infoSubtitle: { fontSize: 12, color: Colors.dark.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  contactLabel: { fontSize: 11, color: Colors.dark.textDim, textTransform: 'uppercase', letterSpacing: 0.5 },
  contactValue: { fontSize: 13, fontWeight: '600', color: Colors.dark.text, marginTop: 2 },
  policyHeading: { fontSize: 14, fontWeight: '700', color: Colors.dark.text, marginBottom: 10 },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  policyKey: { fontSize: 12, color: Colors.dark.textMuted },
  policyVal: { fontSize: 12, fontWeight: '600', color: Colors.dark.text },
});
