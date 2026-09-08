'use client';

import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import type { CallScenario, CallCategory } from '@fluento/shared';

export default function MobileScheduleScreen() {
  const router = useRouter();
  const { scenarioId } = useLocalSearchParams<{ scenarioId?: string }>();

  const [category, setCategory] = useState<CallCategory>('interview');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarioId ?? '');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().split('T')[0]!,
  );
  const [scheduledTime, setScheduledTime] = useState<string>('14:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmSchedule = async () => {
    setError(null);
    if (!selectedScenarioId) {
      setError('Please select a call scenario ID.');
      return;
    }

    const scheduledIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    if (new Date(scheduledIso) <= new Date()) {
      setError('Scheduled time must be in the future.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/calls/schedule', {
        scenarioId: selectedScenarioId,
        scheduledTime: scheduledIso,
      });
      router.replace('/(tabs)/calls');
    } catch {
      setError('Failed to schedule call session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>SCHEDULE SESSION</Text>
      <Text style={styles.title}>Schedule Call</Text>
      <Text style={styles.subtitle}>Set your date and time for voice coaching practice.</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {(['interview', 'sales', 'daily_conversation'] as CallCategory[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                {cat.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Scenario ID</Text>
        <TextInput
          value={selectedScenarioId}
          onChangeText={setSelectedScenarioId}
          placeholder="Enter or paste scenario UUID"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Date (YYYY-MM-DD)</Text>
        <TextInput
          value={scheduledDate}
          onChangeText={setScheduledDate}
          placeholder="2026-09-08"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Time (HH:MM 24h)</Text>
        <TextInput
          value={scheduledTime}
          onChangeText={setScheduledTime}
          placeholder="14:00"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleConfirmSchedule}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Confirm & Schedule</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4B5563', marginBottom: 20 },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#B85450', fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16 },
  cardLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { backgroundColor: '#F7F3EB', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  catChipActive: { backgroundColor: '#17324D' },
  catChipText: { fontSize: 12, color: '#17324D', textTransform: 'uppercase' },
  catChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  input: { backgroundColor: '#F7F3EB', borderRadius: 14, padding: 12, fontSize: 14, color: '#17324D' },
  submitButton: { backgroundColor: '#C4623B', borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
