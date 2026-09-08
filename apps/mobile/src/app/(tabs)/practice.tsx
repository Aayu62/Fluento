'use client';

import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import type { ImageChallenge } from '@fluento/shared';

export default function PracticeTabScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingThought, setIsLoadingThought] = useState(false);

  const handleStartImageStudy = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<ImageChallenge>('/challenges/image');
      if (data?.image?.id) {
        router.push(`/practice/image-study/${data.image.id}`);
      } else {
        router.push('/practice/image-study/demo-img-1');
      }
    } catch {
      router.push('/practice/image-study/demo-img-1');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartThoughtExercise = async () => {
    setIsLoadingThought(true);
    try {
      const { data } = await apiClient.get<{ topic?: { id?: string } }>('/topics/random');
      if (data?.topic?.id) {
        router.push(`/practice/thought-exercise/${data.topic.id}`);
      } else {
        router.push('/practice/thought-exercise/demo-topic-1');
      }
    } catch {
      router.push('/practice/thought-exercise/demo-topic-1');
    } finally {
      setIsLoadingThought(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>PART II — EXERCISES</Text>
      <Text style={styles.title}>Practice Hub</Text>
      <Text style={styles.subtitle}>Structured observation challenges & spontaneous speaking exercises.</Text>

      {/* Image Studies Feature Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>FEATURED</Text>
          <Text style={styles.diffBadge}>All Levels</Text>
        </View>

        <Text style={styles.cardTitle}>Image Description Challenge</Text>
        <Text style={styles.cardText}>
          Describe visual scenes under structured constraints (Forbidden Words, Emotion Mode, or Perspective Mode).
        </Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartImageStudy}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>Start Image Study →</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Thought Exercises Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, { backgroundColor: '#17324D' }]}>NEW</Text>
          <Text style={styles.diffBadge}>All Levels</Text>
        </View>

        <Text style={styles.cardTitle}>Thought Exercises</Text>
        <Text style={styles.cardText}>
          Spontaneous topic monologues, 30-second quick thinking, and debate challenges.
        </Text>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: '#17324D' }]}
          onPress={handleStartThoughtExercise}
          disabled={isLoadingThought}
        >
          {isLoadingThought ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>Start Thought Exercise →</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 2 },
  cardOutline: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#D8D0C0' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  badge: { backgroundColor: '#C4623B', color: '#FFFFFF', fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  diffBadge: { color: '#6B7280', fontSize: 11 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#17324D', marginBottom: 6 },
  cardText: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 16 },
  comingSoon: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
  startButton: { backgroundColor: '#C4623B', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  startButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
});
