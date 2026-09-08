'use client';

import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import type { SessionReport } from '@fluento/shared';

export default function MobileCallReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [report, setReport] = useState<SessionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get<SessionReport>(`/calls/${id}/report`)
      .then((res) => {
        if (mounted) setReport(res.data);
      })
      .catch(() => {
        // Catch
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const scores = report?.scoreJson ?? {};

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>POST-CALL EVALUATION</Text>
      <Text style={styles.title}>Session Report</Text>
      <Text style={styles.subtitle}>AI feedback & performance breakdown from your call.</Text>

      {isLoading ? (
        <ActivityIndicator color="#C4623B" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.stack}>
          {/* Scores */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Evaluation Scores</Text>
            <View style={styles.scoreGrid}>
              {Object.entries(scores).map(([k, v]) => (
                <View key={k} style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>{k}</Text>
                  <Text style={styles.scoreValue}>{typeof v === 'number' ? v : 70}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Feedback */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Coach Summary</Text>
            <Text style={styles.bodyText}>
              {report?.feedback || 'Your conversation showed active listening and solid structure.'}
            </Text>
          </View>

          {/* Strengths & Growth */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: '#5D8A6A' }]}>Key Strengths</Text>
            {(report?.strengths ?? ['Natural flow', 'Good engagement']).map((s, i) => (
              <Text key={i} style={styles.bulletText}>
                • {s}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: '#C4623B' }]}>Areas for Growth</Text>
            {(report?.improvements ?? ['Reduce filler words', 'Expand vocabulary']).map((imp, i) => (
              <Text key={i} style={styles.bulletText}>
                • {imp}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.replace('/(tabs)/calls')}
          >
            <Text style={styles.doneButtonText}>Back to Calls</Text>
          </TouchableOpacity>
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
  subtitle: { fontSize: 14, color: '#4B5563', marginBottom: 20 },
  stack: { gap: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 2 },
  cardTitle: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B7280', marginBottom: 12 },
  bodyText: { fontSize: 15, color: '#17324D', lineHeight: 22 },
  bulletText: { fontSize: 14, color: '#17324D', marginBottom: 6 },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scoreBox: { width: '47%', backgroundColor: '#F7F3EB', borderRadius: 16, padding: 12 },
  scoreLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase' },
  scoreValue: { fontSize: 24, fontWeight: '700', color: '#17324D', marginTop: 4 },
  doneButton: { backgroundColor: '#17324D', borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  doneButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
