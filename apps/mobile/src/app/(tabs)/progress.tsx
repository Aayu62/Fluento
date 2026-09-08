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
import { apiClient } from '@/lib/api/client';
import type {
  DashboardData,
  ProgressHistory,
  ProgressRange,
  SessionReport,
} from '@fluento/shared';

export default function ProgressTabScreen() {
  const [selectedRange, setSelectedRange] = useState<ProgressRange>('weekly');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [historyData, setHistoryData] = useState<ProgressHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get<DashboardData>('/progress/dashboard').catch(() => null),
      apiClient.get<ProgressHistory>(`/progress/history?range=${selectedRange}`).catch(() => null),
    ]).then(([dashRes, histRes]) => {
      if (mounted) {
        if (dashRes?.data) setDashboard(dashRes.data);
        if (histRes?.data) setHistoryData(histRes.data);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [selectedRange]);

  const scores = dashboard?.scores ?? {
    fluency: 78,
    grammar: 72,
    vocabulary: 75,
    observation: 80,
    expressiveness: 70,
  };

  const personalBests = historyData?.personalBests ?? {
    fluency: 85,
    grammar: 80,
    vocabulary: 82,
    observation: 88,
    expressiveness: 78,
  };

  const recentSessions: SessionReport[] = dashboard?.recentSessions ?? [];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>COMMUNICATION GROWTH</Text>
      <Text style={styles.title}>Progress Journal</Text>
      <Text style={styles.subtitle}>Detailed historical trends, personal records, and session logs.</Text>

      {isLoading ? (
        <ActivityIndicator color="#C4623B" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.stack}>
          {/* Time Range Switcher */}
          <View style={styles.rangeSelector}>
            {(['daily', 'weekly', 'monthly', 'all_time'] as ProgressRange[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.rangeButton, selectedRange === r && styles.rangeButtonActive]}
                onPress={() => setSelectedRange(r)}
              >
                <Text style={[styles.rangeButtonText, selectedRange === r && styles.rangeButtonTextActive]}>
                  {r.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Personal Bests Highlight Card */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: '#C4623B' }]}>Personal Bests</Text>
            <View style={styles.bestGrid}>
              <View style={styles.bestBox}>
                <Text style={styles.bestLabel}>Fluency</Text>
                <Text style={styles.bestValue}>{personalBests.fluency}</Text>
              </View>
              <View style={styles.bestBox}>
                <Text style={styles.bestLabel}>Grammar</Text>
                <Text style={styles.bestValue}>{personalBests.grammar}</Text>
              </View>
              <View style={styles.bestBox}>
                <Text style={styles.bestLabel}>Vocab</Text>
                <Text style={styles.bestValue}>{personalBests.vocabulary}</Text>
              </View>
              <View style={styles.bestBox}>
                <Text style={styles.bestLabel}>Observe</Text>
                <Text style={styles.bestValue}>{personalBests.observation}</Text>
              </View>
            </View>
          </View>

          {/* Current Rolling Averages */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Skill Rolling Averages</Text>
            <View style={styles.scoreGrid}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Fluency</Text>
                <Text style={styles.scoreValue}>{scores.fluency}</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Grammar</Text>
                <Text style={styles.scoreValue}>{scores.grammar}</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Vocabulary</Text>
                <Text style={styles.scoreValue}>{scores.vocabulary}</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Observation</Text>
                <Text style={styles.scoreValue}>{scores.observation}</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Expressive</Text>
                <Text style={styles.scoreValue}>{scores.expressiveness}</Text>
              </View>
            </View>
          </View>

          {/* Session History Log */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Practice Logs</Text>
            {recentSessions.length > 0 ? (
              recentSessions.map((s) => (
                <View key={s.id} style={styles.sessionItem}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionType}>{(s.sessionType ?? 'Session').replace('_', ' ')}</Text>
                    <Text style={styles.sessionDate}>
                      {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={styles.sessionText} numberOfLines={2}>
                    {s.feedback || 'Completed practice session.'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No practice logs recorded yet.</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 20 },
  stack: { gap: 16 },
  rangeSelector: { flexDirection: 'row', gap: 6, backgroundColor: '#FFFFFF', padding: 6, borderRadius: 16, elevation: 1 },
  rangeButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  rangeButtonActive: { backgroundColor: '#17324D' },
  rangeButtonText: { fontSize: 10, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  rangeButtonTextActive: { color: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 2 },
  cardTitle: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B7280', marginBottom: 14 },
  bestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bestBox: { width: '23%', backgroundColor: '#F7F3EB', borderRadius: 14, padding: 10, alignItems: 'center' },
  bestLabel: { fontSize: 9, color: '#C4623B', fontWeight: '700', textTransform: 'uppercase' },
  bestValue: { fontSize: 20, fontWeight: '800', color: '#17324D', marginTop: 2 },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scoreBox: { width: '47%', backgroundColor: '#F7F3EB', borderRadius: 16, padding: 12 },
  scoreLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase' },
  scoreValue: { fontSize: 24, fontWeight: '700', color: '#17324D', marginTop: 4 },
  sessionItem: { backgroundColor: '#F7F3EB', borderRadius: 16, padding: 12, marginBottom: 10 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sessionType: { fontSize: 11, fontWeight: '700', color: '#17324D', textTransform: 'uppercase' },
  sessionDate: { fontSize: 11, color: '#6B7280' },
  sessionText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  emptyText: { fontSize: 13, color: '#6B7280', fontStyle: 'italic' },
});
