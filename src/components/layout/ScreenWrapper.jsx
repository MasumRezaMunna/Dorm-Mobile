import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';

/**
 * ScreenWrapper — Standard safe-area wrapper with optional pull-to-refresh.
 * Theme: Dark-green background (#0f172a)
 */
export default function ScreenWrapper({
  children,
  scrollable = false,
  onRefresh,
  isRefreshing = false,
  style,
  edges = ['top', 'left', 'right'],
}) {
  if (scrollable) {
    return (
      <SafeAreaView style={[styles.root, style]} edges={edges}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#34d399"
                colors={['#10b981']}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, style]} edges={edges}>
      <View style={styles.flex}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg, // #0f172a
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
