import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient, setAuthToken } from '@/lib/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function SettingsScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/users/me');
        if (mounted && data) {
          setEmail(data.user?.email || '');
          setFullName(data.user?.fullName || '');
          if (data.profile?.notificationPrefs) {
             setPushEnabled(data.profile.notificationPrefs.pushEnabled ?? true);
             setEmailEnabled(data.profile.notificationPrefs.emailEnabled ?? false);
          }
        }
      } catch (err) {
        console.warn('Failed to load profile', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/users/me', {
        fullName,
        notificationPrefs: { pushEnabled, emailEnabled },
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('fluento_auth');
    setAuthToken(null);
    clearAuth();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#5D8A6A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Settings</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Email Address (Read-only)</Text>
        <TextInput
          value={email}
          editable={false}
          style={[styles.input, styles.inputDisabled]}
        />
        
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
        
        <View style={styles.divider} />
        
        <Text style={styles.label}>Notifications</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Push Notifications</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#D8D0C0', true: '#5D8A6A' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Email Notifications</Text>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: '#D8D0C0', true: '#5D8A6A' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave} 
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3EB', paddingHorizontal: 32, paddingTop: 40, paddingBottom: 40 },
  center: { justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: '#FFFFFF', borderRadius: 8 },
  backButtonText: { color: '#17324D', fontWeight: '600' },
  header: { fontSize: 32, fontWeight: '800', color: '#17324D' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#D8D0C0' },
  label: { fontSize: 12, fontWeight: '700', color: '#17324D', textTransform: 'uppercase', marginBottom: 8, opacity: 0.6 },
  input: { backgroundColor: '#F7F3EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#17324D', marginBottom: 20 },
  inputDisabled: { opacity: 0.5 },
  divider: { height: 1, backgroundColor: '#D8D0C0', marginVertical: 10, opacity: 0.5 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  switchText: { fontSize: 14, color: '#17324D' },
  saveButton: { backgroundColor: '#C4623B', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, textTransform: 'uppercase' },
  signOutButton: { marginTop: 30, alignSelf: 'center' },
  signOutText: { color: '#B85450', fontWeight: '700', fontSize: 14, textTransform: 'uppercase' }
});
