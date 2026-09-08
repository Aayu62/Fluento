'use client';

import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import type { Topic, ThoughtExerciseMode } from '@fluento/shared';

export default function MobileThoughtExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [mode, setMode] = useState<ThoughtExerciseMode>('monologue');
  const [responseText, setResponseText] = useState('');
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(30);
  const [isPrepActive, setIsPrepActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get<Topic>(`/topics/${id}`)
      .then((res) => {
        if (mounted) setTopic(res.data);
      })
      .catch(() => {
        if (mounted) {
          setTopic({
            id: id ?? 'demo-topic-1',
            title: 'Remote Work vs In-Office Collaboration',
            category: 'professional',
            difficulty: 'intermediate',
            prompt: 'Should companies mandate in-person work, or is remote flexibility overall better for long-term productivity and employee well-being?',
          });
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  // 30-second preparation countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPrepActive && prepTimeLeft > 0) {
      timer = setInterval(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepTimeLeft === 0) {
      setIsPrepActive(false);
    }
    return () => clearInterval(timer);
  }, [isPrepActive, prepTimeLeft]);

  const handleSubmit = async () => {
    if (!responseText.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/topics/submit', {
        topicId: id,
        mode,
        responseText: responseText.trim(),
      });
      router.replace(`/practice/thought-exercise/${id}/report`);
    } catch {
      router.replace(`/practice/thought-exercise/${id}/report`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>THOUGHT EXERCISE SESSION</Text>
      <Text style={styles.title}>{topic?.title ?? 'Spontaneous Speech'}</Text>

      {isLoading ? (
        <ActivityIndicator color="#C4623B" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.stack}>
          {/* Prompt Card */}
          <View style={styles.promptCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.categoryBadge}>{topic?.category ?? 'Workplace'}</Text>
              <Text style={styles.modeBadge}>{mode.replace('_', ' ')} MODE</Text>
            </View>
            <Text style={styles.promptText}>&ldquo;{topic?.prompt}&rdquo;</Text>
          </View>

          {/* Mode Switcher */}
          <View style={styles.modeSelector}>
            {(['monologue', 'quick_thinking', 'debate'] as ThoughtExerciseMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modeButton, mode === m && styles.modeButtonActive]}
                onPress={() => {
                  setMode(m);
                  if (m === 'quick_thinking') {
                    setPrepTimeLeft(30);
                    setIsPrepActive(true);
                  } else {
                    setIsPrepActive(false);
                  }
                }}
              >
                <Text style={[styles.modeButtonText, mode === m && styles.modeButtonTextActive]}>
                  {m.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Thinking Countdown Banner */}
          {mode === 'quick_thinking' && (
            <View style={styles.prepCard}>
              <View>
                <Text style={styles.prepTitle}>Quick Thinking Prep</Text>
                <Text style={styles.prepText}>
                  {isPrepActive ? 'Formulate your thesis!' : 'Time up! Start speaking.'}
                </Text>
              </View>
              <Text style={styles.prepTimer}>00:{prepTimeLeft < 10 ? `0${prepTimeLeft}` : prepTimeLeft}</Text>
            </View>
          )}

          {/* Debate Mode Counterpoint Callout */}
          {mode === 'debate' && (
            <View style={styles.debateCard}>
              <Text style={styles.debateTitle}>Opposing Perspective</Text>
              <Text style={styles.debateText}>
                Critics argue in-person presence builds essential office social cohesion and mentorship.
              </Text>
            </View>
          )}

          {/* Response Input Form */}
          <View style={styles.inputCard}>
            <Text style={styles.cardLabel}>Your Speech Response</Text>
            <TextInput
              value={responseText}
              onChangeText={setResponseText}
              placeholder="Express your thesis and arguments here..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              style={styles.textArea}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting || !responseText.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Exercise →</Text>
              )}
            </TouchableOpacity>
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
  title: { fontSize: 28, fontWeight: '800', color: '#17324D', marginBottom: 16 },
  stack: { gap: 16 },
  promptCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 2 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  categoryBadge: { fontSize: 11, fontWeight: '700', color: '#C4623B', textTransform: 'uppercase' },
  modeBadge: { fontSize: 11, fontWeight: '700', color: '#17324D', textTransform: 'uppercase' },
  promptText: { fontSize: 18, fontWeight: '700', color: '#17324D', lineHeight: 26 },
  modeSelector: { flexDirection: 'row', gap: 8, backgroundColor: '#FFFFFF', padding: 6, borderRadius: 16 },
  modeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  modeButtonActive: { backgroundColor: '#17324D' },
  modeButtonText: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  modeButtonTextActive: { color: '#FFFFFF' },
  prepCard: { backgroundColor: '#C4623B', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prepTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  prepText: { color: '#FFFFFF', fontSize: 13, marginTop: 2, opacity: 0.9 },
  prepTimer: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  debateCard: { backgroundColor: '#5D8A6A', borderRadius: 20, padding: 16 },
  debateTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  debateText: { color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
  inputCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 },
  cardLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 },
  textArea: { backgroundColor: '#F7F3EB', borderRadius: 16, padding: 14, fontSize: 14, color: '#17324D', minHeight: 120, textAlignVertical: 'top', marginBottom: 16 },
  submitButton: { backgroundColor: '#C4623B', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
