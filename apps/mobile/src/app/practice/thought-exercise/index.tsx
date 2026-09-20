import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TopicCategory, ThoughtExercisePreparation, ThoughtExerciseFormat } from '@fluento/shared';

export default function ThoughtExerciseHubScreen() {
  const router = useRouter();
  const [selectedPreparation, setSelectedPreparation] = useState<ThoughtExercisePreparation>('quick_thinking');
  const [selectedFormat, setSelectedFormat] = useState<ThoughtExerciseFormat | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | 'all'>('all');
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [loadingText, setLoadingText] = useState('SELECTING...');

  useEffect(() => {
    if (!isLoadingRandom) {
      setLoadingText('SELECTING...');
      return;
    }
    const words = ['SELECTING...', 'GENERATING..', 'PREPARING...'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % words.length;
      setLoadingText(words[i]!);
    }, 400);
    return () => clearInterval(interval);
  }, [isLoadingRandom]);

  const handleStartRandom = async () => {
    setIsLoadingRandom(true);
    try {
      const catParam = selectedCategory !== 'all' ? `category=${selectedCategory}` : '';
      const formatParam = selectedFormat !== 'all' ? `format=${selectedFormat}` : '';
      const prepParam = `preparation=${selectedPreparation}`;
      
      const queryParams = [catParam, formatParam, prepParam].filter(Boolean).join('&');

      const { data } = await apiClient.get<{ topic?: { id?: string } }>(`/topics/random?${queryParams}`);
      if (data?.topic?.id) {
        AsyncStorage.removeItem(`timer_${data.topic.id}`).catch(() => {});
        router.push({ pathname: '/practice/thought-exercise/[id]', params: { id: data.topic.id, preparation: selectedPreparation } });
      } else {
        router.push({ pathname: '/practice/thought-exercise/[id]', params: { id: 'demo-topic-1', preparation: selectedPreparation } });
      }
    } catch {
      router.push({ pathname: '/practice/thought-exercise/[id]', params: { id: 'demo-topic-1', preparation: selectedPreparation } });
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleChooseTopic = () => {
    router.push({
      pathname: '/practice/thought-exercise/choose' as any,
      params: {
        category: selectedCategory,
        format: selectedFormat,
        preparation: selectedPreparation,
      },
    });
  };

  const categories: { id: TopicCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Topics' },
    { id: 'personal', label: 'Personal' },
    { id: 'professional', label: 'Professional' },
    { id: 'opinion', label: 'Opinion' },
    { id: 'technology', label: 'Technology' },
    { id: 'current_affairs', label: 'Current Affairs' },
    { id: 'history', label: 'History' },
    { id: 'miscellaneous', label: 'Misc' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Thought Exercises',
          headerBackTitle: 'Practice',
          headerStyle: { backgroundColor: '#F7F3EB' },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>PART III — THOUGHT EXERCISES</Text>
          <Text style={styles.title}>Speaking Topic Challenges</Text>
        </View>

        {/* 1. Preparation Type */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>1. Choose Preparation Type</Text>
          <View style={styles.prepRow}>
            <TouchableOpacity
              style={[styles.prepCard, selectedPreparation === 'quick_thinking' && styles.prepCardActive]}
              onPress={() => setSelectedPreparation('quick_thinking')}
            >
              <Text style={styles.prepIcon}>⚡</Text>
              <Text style={[styles.prepTitleText, selectedPreparation === 'quick_thinking' && styles.prepTextActive]}>Quick Thinking</Text>
              <Text style={[styles.prepSubText, selectedPreparation === 'quick_thinking' && styles.prepSubTextActive]}>15s prep. 1m speak.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.prepCard, selectedPreparation === 'research' && styles.prepCardActive]}
              onPress={() => setSelectedPreparation('research')}
            >
              <Text style={styles.prepIcon}>📚</Text>
              <Text style={[styles.prepTitleText, selectedPreparation === 'research' && styles.prepTextActive]}>Research Mode</Text>
              <Text style={[styles.prepSubText, selectedPreparation === 'research' && styles.prepSubTextActive]}>15m prep. 1m speak.</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>2. Select Topic & Format</Text>
          
          <Text style={styles.filterLabel}>FORMAT:</Text>
          <View style={styles.filtersWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
              {(
                [
                  { id: 'all', label: 'All Formats' },
                  { id: 'monologue', label: 'Monologue' },
                  { id: 'debate', label: 'Debate' },
                ] as const
              ).map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterPill, selectedFormat === f.id && styles.filterPillActive]}
                  onPress={() => setSelectedFormat(f.id as ThoughtExerciseFormat | 'all')}
                >
                  <Text style={[styles.filterText, selectedFormat === f.id && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.filterLabel}>CATEGORY:</Text>
          <View style={styles.filtersWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterPill, selectedCategory === cat.id && styles.filterPillActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.filterText, selectedCategory === cat.id && styles.filterTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.randomButton}
            onPress={handleStartRandom}
            disabled={isLoadingRandom}
          >
            {isLoadingRandom ? (
              <Text style={styles.randomButtonText}>{loadingText}</Text>
            ) : (
              <Text style={styles.randomButtonText}>⚡ Random Topic Challenge</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chooseButton}
            onPress={handleChooseTopic}
          >
            <Text style={styles.chooseButtonText}>🔍 Choose Topic</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EB',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Courier',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(23, 50, 77, 0.6)',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: 'rgba(23, 50, 77, 0.7)',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionsContainer: {
    paddingHorizontal: 32,
    marginTop: 16,
    gap: 12,
  },
  randomButton: {
    backgroundColor: '#C4623B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  randomButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
  chooseButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#17324D',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  chooseButtonText: {
    color: '#17324D',
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Courier',
    fontSize: 16,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  prepRow: {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 32,
  },
  prepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(23, 50, 77, 0.1)',
  },
  prepCardActive: {
    backgroundColor: 'rgba(196, 98, 59, 0.1)',
    borderColor: '#C4623B',
  },
  prepIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  prepTitleText: {
    fontFamily: 'Courier',
    fontSize: 14,
    fontWeight: '700',
    color: '#17324D',
    textTransform: 'uppercase',
  },
  prepTextActive: {
    color: '#17324D',
  },
  prepSubText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: 'rgba(23, 50, 77, 0.6)',
    marginTop: 4,
  },
  prepSubTextActive: {
    color: 'rgba(23, 50, 77, 0.8)',
  },
  filterLabel: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(23, 50, 77, 0.5)',
    paddingHorizontal: 32,
    marginBottom: 8,
    marginTop: 8,
  },
  filtersWrapper: {
    marginBottom: 12,
  },
  filtersContainer: {
    paddingHorizontal: 32,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(23, 50, 77, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(23, 50, 77, 0.1)',
  },
  filterPillActive: {
    backgroundColor: '#17324D',
    borderColor: '#17324D',
  },
  filterText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#17324D',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 32,
    gap: 16,
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(23, 50, 77, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardCategory: {
    fontFamily: 'Courier',
    fontSize: 11,
    fontWeight: '600',
    color: '#17324D',
    letterSpacing: 1,
  },
  cardDifficulty: {
    fontSize: 11,
    color: 'rgba(23, 50, 77, 0.5)',
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 8,
  },
  cardPrompt: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: 'rgba(23, 50, 77, 0.7)',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Courier',
    color: 'rgba(23, 50, 77, 0.5)',
    marginTop: 32,
  },
});
