/**
 * Expense Screen — Public Financial & Expense Tracking
 * Theme: Premium Dark Green (#0f172a bg, #1e293b surface, #059669 / #10b981 / #34d399)
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useExpenses } from '../../features/expenses/hooks/useExpenses';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Colors from '../../constants/colors';
import { formatCurrency, formatDate, getCurrentMonthYear, getMonthName } from '../../utils/helpers';

const CATEGORIES = [
  { key: 'all', label: 'All Expenses', icon: 'wallet-outline' },
  { key: 'Grocery', label: 'Grocery', icon: 'cart-outline' },
  { key: 'Common', label: 'Common', icon: 'receipt-outline' },
];

export default function ExpensesTabScreen() {
  const current = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(current.month);
  const [selectedYear, setSelectedYear] = useState(current.year);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptModalUrl, setReceiptModalUrl] = useState(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    const isCurrent = selectedMonth === current.month && selectedYear === current.year;
    if (isCurrent) return; // Don't go to future months
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const isCurrentMonth = selectedMonth === current.month && selectedYear === current.year;

  // Data query
  const {
    data: expenseData,
    isLoading,
    refetch,
    isRefetching,
  } = useExpenses(selectedMonth, selectedYear, selectedCategory);

  const rawExpenses = expenseData?.expenses || [];
  const groceryCost = expenseData?.groceryCost || 0;
  const commonCost = expenseData?.commonCost || 0;
  const grandTotal = expenseData?.grandTotal || (groceryCost + commonCost);

  // Percentages for visualization
  const groceryPct = grandTotal > 0 ? Math.round((groceryCost / grandTotal) * 100) : 0;
  const commonPct = grandTotal > 0 ? 100 - groceryPct : 0;

  // Filtered by search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return rawExpenses;
    const q = searchQuery.toLowerCase().trim();
    return rawExpenses.filter((e) => {
      const matchTitle = (e.title || '').toLowerCase().includes(q);
      const matchNotes = (e.notes || '').toLowerCase().includes(q);
      const matchType = (e.expenseType || '').toLowerCase().includes(q);
      return matchTitle || matchNotes || matchType;
    });
  }, [rawExpenses, searchQuery]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      {/* Header with Month Navigator */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Financial & Expenses</Text>
          <Text style={styles.headerSubtitle}>Transparent dormitory account ledger</Text>
        </View>

        {/* Month Selector Controls */}
        <View style={styles.monthControls}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrowBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color="#34d399" />
          </TouchableOpacity>
          <View style={styles.monthLabelBox}>
            <Text style={styles.monthLabelText}>
              {getMonthName(selectedMonth).slice(0, 3)} {selectedYear}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.navArrowBtn, isCurrentMonth && styles.navArrowBtnDisabled]}
            disabled={isCurrentMonth}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={18} color={isCurrentMonth ? '#475569' : '#34d399'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#34d399" />}
        contentContainerStyle={styles.scroll}
      >
        {/* ── 1. Top Financial Summary Card ── */}
        <Animated.View entering={FadeInDown.duration(350)} style={styles.grandSummaryCard}>
          <View style={styles.grandSummaryTop}>
            <View>
              <Text style={styles.grandSummaryLabel}>Total Monthly Expenses</Text>
              <Text style={styles.grandSummaryAmount}>{formatCurrency(grandTotal)}</Text>
            </View>
            <View style={styles.grandSummaryBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#34d399" />
              <Text style={styles.grandSummaryBadgeText}>Audited</Text>
            </View>
          </View>

          {/* Grocery vs Common Progress Ratio */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressSegmentGrocery, { width: `${groceryPct}%` }]} />
              <View style={[styles.progressSegmentCommon, { width: `${commonPct}%` }]} />
            </View>
            <View style={styles.progressLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>Grocery: {groceryPct}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#34d399' }]} />
                <Text style={styles.legendText}>Common: {commonPct}%</Text>
              </View>
            </View>
          </View>

          {/* Sub Totals Grid */}
          <View style={styles.subTotalsRow}>
            <View style={styles.subTotalCard}>
              <View style={styles.subTotalHeader}>
                <View style={styles.iconCircleGrocery}>
                  <Ionicons name="cart" size={14} color="#10b981" />
                </View>
                <Text style={styles.subTotalLabel}>Grocery Fund</Text>
              </View>
              <Text style={styles.subTotalValue}>{formatCurrency(groceryCost)}</Text>
              <Text style={styles.subTotalNote}>Food supplies & bazar</Text>
            </View>

            <View style={styles.subTotalCard}>
              <View style={styles.subTotalHeader}>
                <View style={styles.iconCircleCommon}>
                  <Ionicons name="receipt" size={14} color="#34d399" />
                </View>
                <Text style={styles.subTotalLabel}>Common Fund</Text>
              </View>
              <Text style={styles.subTotalValue}>{formatCurrency(commonCost)}</Text>
              <Text style={styles.subTotalNote}>Utilities, gas, maintenance</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── 2. Category Filters ── */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isActive ? '#ffffff' : Colors.dark.textMuted}
                />
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 3. Search Bar ── */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={16} color={Colors.dark.textDim} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search expense description or note..."
            placeholderTextColor={Colors.dark.textDim}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={16} color={Colors.dark.textDim} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── 4. Itemized Expenses Header ── */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listSectionTitle}>
            Expense Records ({filteredExpenses.length})
          </Text>
          <Text style={styles.listSectionSub}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>

        {/* ── 5. Records List ── */}
        {isLoading ? (
          <View style={{ gap: 10 }}>
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </View>
        ) : filteredExpenses.length === 0 ? (
          <EmptyState
            icon={({ size, color }) => <Ionicons name="wallet-outline" size={size} color={color} />}
            title="No expenses found"
            subtitle={
              searchQuery
                ? 'Try a different search keyword'
                : `No ${selectedCategory === 'all' ? '' : selectedCategory.toLowerCase()} expenses logged for ${getMonthName(selectedMonth)} ${selectedYear}.`
            }
          />
        ) : (
          filteredExpenses.map((expense, idx) => {
            const isGrocery = expense.expenseType === 'Grocery';
            return (
              <Animated.View
                key={expense._id || idx}
                entering={FadeInDown.delay(Math.min(idx * 30, 300)).duration(300)}
                style={styles.expenseCard}
              >
                <View style={styles.expenseCardTop}>
                  <View
                    style={[
                      styles.typeBadge,
                      isGrocery ? styles.typeBadgeGrocery : styles.typeBadgeCommon,
                    ]}
                  >
                    <Ionicons
                      name={isGrocery ? 'cart' : 'receipt'}
                      size={14}
                      color={isGrocery ? '#10b981' : '#34d399'}
                    />
                    <Text
                      style={[
                        styles.typeBadgeText,
                        isGrocery ? styles.typeBadgeTextGrocery : styles.typeBadgeTextCommon,
                      ]}
                    >
                      {expense.expenseType || 'Common'}
                    </Text>
                  </View>

                  <View style={styles.dateTag}>
                    <Ionicons name="calendar-outline" size={12} color={Colors.dark.textDim} />
                    <Text style={styles.dateTagText}>{formatDate(expense.date)}</Text>
                  </View>
                </View>

                <View style={styles.expenseBodyRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.expenseTitle}>{expense.title || 'Expense item'}</Text>
                    {expense.notes ? (
                      <Text style={styles.expenseNotes} numberOfLines={2}>
                        {expense.notes}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountValue}>{formatCurrency(expense.amount)}</Text>
                  </View>
                </View>

                <View style={styles.expenseCardFooter}>
                  <View style={styles.authorRow}>
                    <Ionicons name="person-outline" size={12} color={Colors.dark.textDim} />
                    <Text style={styles.authorText}>
                      By {expense.createdBy?.displayName || 'Management'}
                    </Text>
                  </View>

                  {expense.receipt ? (
                    <TouchableOpacity
                      onPress={() => setReceiptModalUrl(expense.receipt)}
                      style={styles.receiptPill}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="receipt-outline" size={12} color="#34d399" />
                      <Text style={styles.receiptPillText}>Receipt</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* Receipt Image Modal */}
      {receiptModalUrl && (
        <Modal
          visible={!!receiptModalUrl}
          transparent
          animationType="fade"
          onRequestClose={() => setReceiptModalUrl(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Expense Receipt</Text>
                <TouchableOpacity onPress={() => setReceiptModalUrl(null)} hitSlop={12}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: receiptModalUrl }}
                style={styles.receiptImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg, // #0f172a
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface, // #1e293b
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  navArrowBtn: {
    padding: 6,
  },
  navArrowBtnDisabled: {
    opacity: 0.35,
  },
  monthLabelBox: {
    paddingHorizontal: 6,
  },
  monthLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  grandSummaryCard: {
    backgroundColor: Colors.dark.surface, // #1e293b
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    padding: 16,
    marginBottom: 14,
  },
  grandSummaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  grandSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grandSummaryAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  grandSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  grandSummaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  progressContainer: {
    marginVertical: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegmentGrocery: {
    backgroundColor: '#10b981',
    height: '100%',
  },
  progressSegmentCommon: {
    backgroundColor: '#34d399',
    height: '100%',
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.dark.textDim,
    fontWeight: '600',
  },
  subTotalsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  subTotalCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  subTotalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconCircleGrocery: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCommon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTotalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  subTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  subTotalNote: {
    fontSize: 10,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  categoryBtnActive: {
    backgroundColor: '#059669', // Emerald Green
    borderColor: '#10b981',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 13,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  listSectionSub: {
    fontSize: 12,
    color: Colors.dark.textDim,
  },
  expenseCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 10,
  },
  expenseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeGrocery: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  typeBadgeCommon: {
    backgroundColor: 'rgba(52, 211, 153, 0.14)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  typeBadgeTextGrocery: {
    color: '#10b981',
  },
  typeBadgeTextCommon: {
    color: '#34d399',
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTagText: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  expenseBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    letterSpacing: -0.2,
  },
  expenseNotes: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 3,
    lineHeight: 16,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  expenseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorText: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
  receiptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  receiptPillText: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.dark.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  receiptImage: {
    width: '100%',
    height: 380,
    backgroundColor: '#000000',
  },
});

