import { Tabs } from 'expo-router';
import { Home, Phone, BookOpen, TrendingUp, User } from 'lucide-react-native';

// DESIGN.md §19 — Bottom Navigation: Home, Calls, Practice, Progress, Profile
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: 'Fluento',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#F7F3EB',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#D8D0C0',
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: '#17324D',
        },
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
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <Home size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="calls"
        options={{ tabBarLabel: 'Calls', tabBarIcon: ({ color }) => <Phone size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color }) => <BookOpen size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <TrendingUp size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <User size={20} color={color} /> }}
      />
    </Tabs>
  );
}
