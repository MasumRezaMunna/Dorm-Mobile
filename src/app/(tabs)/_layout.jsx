/**
 * Bottom Tab Navigator for Dorm Solution.
 * Theme: Premium Dark Green & Emerald (#0f172a bg, #1e293b surface, #34d399 active)
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

function TabBarIcon({ name, focused, color }) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
      <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
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
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: 'Notices',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="megaphone" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="restaurant" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Bazar',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="cart" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Dorm Hub',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="business" focused={focused} color={color} />
          ),
        }}
      />
      {/* Hidden auxiliary tab */}
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
    backgroundColor: Colors.dark.surface, // #1e293b
    borderTopColor: Colors.dark.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 66,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  iconFocused: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
});
