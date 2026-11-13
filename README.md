# 🏢 Dorm Solution — Mobile Application

> Modern, high-performance, dark-green themed dormitory and meal management mobile application built with **React Native**, **Expo SDK 54**, and **Expo Router v6**. Designed for transparent resident operations, live financial metrics, and comprehensive dining management.

---

## 📱 Highlights & Core Principles

- **Exactly 3 Bottom Navigation Tabs**: Streamlined navigation with `Home`, `Meals`, and `Expense` floating on a modern transparent glass bar.
- **Dedicated Quick Services**: Auxiliary utilities (Notices, Bazar Duty, Room Hub, Residents) accessible via compact cards directly on the Home dashboard.
- **Strict 2-Meal System**: Lunch and Dinner **only** — zero breakfast clutter across the entire UI, calculations, filters, summaries, and routine menus.
- **Real Backend-Driven Transparency**: All rates, meal counts, grocery costs, and allocations are synced in real time from live REST APIs without synthetic/mock data.
- **Premium Emerald & Forest Green Identity**: Cohesive dark-mode aesthetic utilizing deep slate backgrounds (`#0F172A`, `#1E293B`) and vibrant green accents (`#059669`, `#10B981`, `#34D399`).
- **OTA Update Ready**: Pre-configured with `expo-updates` on the `preview` channel with `appVersion` runtime versioning (`1.0.0`).

---

## 🧭 Navigation Architecture

```
App Root (src/app/)
│
├── (tabs)/                      <-- Bottom Tab Navigator (3 Visible Tabs)
│   ├── _layout.jsx              <-- Transparent Tab Bar (Home, Meals, Expense)
│   ├── index.jsx                <-- [Tab 1] Home Dashboard & Quick Services
│   ├── meals.jsx                <-- [Tab 2] Detailed Meal Management (Lunch & Dinner)
│   ├── expenses.jsx             <-- [Tab 3] Financial & Expense Management
│   ├── notices.jsx              <-- [Hidden from tab bar; routed via Quick Services]
│   ├── market.jsx               <-- [Hidden from tab bar; routed via Quick Services]
│   ├── community.jsx            <-- [Hidden from tab bar; routed via Quick Services]
│   └── profile.jsx              <-- [Hidden from tab bar; auxiliary profile]
│
├── complaints/                  <-- Complaints & issue tracking
├── notices/[id].jsx             <-- Full announcement viewer
├── room.jsx                     <-- Room hub & capacity details
└── settings.jsx                 <-- Dorm rules, helpline & guidelines
```

---

## 🌟 Detailed Feature Breakdown

### 1. Home Dashboard (`src/app/(tabs)/index.jsx`)
- **Header**: Emerald gradient Logo Badge paired with clean **Home** typography, active month/year label, and a live sync status indicator (`SYNCED`).
- **Quick Services (4-Card Grid)**:
  - 📢 **Notices** (`/(tabs)/notices`) — Circulars, announcements, and notice count badge.
  - 🛒 **Bazar Duty** (`/(tabs)/market`) — Daily shopping teams and upcoming rosters.
  - 🛏 **Room Hub** (`/room`) — Dorm room capacities, occupied seats, and vacancies.
  - 👥 **Residents** (`/(tabs)/community`) — Member roster, resident contacts, and assigned rooms.
- **Today's Bazar Team Highlight**: Live card showing today's shopping crew and member names.
- **Today's Dining Menu**: Quick glance at today's lunch and dinner dishes with a direct link to the Weekly Routine.
- **Financial Overview (4 Metrics)**:
  - 🍽 **Monthly Meals**: Current month's aggregated meal count.
  - 📈 **Current Rate**: Calculated average cost per meal (৳).
  - 🧾 **Common Cost**: Cost per active member for shared utilities (৳).
  - 👛 **Total Expenses**: Combined grocery and common dormitory expenditures (৳).
- **Latest Notices**: Interactive announcement cards with read-more navigation.

---

### 2. Meals Management (`src/app/(tabs)/meals.jsx`)
Strict **Lunch & Dinner ONLY** dining system across 5 horizontal tabs:

1. **Overview & Daily**:
   - Today's lunch, dinner, total count, and daily cost.
   - Monthly lunch and dinner totals with average meals per day.
   - Lunch vs Dinner balance visualization bar.
   - Expandable date-by-date daily cards displaying each day's lunch/dinner totals and member entries.
   - Date search filter.
2. **Lunch**:
   - Dedicated monthly lunch metrics, expenditure, and active member lunch logs.
3. **Dinner**:
   - Dedicated monthly dinner metrics, expenditure, and active member dinner logs.
4. **Monthly Summary**:
   - Comprehensive financial dining breakdown (grocery total, meal rate, total meals).
   - Previous-month comparative trend indicator.
   - Member-by-member transparency table (individual Lunch count, Dinner count, total meals, and meal cost).
5. **Weekly Menu**:
   - Standard recurring Lunch and Dinner menu for each day of the week, with an active **TODAY** badge.

---

### 3. Expense & Financial Management (`src/app/(tabs)/expenses.jsx`)
- **Month Navigator**: Navigate backward and forward across historical months (capped at the current month).
- **Grand Total Summary Card**: Total monthly expenditure, grocery cost, common dorm cost, and visual percentage split bar.
- **Category Filter Chips**: Instant filtering by `All Expenses`, `Grocery`, or `Common`.
- **Search Bar**: Real-time filtering by expense title, notes, or category.
- **Itemized Expense List**: Record cards with expense title, category badge, date, contributor name, and amount.
- **Receipt Viewer Modal**: Tap on any expense with an attached receipt to view the full-screen receipt voucher.

---

## 🎨 Theme & Design System

The application strictly adheres to a centralized dark-green design token palette defined in [`src/constants/colors.js`](file:///d:/CODE/Home/mobile/src/constants/colors.js):

| Token | Hex Code | Usage |
|---|---|---|
| **Forest Green** | `#064E3B` | Deep containers, dark gradient stops |
| **Emerald Green** | `#059669` | Primary buttons, badge borders, active states |
| **Primary Green** | `#10B981` | Brand accents, positive metrics, highlight icons |
| **Mint Green** | `#34D399` | Text highlights, active bottom tab icon tints, glowing pills |
| **Soft Mint** | `#A7F3D0` | Subtle badge text and delicate borders |
| **Dark Background** | `#0F172A` | Primary app canvas background (Deep Slate) |
| **Dark Surface** | `#1E293B` | Card containers, interactive surfaces |
| **Dark Border** | `rgba(255, 255, 255, 0.08)` | Divider lines, card outlines |

> [!NOTE]
> All legacy indigo, violet, and bright blue styling has been fully replaced with the emerald-mint palette.

---

## 🔌 API & Backend Integration

The app connects to the production Dorm Solution REST backend:
- **Base URL**: `https://dorm-server.onrender.com/api`
- **Networking Engine**: Axios with React Query (`@tanstack/react-query`) caching and automatic refetch.

### Key Public Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/public/overview` | `GET` | Dorm stats, resident counts, current rate, today's market team |
| `/public/meals/entries` | `GET` | Paginated daily meal logs (`date`, `month`, `year`, `limit`) |
| `/public/meals/monthly-detail` | `GET` | Aggregated monthly meals, grocery total, member summaries |
| `/public/meals/weekly-plan` | `GET` | Recurring weekly dining routine (Lunch & Dinner) |
| `/public/expenses` | `GET` | Filtered expenses (`month`, `year`, `expenseType`, `limit`) |
| `/public/community` | `GET` | Registered residents and room allocations |
| `/public/rooms` | `GET` | Room inventory, seat occupancies, and vacancies |
| `/public/notices` | `GET` | Notice board circulars and announcements |
| `/public/settings` | `GET` | Dorm rules, address, manager helpline, and facilities |

---

## 🛠️ Project Structure

```
mobile/
├── assets/                  <-- App icons, splash screens, favicon
├── src/
│   ├── app/                 <-- Expo Router screen routes
│   │   ├── (tabs)/          <-- Bottom tab screens (Home, Meals, Expense)
│   │   ├── (manager)/       <-- Management console screens
│   │   ├── complaints/      <-- Complaint submission & history
│   │   ├── notices/         <-- Detailed notice screens
│   │   ├── _layout.jsx      <-- Root layout with providers
│   │   ├── room.jsx         <-- Room details screen
│   │   └── settings.jsx     <-- Dorm rules & helpline screen
│   │
│   ├── components/
│   │   ├── layout/          <-- ScreenWrapper, ScreenHeader
│   │   ├── shared/          <-- StatCard, NoticeCard, DormLogo, ComplaintCard
│   │   └── ui/              <-- Button, Avatar, Badge, Input, Skeleton, EmptyState
│   │
│   ├── constants/           <-- colors.js (Design tokens & theme)
│   ├── features/            <-- Feature hooks (dashboard, meals, expenses, etc.)
│   ├── services/            <-- api.js (Axios instance)
│   ├── store/               <-- Zustand client stores
│   └── utils/               <-- helpers.js (formatCurrency, formatDate, etc.)
│
├── app.json                 <-- Expo application manifest & plugins
├── eas.json                 <-- EAS Build & Update profiles
├── package.json             <-- Dependencies & project metadata
└── tailwind.config.js       <-- NativeWind Tailwind CSS config
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm** or **yarn**
- **Expo CLI** (`npx expo`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Expo Go** app installed on your Android device

### Installation
```bash
# Navigate to the mobile project directory
cd d:\CODE\Home\mobile

# Install dependencies
npm install
```

### Local Development
```bash
# Start Metro bundler with cache cleared
npx expo start --clear
```
1. Open **Expo Go** on your Android device.
2. Scan the QR code displayed in the terminal.
3. Changes to `.jsx` and styling files hot-reload instantly.

---

## 📦 Building & OTA Updates (EAS)

### EAS Configuration Summary
- **Project ID**: `28734682-471a-4717-8042-9be34ece33f7`
- **Owner**: `masumrezamunnas-team`
- **Runtime Version Policy**: `appVersion` (`1.0.0`)
- **Default Channel**: `preview`

### 1. Building the Native Preview APK
```bash
eas build --platform android --profile preview
```
*Creates an installable `.apk` file under the `preview` channel with `expo-updates` embedded natively.*

### 2. Publishing Over-the-Air (OTA) Updates
Once the APK containing `expo-updates` is installed, all JavaScript and asset changes can be deployed without rebuilding:
```bash
eas update --channel preview --message "Your update description"
```
*The installed APK will automatically download and apply the new update upon its next launch.*

---

## 📋 Technology Stack

- **Core**: React Native `0.81.5`, React `19.1.0`
- **Framework**: Expo SDK `54.0.37`
- **Routing**: Expo Router `6.0.24`
- **State & Server Cache**: TanStack React Query v5, Zustand v5
- **Styling**: NativeWind v4, Tailwind CSS v3, React Native Reanimated v4
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Safe Area**: `react-native-safe-area-context`
- **HTTP Client**: Axios `1.7.0`
- **OTA Updates**: `expo-updates` `29.0.20`

