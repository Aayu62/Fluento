import { Tabs } from 'expo-router';
import { Home, Phone, BookOpen, TrendingUp, User } from 'lucide-react-native';

// DESIGN.md §19 — Bottom Navigation: Home, Calls, Practice, Progress, Profile
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#F7F3EB',
          borderTopColor: '#D8D0C0',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#C4623B',
        tabBarInactiveTintColor: '#17324D',
        tabBarLabelStyle: {
          fontFamily: 'IBM Plex Mono',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Home size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="calls"
        options={{ title: 'Calls', tabBarIcon: ({ color }) => <Phone size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => <BookOpen size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TrendingUp size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={20} color={color} /> }}
      />
    </Tabs>
  );
}
