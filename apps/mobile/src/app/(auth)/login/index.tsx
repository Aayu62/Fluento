import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/auth.store';
import { setAuthToken } from '@/lib/api/client';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError || !data.session) {
      setError(authError?.message ?? 'Login failed');
      return;
    }

    const token = data.session.access_token;
    setAuthToken(token);
    setAuth(
      {
        id: data.user.id,
        email: data.user.email ?? email,
        fullName: (data.user.user_metadata['full_name'] as string | undefined) ?? '',
        createdAt: '',
        updatedAt: '',
      },
      token,
    );
    router.replace('/(tabs)');
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.label}>COMMUNICATION TRAINING</Text>
        <Text style={styles.title}>Fluento</Text>
        <Text style={styles.subtitle}>Sign in to continue your practice</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>SIGN IN</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#17324D66"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#17324D66"
            secureTextEntry
            autoComplete="current-password"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            Don&apos;t have an account?{' '}
            <Text style={styles.link}>Create one</Text>
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
  linkRow: { marginTop: 20, alignItems: 'center' },
  linkText: { fontFamily: 'IBM Plex Mono', fontSize: 13, color: '#17324D99' },
  link: { color: '#C4623B' },
});
