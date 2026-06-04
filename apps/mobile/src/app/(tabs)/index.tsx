'use client';

import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { apiClient } from '@/lib/api/client';
import type { DashboardData, ImageChallenge, ThoughtExercise } from '@fluento/shared';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    apiClient
      .get<DashboardData>('/progress/dashboard')
      .then((response) => {
        if (mounted) {
          setDashboard(response.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError('Unable to load dashboard.');
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const recommendation = dashboard?.recommendedChallenge as ImageChallenge | ThoughtExercise | null;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}> 
      <Text style={styles.sectionLabel}>COMMUNICATION JOURNAL</Text>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Your progress, streaks, upcoming sessions, and next practice item.</Text>

      {isLoading ? (
        <View style={styles.statusCard}>
          <ActivityIndicator size="large" color="#C4623B" />
          <Text style={styles.statusText}>Loading dashboard…</Text>
        </View>
      ) : error ? (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Unable to load dashboard</Text>
          <Text style={styles.statusText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Current streak</Text>
            <Text style={styles.cardValue}>{dashboard?.streak.currentStreak ?? 0} days</Text>
            <Text style={styles.cardMeta}>Best: {dashboard?.streak.bestStreak ?? 0}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Upcoming session</Text>
            {dashboard?.upcomingCall ? (
              <>
                <Text style={styles.cardValue}>{dashboard.upcomingCall.scenario?.title ?? 'AI call session'}</Text>
                <Text style={styles.cardMeta}>{dashboard.upcomingCall.scenario?.personaName ?? 'Conversation partner'}</Text>
                <Text style={styles.cardMeta}>{formatDate(dashboard.upcomingCall.scheduledTime)}</Text>
              </>
            ) : (
              <Text style={styles.cardText}>No scheduled sessions yet.</Text>
            )}
          </View>

          <View style={styles.cardWide}>
            <Text style={styles.cardLabel}>Communication scores</Text>
            <View style={styles.scoreGrid}>
              {dashboard ? (
                Object.entries(dashboard.scores)
                  .filter(([key]) => key !== 'id' && key !== 'userId' && key !== 'updatedAt')
                  .map(([key, value]) => (
                    <View key={key} style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>{key}</Text>
                      <Text style={styles.scoreValue}>{value}</Text>
                    </View>
                  ))
              ) : null}
            </View>
          </View>

          <View style={styles.cardWide}>
            <Text style={styles.cardLabel}>Recommended next challenge</Text>
            {recommendation ? (
              <>
                <Text style={styles.cardValue}>{'image' in recommendation ? 'Image description challenge' : recommendation.topic.title}</Text>
                <Text style={styles.cardText}>{'image' in recommendation ? 'Describe the scene with clarity and detail.' : recommendation.topic.prompt}</Text>
              </>
            ) : (
              <Text style={styles.cardText}>A recommendation will appear when your weakest skill is analyzed.</Text>
            )}
          </View>

          <View style={styles.cardWide}>
            <Text style={styles.cardLabel}>Recent activity</Text>
            {dashboard?.recentSessions.length ? (
              dashboard.recentSessions.slice(0, 5).map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <Text style={styles.sessionTitle}>{session.sessionType ?? 'Practice session'}</Text>
                  <Text style={styles.sessionMeta}>{formatDate(session.createdAt)}</Text>
                  <Text style={styles.sessionText}>{session.feedback || 'No feedback recorded.'}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.cardText}>No recent sessions yet.</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F7F3EB',
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#17324D',
    opacity: 0.7,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#17324D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  cardWide: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  cardText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreItem: {
    width: '48%',
    backgroundColor: '#F7F3EB',
    borderRadius: 24,
    padding: 14,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#17324D',
  },
  sessionItem: {
    backgroundColor: '#F7F3EB',
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 4,
  },
  sessionMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
