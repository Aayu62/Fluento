import { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Topic, TopicCategory, ThoughtExercisePreparation, ThoughtExerciseFormat } from '@fluento/shared';

export default function ChooseTopicScreen() {
  const router = useRouter();
  const { category, format, preparation } = useLocalSearchParams<{
    category?: TopicCategory | 'all';
    format?: ThoughtExerciseFormat | 'all';
    preparation?: ThoughtExercisePreparation;
  }>();

  const selectedCategory = category ?? 'all';
  const selectedFormat = format ?? 'all';
  const selectedPreparation = preparation ?? 'quick_thinking';

  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchTopics() {
      try {
        const { data } = await apiClient.get<Topic[]>('/topics');
        if (mounted && data) {
          setTopics(data);
        }
      } catch (err) {
        console.error('Failed to fetch topics', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchTopics();
    return () => { mounted = false; };
  }, []);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchFormat = selectedFormat === 'all' || t.format === selectedFormat;
      return matchCategory && matchFormat;
    });
  }, [topics, selectedCategory, selectedFormat]);

  const handleStartTopic = (topic: Topic) => {
    AsyncStorage.removeItem(`timer_${topic.id}`).catch(() => {});
    router.push({ pathname: '/practice/thought-exercise/[id]', params: { id: topic.id, preparation: selectedPreparation } });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Choose a Topic',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#F7F3EB' },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>PREP: {selectedPreparation.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>CAT: {selectedCategory.toUpperCase()}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>FMT: {selectedFormat.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.listContainer}>
          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#17324D" />
          ) : filteredTopics.length === 0 ? (
            <Text style={styles.emptyText}>No topics found matching your criteria.</Text>
          ) : (
            filteredTopics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => handleStartTopic(topic)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardCategoryBadge}>
                    <Text style={styles.cardCategory}>{topic.category.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.cardDifficulty}>{topic.difficulty}</Text>
                </View>
                <Text style={styles.cardTitle}>{topic.title}</Text>
                <Text style={styles.cardPrompt} numberOfLines={3}>
                  {topic.prompt}
                </Text>
                <View style={styles.cardAction}>
                  <Text style={styles.cardActionText}>START EXERCISE →</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(23, 50, 77, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: '#17324D',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyText: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: 'rgba(23, 50, 77, 0.6)',
    textAlign: 'center',
    marginTop: 40,
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D0C0',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardCategoryBadge: {
    backgroundColor: '#F2EBDD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardCategory: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#17324D',
  },
  cardDifficulty: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#C4623B',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 8,
  },
  cardPrompt: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: 'rgba(23, 50, 77, 0.8)',
    lineHeight: 18,
  },
  cardAction: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(216, 208, 192, 0.5)',
    paddingTop: 12,
    alignItems: 'center',
  },
  cardActionText: {
    fontFamily: 'Courier',
    fontSize: 12,
    fontWeight: '700',
    color: '#17324D',
  },
});
