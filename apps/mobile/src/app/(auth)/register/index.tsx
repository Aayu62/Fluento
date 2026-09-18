import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/auth.store';
import { setAuthToken } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth.api';

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await authApi.register({ email, password, fullName });
      setAuthToken(data.accessToken);
      setAuth(
        {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          createdAt: '',
          updatedAt: '',
        },
        data.accessToken,
      );
      router.replace('/(auth)/onboarding');
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const redirectUrl = Linking.createURL('/(auth)/register');
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      if (authError) throw authError;
    } catch (e: any) {
      setError(e.message || 'Google Login failed');
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.label}>COMMUNICATION TRAINING</Text>
        <Text style={styles.title}>Fluento</Text>
        <Text style={styles.subtitle}>Begin your communication journey</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CREATE ACCOUNT</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {[
          { label: 'FULL NAME', value: fullName, setter: setFullName, placeholder: 'Your name', secure: false, keyboard: 'default' as const },
          { label: 'EMAIL ADDRESS', value: email, setter: setEmail, placeholder: 'you@example.com', secure: false, keyboard: 'email-address' as const },
          { label: 'PASSWORD', value: password, setter: setPassword, placeholder: 'Minimum 8 characters', secure: true, keyboard: 'default' as const },
        ].map((field) => (
          <View key={field.label} style={styles.field}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={field.value}
              onChangeText={field.setter}
              placeholder={field.placeholder}
              placeholderTextColor="#17324D66"
              secureTextEntry={field.secure}
              keyboardType={field.keyboard}
              autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.link}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F7F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  label: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#17324D80',
    marginBottom: 8,
  },
  title: { fontSize: 40, fontWeight: '700', color: '#17324D', marginBottom: 8 },
  subtitle: { fontFamily: 'IBM Plex Mono', fontSize: 13, color: '#17324D99' },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#F7F3EB',
    borderWidth: 1,
    borderColor: '#D8D0C0',
    borderRadius: 16,
    padding: 24,
  },
  sectionLabel: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#17324D80',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#B8545010',
    borderWidth: 1,
    borderColor: '#B8545040',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#B85450' },
  field: { marginBottom: 16 },
  fieldLabel: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#17324DB3',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D8D0C0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: 'IBM Plex Mono',
    fontSize: 14,
    color: '#17324D',
    backgroundColor: '#F7F3EB',
  },
  button: {
    height: 44,
    backgroundColor: '#C4623B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: 'IBM Plex Mono', fontSize: 14, fontWeight: '600', color: '#fff' },
  googleButton: {
    height: 44,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D8D0C0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  googleButtonText: { fontFamily: 'IBM Plex Mono', fontSize: 14, fontWeight: '600', color: '#17324D' },
  linkRow: { marginTop: 20, alignItems: 'center' },
  linkText: { fontFamily: 'IBM Plex Mono', fontSize: 13, color: '#17324D99' },
  link: { color: '#C4623B' },
});
