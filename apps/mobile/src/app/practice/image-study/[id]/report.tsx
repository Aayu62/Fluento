'use client';

import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MobileImageStudyReportScreen() {
  const router = useRouter();

  const scores = {
    observation: 78,
    vocabulary: 75,
    grammar: 72,
    expressiveness: 68,
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>EVALUATION REPORT</Text>
      <Text style={styles.title}>Observation Report</Text>

      <View style={styles.stack}>
        {/* Scores */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Observation Scores</Text>
          <View style={styles.scoreGrid}>
            {Object.entries(scores).map(([k, v]) => (
              <View key={k} style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>{k}</Text>
                <Text style={styles.scoreValue}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Feedback</Text>
          <Text style={styles.bodyText}>
            You identified the main subjects well. Work on incorporating richer descriptive adjectives and noticing secondary background details.
          </Text>
        </View>

        {/* Strengths & Missed Details */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: '#5D8A6A' }]}>Key Strengths</Text>
          <Text style={styles.bulletText}>• Primary subjects correctly identified</Text>
          <Text style={styles.bulletText}>• Good overall sentence structure</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: '#C4623B' }]}>Missed Details</Text>
          <Text style={styles.bulletText}>• Include secondary spatial background details</Text>
          <Text style={styles.bulletText}>• Use more specific color/texture adjectives</Text>
        </View>

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
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D', marginBottom: 20 },
  stack: { gap: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 2 },
  cardTitle: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B7280', marginBottom: 12 },
  bodyText: { fontSize: 14, color: '#17324D', lineHeight: 20 },
  bulletText: { fontSize: 14, color: '#17324D', marginBottom: 6 },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scoreBox: { width: '47%', backgroundColor: '#F7F3EB', borderRadius: 16, padding: 12 },
  scoreLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase' },
  scoreValue: { fontSize: 24, fontWeight: '700', color: '#17324D', marginTop: 4 },
  doneButton: { backgroundColor: '#17324D', borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  doneButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
