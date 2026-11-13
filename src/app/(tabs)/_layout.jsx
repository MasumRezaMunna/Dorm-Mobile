/**
 * Bottom Tab Navigator for Dorm Solution.
 * Theme: Transparent Glass Nav with Vibrant Emerald/Mint Icons (#34d399 active, #94a3b8 inactive)
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

function TabBarIcon({ name, focused, size = 22 }) {
  const iconColor = focused ? '#34d399' : '#94a3b8';
  const iconName = focused ? name : `${name}-outline`;

  return (
    <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
      <Ionicons
        name={iconName}
        size={size}
        color={iconColor}
        style={{ color: iconColor }}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#34d399', // Mint Green active tint
        tabBarInactiveTintColor: '#94a3b8', // Silver slate inactive tint
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* 1. Home Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="home" focused={focused} size={23} />
          ),
        }}
      />

      {/* 2. Detailed Meal Management */}
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="restaurant" focused={focused} size={23} />
          ),
        }}
      />

      {/* 3. Expense & Financial Tracking */}
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expense',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="wallet" focused={focused} size={23} />
          ),
        }}
      />

      {/* Auxiliary screens accessible via Quick Services, hidden from bottom navigation */}
      <Tabs.Screen
        name="notices"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  iconWrapper: {
    width: 48,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  iconFocused: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
});
