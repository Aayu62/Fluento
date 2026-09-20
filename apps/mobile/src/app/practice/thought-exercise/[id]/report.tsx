'use client';

import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EvaluationReport {
  scoreJson?: {
    fluency?: number;
    grammar?: number;
    vocabulary?: number;
    argumentStrength?: number;
    argument?: number;
    clarity?: number;
  };
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  _error?: boolean;
  _message?: string;
}

function ScoreRing({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? '#5D8A6A' : value >= 60 ? '#C4623B' : '#E05A47';
  return (
    <View style={styles.scoreBox}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, { color }]}>{value}</Text>
      <Text style={styles.scoreMax}>/100</Text>
    </View>
  );
}

export default function MobileThoughtExerciseReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = await AsyncStorage.getItem(`report_${id}`);
        if (cached) {
          setReport(JSON.parse(cached));
        }
      } catch {
        setReport({ _error: true, _message: 'Could not load report data.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const scores = report?.scoreJson;
  const fluency = scores?.fluency ?? 0;
  const grammar = scores?.grammar ?? 0;
  const vocabulary = scores?.vocabulary ?? 0;
  const argument = scores?.argumentStrength ?? scores?.argument ?? 0;
  const strengths = report?.strengths ?? [];
  const improvements = report?.improvements ?? [];
  const feedback = report?.feedback ?? '';

  if (loading) {
    return (
      <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#C4623B" />
        <Text style={{ marginTop: 12, color: '#17324D', fontSize: 14 }}>Analysing your response...</Text>
      </View>
    );
  }

  if (report?._error) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>THOUGHT EXERCISE REPORT</Text>
        <Text style={styles.title}>Report Unavailable</Text>
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: '#C4623B' }]}>Something went wrong</Text>
          <Text style={styles.bodyText}>{report._message ?? 'Please try again.'}</Text>
        </View>
        <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/(tabs)/practice')}>
          <Text style={styles.doneButtonText}>Back to Practice</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>THOUGHT EXERCISE REPORT</Text>
      <Text style={styles.title}>Performance Report</Text>

      <View style={styles.stack}>
        {/* Scores */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evaluation Scores</Text>
          <View style={styles.scoreGrid}>
            <ScoreRing label="Fluency" value={fluency} />
            <ScoreRing label="Grammar" value={grammar} />
            <ScoreRing label="Vocabulary" value={vocabulary} />
            <ScoreRing label="Argument" value={argument} />
          </View>
        </View>

        {/* AI Feedback */}
        {!!feedback && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Speech Coach Feedback</Text>
            <Text style={styles.bodyText}>{feedback}</Text>
          </View>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: '#5D8A6A' }]}>Key Strengths</Text>
            {strengths.map((s, i) => (
              <Text key={i} style={styles.bulletText}>• {s}</Text>
            ))}
          </View>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: '#C4623B' }]}>Recommended Improvements</Text>
            {improvements.map((s, i) => (
              <Text key={i} style={styles.bulletText}>• {s}</Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.replace('/(tabs)/practice')}
        >
          <Text style={styles.doneButtonText}>Back to Practice</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: { padding: 24 },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D', marginBottom: 20 },
  stack: { gap: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 2 },
  cardTitle: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B7280', marginBottom: 12 },
  bodyText: { fontSize: 14, color: '#17324D', lineHeight: 22 },
  bulletText: { fontSize: 14, color: '#17324D', marginBottom: 6, lineHeight: 20 },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scoreBox: { width: '47%', backgroundColor: '#F7F3EB', borderRadius: 16, padding: 12 },
  scoreLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase' },
  scoreValue: { fontSize: 28, fontWeight: '800', color: '#17324D', marginTop: 4 },
  scoreMax: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  doneButton: { backgroundColor: '#17324D', borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  doneButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
