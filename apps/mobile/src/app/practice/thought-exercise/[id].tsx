'use client';

import { useEffect, useState, useRef } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Topic, ThoughtExercisePreparation } from '@fluento/shared';

export default function MobileThoughtExerciseScreen() {
  const router = useRouter();
  const { id, preparation: initPrep } = useLocalSearchParams<{ id: string; preparation?: ThoughtExercisePreparation }>();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [preparation, setPreparation] = useState<ThoughtExercisePreparation>(initPrep ?? 'quick_thinking');
  
  const [phase, setPhase] = useState<'prep' | 'action'>('prep');
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(initPrep === 'research' ? 900 : 15);
  const [actionTimeLeft, setActionTimeLeft] = useState<number>(60);

  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTimer = async () => {
      try {
        const timerCached = await AsyncStorage.getItem(`timer_${id}`);
        if (timerCached && mounted) {
          const parsedTimer = JSON.parse(timerCached);
          setPhase(parsedTimer.phase);
          setPrepTimeLeft(parsedTimer.prepTimeLeft);
          setActionTimeLeft(parsedTimer.actionTimeLeft);
        }
      } catch {}
    };

    loadTimer();

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
            format: 'monologue',
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

  // Persist Timer State
  useEffect(() => {
    if (id) {
      AsyncStorage.setItem(`timer_${id}`, JSON.stringify({ phase, prepTimeLeft, actionTimeLeft })).catch(() => {});
    }
  }, [phase, prepTimeLeft, actionTimeLeft, id]);

  // Preparation Countdown Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (phase === 'prep' && prepTimeLeft > 0) {
      timer = setInterval(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'prep' && prepTimeLeft === 0) {
      setPhase('action');
    }
    return () => clearInterval(timer);
  }, [phase, prepTimeLeft]);

  // Action Countdown Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (phase === 'action' && actionTimeLeft > 0) {
      timer = setInterval(() => {
        setActionTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'action' && actionTimeLeft === 0 && !isSubmitting) {
      // Auto-submit when time is up
      handleFinalSubmit();
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, actionTimeLeft, isSubmitting]);

  const handleFinalSubmit = async () => {
    if (!responseText.trim() || !topic) return;

    setIsSubmitting(true);
    try {
      const { data: report } = await apiClient.post('/challenges/thought/submit', {
        topicId: id,
        mode: topic.format ?? 'monologue',
        responseText: responseText.trim(),
      });

      // Cache the report so the report screen can read it without an extra API call
      await AsyncStorage.setItem(`report_${id}`, JSON.stringify(report));

      // Clean up timer cache on successful submission
      await AsyncStorage.removeItem(`timer_${id}`);

      router.replace(`/practice/thought-exercise/${id}/report`);
    } catch (err: unknown) {
      // If the API fails (e.g. no network), store a flag so report shows an error state
      await AsyncStorage.setItem(
        `report_${id}`,
        JSON.stringify({ _error: true, _message: 'Evaluation unavailable — please try again.' }),
      );
      router.replace(`/practice/thought-exercise/${id}/report`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipPrep = () => {
    setPrepTimeLeft(0);
    setPhase('action');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
              <Text style={styles.categoryBadge}>{topic?.category ?? 'General'}</Text>
              <Text style={styles.modeBadge}>{topic?.format?.toUpperCase() ?? 'MONOLOGUE'} FORMAT</Text>
            </View>
            <Text style={styles.promptText}>&ldquo;{topic?.prompt}&rdquo;</Text>
          </View>

          {/* Preparation Phase Card */}
          {phase === 'prep' && (
            <View style={styles.prepCard}>
              <View style={styles.prepInfoCol}>
                <Text style={styles.prepTitle}>Preparation Phase</Text>
                <Text style={styles.prepText}>
                  {preparation === 'research' ? 'Research and structure your points.' : 'Quickly gather your thoughts!'}
                </Text>
              </View>
              <View style={styles.prepActionCol}>
                <Text style={styles.prepTimer}>{formatTime(prepTimeLeft)}</Text>
                <TouchableOpacity onPress={skipPrep} style={styles.skipButton}>
                  <Text style={styles.skipButtonText}>I'M READY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Speaking/Action Phase Card */}
          {phase === 'action' && (
            <View style={[styles.prepCard, { backgroundColor: 'rgba(196, 98, 59, 0.1)' }]}>
              <View style={styles.prepInfoCol}>
                <Text style={[styles.prepTitle, { color: '#C4623B' }]}>Speaking Phase Active!</Text>
                <Text style={[styles.prepText, { color: '#17324D' }]}>
                  You have exactly 1 minute to speak or type your response.
                </Text>
              </View>
              <View style={styles.prepActionCol}>
                <Text style={[styles.prepTimer, { color: '#C4623B' }]}>{formatTime(actionTimeLeft)}</Text>
              </View>
            </View>
          )}

          {/* Debate Mode Counterpoint Callout */}
          {topic?.format === 'debate' && (
            <View style={styles.debateCard}>
              <Text style={styles.debateTitle}>Debate Format Reminder</Text>
              <Text style={styles.debateText}>
                You are arguing the assigned perspective in the prompt. Make sure to structure your argument persuasively and address potential counter-points!
              </Text>
            </View>
          )}

          {/* Response Input Form */}
          <View style={[styles.inputCard, phase === 'prep' && { opacity: 0.5 }]}>
            <Text style={styles.cardLabel}>Your Speech Response</Text>
            <TextInput
              value={responseText}
              onChangeText={setResponseText}
              editable={phase === 'action'}
              placeholder="Express your thesis and arguments here..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              style={styles.textArea}
            />

            <TouchableOpacity
              style={[styles.submitButton, (isSubmitting || !responseText.trim() || phase === 'prep') && { opacity: 0.5 }]}
              onPress={handleFinalSubmit}
              disabled={isSubmitting || !responseText.trim() || phase === 'prep'}
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
  content: { padding: 24 },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#17324D', marginBottom: 16 },
  stack: { gap: 16 },
  promptCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 2 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  categoryBadge: { fontSize: 11, fontWeight: '700', color: '#C4623B', textTransform: 'uppercase' },
  modeBadge: { fontSize: 11, fontWeight: '700', color: '#17324D', textTransform: 'uppercase' },
  promptText: { fontSize: 18, fontWeight: '700', color: '#17324D', lineHeight: 26 },
  prepCard: { backgroundColor: '#17324D', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prepInfoCol: { flex: 1, paddingRight: 10 },
  prepActionCol: { alignItems: 'flex-end' },
  prepTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  prepText: { color: '#FFFFFF', fontSize: 13, marginTop: 4, opacity: 0.9 },
  prepTimer: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  skipButton: { marginTop: 8 },
  skipButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textDecorationLine: 'underline', opacity: 0.8 },
  debateCard: { backgroundColor: 'rgba(93, 138, 106, 0.1)', borderColor: 'rgba(93, 138, 106, 0.4)', borderWidth: 1, borderRadius: 20, padding: 16 },
  debateTitle: { color: '#5D8A6A', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  debateText: { color: 'rgba(23, 50, 77, 0.7)', fontSize: 13, lineHeight: 18 },
  inputCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 },
  cardLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 },
  textArea: { backgroundColor: '#F7F3EB', borderRadius: 16, padding: 14, fontSize: 14, color: '#17324D', minHeight: 120, textAlignVertical: 'top', marginBottom: 16 },
  submitButton: { backgroundColor: '#C4623B', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
