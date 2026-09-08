'use client';

import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MobileThoughtExerciseReportScreen() {
  const router = useRouter();

  const scores = {
    fluency: 82,
    grammar: 76,
    vocabulary: 80,
    argumentStrength: 75,
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>THOUGHT EXERCISE REPORT</Text>
      <Text style={styles.title}>Performance Report</Text>

      <View style={styles.stack}>
        {/* Scores */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evaluation Scores</Text>
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
              <Text style={styles.scoreLabel}>Argument</Text>
              <Text style={styles.scoreValue}>{scores.argumentStrength}</Text>
            </View>
          </View>
        </View>

        {/* AI Feedback */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Speech Coach Feedback</Text>
          <Text style={styles.bodyText}>
            Great spontaneity! Your arguments flowed naturally. Focus on avoiding hesitation fillers and strengthening your conclusion with precise vocabulary.
          </Text>
        </View>

        {/* Strengths & Improvements */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: '#5D8A6A' }]}>Key Strengths</Text>
          <Text style={styles.bulletText}>• Strong opening stance</Text>
          <Text style={styles.bulletText}>• Consistent pacing throughout speech</Text>
          <Text style={styles.bulletText}>• Clear logical structure</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: '#C4623B' }]}>Recommended Improvements</Text>
          <Text style={styles.bulletText}>• Reduce verbal pause fillers (&quot;um&quot;, &quot;like&quot;)</Text>
          <Text style={styles.bulletText}>• Incorporate more sophisticated discourse markers</Text>
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
