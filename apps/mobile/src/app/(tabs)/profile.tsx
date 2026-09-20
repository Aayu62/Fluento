'use client';

import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useRouter } from 'expo-router';
import { Settings, Mail, User as UserIcon } from 'lucide-react-native';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <Text style={styles.title}>Profile</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => router.push('/settings')}
        >
          <Settings color="#17324D" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.avatarName}>{user?.fullName || 'User'}</Text>
        <Text style={styles.avatarUsername}>@{user?.fullName?.toLowerCase().replace(/\s+/g, '') || 'username'}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <UserIcon color="#C4623B" size={20} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.cardLabel}>Full Name</Text>
            <Text style={styles.cardValue}>{user?.fullName || 'Not provided'}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Mail color="#C4623B" size={20} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.cardLabel}>Email Address</Text>
            <Text style={styles.cardValue}>{user?.email ?? 'Not logged in'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: { padding: 32, paddingBottom: 40 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingTop: 12
  },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8, textTransform: 'uppercase', fontFamily: 'System' },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D' },
  settingsButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#17324D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#C4623B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarText: {
    color: '#F7F3EB',
    fontSize: 40,
    fontWeight: '800',
  },
  avatarName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 4,
  },
  avatarUsername: {
    fontSize: 16,
    color: '#6B7280',
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FDF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  cardLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#6B7280', marginBottom: 4 },
  cardValue: { fontSize: 16, fontWeight: '600', color: '#17324D' },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
    marginLeft: 64, // Align with text
  }
});
