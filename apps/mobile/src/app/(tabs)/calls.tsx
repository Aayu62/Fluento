'use client';

import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import type { CallScenario, ScheduledCall } from '@fluento/shared';

export default function CallsTabScreen() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<CallScenario[]>([]);
  const [upcoming, setUpcoming] = useState<ScheduledCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [scenResp, upResp] = await Promise.all([
        apiClient.get<CallScenario[]>('/calls/scenarios'),
        apiClient.get<ScheduledCall[]>('/calls/upcoming'),
      ]);
      setScenarios(scenResp.data ?? []);
      setUpcoming(upResp.data ?? []);
    } catch {
      // Silent error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartCall = async (callId: string) => {
    try {
      await apiClient.post(`/calls/${callId}/start`);
    } catch {
      // Ignore start error
    }
    router.push(`/calls/${callId}/room`);
  };

  const handleDeclineCall = async (callId: string) => {
    try {
      await apiClient.post(`/calls/${callId}/decline`);
      fetchData();
    } catch {
      // Silent catch
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>PART I — VOICE PRACTICE</Text>
      <Text style={styles.title}>Voice Calls</Text>
      <Text style={styles.subtitle}>
        Schedule roleplay calls with AI personas for interview, sales, and conversation practice.
      </Text>

      <TouchableOpacity
        style={styles.scheduleButton}
        onPress={() => router.push('/calls/schedule')}
      >
        <Text style={styles.scheduleButtonText}>+ Schedule New Call</Text>
      </TouchableOpacity>

      {/* Upcoming Scheduled Calls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Calls</Text>
        {isLoading ? (
          <ActivityIndicator color="#C4623B" style={{ marginVertical: 20 }} />
        ) : upcoming.length > 0 ? (
          upcoming.map((call) => (
            <View key={call.id} style={styles.callCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryBadge}>{call.scenario?.category ?? 'Voice Call'}</Text>
                <Text style={styles.timeText}>
                  {new Date(call.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.personaName}>{call.scenario?.personaName ?? 'AI Persona'}</Text>
              <Text style={styles.personaRole}>{call.scenario?.personaRole}</Text>
              <Text style={styles.scenarioTitle}>"{call.scenario?.title}"</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartCall(call.id)}
                >
                  <Text style={styles.startButtonText}>Start Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDeclineCall(call.id)}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No upcoming calls scheduled.</Text>
          </View>
        )}
      </View>

      {/* Available Scenarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Roleplay Scenarios</Text>
        {scenarios.map((sc) => (
          <View key={sc.id} style={styles.scenarioCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.categoryBadge}>{sc.category.replace('_', ' ')}</Text>
              <Text style={styles.diffBadge}>{sc.difficulty}</Text>
            </View>
            <Text style={styles.personaName}>{sc.title}</Text>
            <Text style={styles.personaRole}>
              Partner: {sc.personaName} ({sc.personaRole})
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => router.push(`/calls/schedule?scenarioId=${sc.id}`)}
            >
              <Text style={styles.selectButtonText}>Schedule Scenario</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: { padding: 20 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#17324D',
    opacity: 0.7,
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 20 },
  scheduleButton: {
    backgroundColor: '#C4623B',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: 12,
  },
  callCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { color: '#6B7280', fontSize: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: '#F2EBDD',
    color: '#17324D',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
  diffBadge: { color: '#C4623B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  timeText: { color: '#6B7280', fontSize: 12 },
  personaName: { fontSize: 18, fontWeight: '700', color: '#17324D', marginBottom: 2 },
  personaRole: { fontSize: 13, color: '#4B5563', marginBottom: 6 },
  scenarioTitle: { fontSize: 14, fontStyle: 'italic', color: '#17324D', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  startButton: {
    flex: 1,
    backgroundColor: '#5D8A6A',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  startButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  declineButton: {
    borderColor: '#B85450',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  declineButtonText: { color: '#B85450', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  selectButton: {
    borderColor: '#17324D',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  selectButtonText: { color: '#17324D', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
});
