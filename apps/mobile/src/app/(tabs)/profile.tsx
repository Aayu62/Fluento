'use client';

import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useRouter } from 'expo-router';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>USER ACCOUNT</Text>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Account Email</Text>
        <Text style={styles.cardValue}>{user?.email ?? 'Not logged in'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 20 },
  cardLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7280', marginBottom: 6 },
  cardValue: { fontSize: 16, fontWeight: '700', color: '#17324D' },
  logoutButton: { backgroundColor: '#B85450', borderRadius: 20, paddingVertical: 16, alignItems: 'center' },
  logoutButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
