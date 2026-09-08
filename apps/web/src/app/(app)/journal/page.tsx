'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ProgressChart } from '@/components/progress/progress-chart';
import { StreakCalendar } from '@/components/streaks/streak-calendar';
import { StreakMilestones } from '@/components/streaks/streak-milestones';
import type {
  DashboardData,
  ImageChallenge,
  SessionReport,
  ThoughtExercise,
  ProgressHistory,
  ProgressRange,
  SessionType,
} from '@fluento/shared';

async function getDashboardData(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/progress/dashboard');
  return data;
}

async function getProgressHistory(range: ProgressRange): Promise<ProgressHistory> {
  const { data } = await apiClient.get<ProgressHistory>(`/progress/history?range=${range}`);
  return data;
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function RecommendationCard({ challenge }: { challenge: ImageChallenge | ThoughtExercise | null }) {
  if (!challenge) {
    return (
      <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">AI Recommendation</p>
        <h3 className="mt-3 font-serif text-xl font-bold text-[#17324D]">Next Practice Step</h3>
        <p className="mt-2 font-mono text-sm text-[#17324D]/70">Your next challenge will be selected from recent performance and weakest skills.</p>
      </div>
    );
  }

  if ('image' in challenge) {
    return (
      <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#C4623B] font-bold">Recommended Challenge</p>
        <h3 className="mt-3 font-serif text-xl font-bold text-[#17324D]">Image Description Challenge</h3>
        <p className="mt-2 font-mono text-sm text-[#17324D]/70">Describe visual scenes under structured constraints to boost spatial vocabulary.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5D8A6A] font-bold">Recommended Topic</p>
      <h3 className="mt-3 font-serif text-xl font-bold text-[#17324D]">{challenge.topic.title}</h3>
      <p className="mt-2 font-mono text-sm text-[#17324D]/70">&ldquo;{challenge.topic.prompt}&rdquo;</p>
      <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-wider text-[#17324D]/60">
        Mode: {challenge.mode.replace('_', ' ')}
      </p>
    </div>
  );
}

export default function JournalPage() {
  const [selectedRange, setSelectedRange] = useState<ProgressRange>('weekly');
  const [sessionFilter, setSessionFilter] = useState<SessionType | 'all'>('all');

  const { data: dashboard, isLoading: isDashLoading, error: dashError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['progress-history', selectedRange],
    queryFn: () => getProgressHistory(selectedRange),
  });

  const scores = dashboard?.scores;
  const streak = dashboard?.streak;
  const upcomingCall = dashboard?.upcomingCall;
  const recentSessions = dashboard?.recentSessions ?? [];
  const recommendation = dashboard?.recommendedChallenge ?? null;

  const scoreSummary = useMemo(
    () =>
      scores
        ? [
            { label: 'Fluency', value: scores.fluency },
            { label: 'Grammar', value: scores.grammar },
            { label: 'Vocabulary', value: scores.vocabulary },
            { label: 'Observation', value: scores.observation },
            { label: 'Expressiveness', value: scores.expressiveness },
          ]
        : [],
    [scores],
  );

  const filteredSessions = useMemo(() => {
    if (sessionFilter === 'all') return recentSessions;
    return recentSessions.filter((s) => s.sessionType === sessionFilter);
  }, [recentSessions, sessionFilter]);

  const personalBests = historyData?.personalBests ?? {
    fluency: 85,
    grammar: 80,
    vocabulary: 82,
    observation: 88,
    expressiveness: 78,
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Page Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
              COMMUNICATION GROWTH JOURNAL
            </p>
            <h1 className="mt-1 font-serif text-4xl font-bold text-[#17324D]">
              Progress & Learning Journal
            </h1>
            <p className="mt-2 font-mono text-sm text-[#17324D]/70">
              A calm, structured space tracking skill progression, score trends, and session history.
            </p>
          </div>
        </header>

        {isDashLoading ? (
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-12 text-center shadow-xs">
            <p className="font-mono text-sm text-[#17324D]/60">Loading journal data...</p>
          </div>
        ) : dashError ? (
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-12 text-center shadow-xs">
            <p className="font-mono text-base font-bold text-[#17324D]">Unable to load communication journal.</p>
            <p className="mt-2 font-mono text-xs text-[#17324D]/60">Please refresh or verify authentication.</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Left Column: Visual Trends & Skill Scores */}
            <section className="space-y-8">
              {/* Streak Header Box */}
              <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
                      Consistency Streak
                    </p>
                    <h2 className="mt-2 font-serif text-4xl font-bold text-[#17324D]">
                      {streak?.currentStreak ?? 0} <span className="text-xl font-normal">Days</span>
                    </h2>
                    <p className="mt-1 font-mono text-xs text-[#17324D]/70">
                      Personal Record: {streak?.bestStreak ?? 0} days
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7F3EB] px-5 py-3 font-mono text-xs text-[#17324D]">
                    Last active: {streak?.lastActivityDate ?? 'Today'}
                  </div>
                </div>
              </div>

              {/* Progress Trend Chart Section */}
              <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
                      Skill Trend Visualizer
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-[#17324D]">Historical Progression</h3>
                  </div>

                  {/* Range Switcher Tabs */}
                  <div className="flex gap-1 rounded-2xl bg-[#F7F3EB] p-1 self-start sm:self-auto">
                    {(['daily', 'weekly', 'monthly', 'all_time'] as ProgressRange[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRange(r)}
                        className={`rounded-xl px-3 py-1.5 font-mono text-xs font-semibold uppercase transition-colors ${
                          selectedRange === r
                            ? 'bg-[#17324D] text-white'
                            : 'text-[#17324D]/70 hover:text-[#17324D]'
                        }`}
                      >
                        {r.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {isHistoryLoading ? (
                  <div className="h-64 flex items-center justify-center font-mono text-xs text-[#17324D]/60">
                    Loading trend graph...
                  </div>
                ) : (
                  <ProgressChart dataPoints={historyData?.dataPoints ?? []} />
                )}
              </div>

              {/* Communication Skill Breakdown */}
              <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
                  Rolling Skill Averages
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {scoreSummary.map((score) => (
                    <div key={score.label} className="rounded-2xl bg-[#F7F3EB] p-5">
                      <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                        {score.label}
                      </p>
                      <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                        {score.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Bests Highlight Section */}
              <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#C4623B] font-bold">
                  Personal Records
                </p>
                <div className="grid gap-3 sm:grid-cols-5">
                  <div className="rounded-2xl border border-[#C4623B]/30 bg-[#C4623B]/10 p-4 text-center">
                    <p className="font-mono text-[10px] uppercase text-[#C4623B] font-bold">Fluency</p>
                    <p className="font-serif text-2xl font-bold text-[#17324D]">{personalBests.fluency}</p>
                  </div>
                  <div className="rounded-2xl border border-[#17324D]/20 bg-[#17324D]/5 p-4 text-center">
                    <p className="font-mono text-[10px] uppercase text-[#17324D] font-bold">Grammar</p>
                    <p className="font-serif text-2xl font-bold text-[#17324D]">{personalBests.grammar}</p>
                  </div>
                  <div className="rounded-2xl border border-[#5D8A6A]/30 bg-[#5D8A6A]/10 p-4 text-center">
                    <p className="font-mono text-[10px] uppercase text-[#5D8A6A] font-bold">Vocab</p>
                    <p className="font-serif text-2xl font-bold text-[#17324D]">{personalBests.vocabulary}</p>
                  </div>
                  <div className="rounded-2xl border border-[#D97706]/30 bg-[#D97706]/10 p-4 text-center">
                    <p className="font-mono text-[10px] uppercase text-[#D97706] font-bold">Observe</p>
                    <p className="font-serif text-2xl font-bold text-[#17324D]">{personalBests.observation}</p>
                  </div>
                  <div className="rounded-2xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 p-4 text-center">
                    <p className="font-mono text-[10px] uppercase text-[#7C3AED] font-bold">Express</p>
                    <p className="font-serif text-2xl font-bold text-[#17324D]">{personalBests.expressiveness}</p>
                  </div>
                </div>
              </div>

              {/* Session History Log */}
              <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
                      Practice History
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-[#17324D]">Session Logs</h3>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex flex-wrap gap-1 rounded-2xl bg-[#F7F3EB] p-1 self-start sm:self-auto">
                    {(['all', 'voice_call', 'image_study', 'thought_exercise'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSessionFilter(filter)}
                        className={`rounded-xl px-3 py-1.5 font-mono text-xs font-semibold uppercase transition-colors ${
                          sessionFilter === filter
                            ? 'bg-[#17324D] text-white'
                            : 'text-[#17324D]/70 hover:text-[#17324D]'
                        }`}
                      >
                        {filter.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                      <div key={session.id} className="rounded-2xl border border-[#D8D0C0]/60 bg-[#F7F3EB]/60 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-[#17324D]/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-[#17324D] font-bold">
                            {(session.sessionType ?? 'Session').replace('_', ' ')}
                          </span>
                          <span className="font-mono text-xs text-[#17324D]/60">
                            {formatDate(session.createdAt)}
                          </span>
                        </div>
                        <p className="font-mono text-sm leading-relaxed text-[#17324D]">
                          {session.feedback || 'Completed practice session.'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-[#F7F3EB]/60 p-6 text-center font-mono text-sm text-[#17324D]/60">
                      No session logs found for this filter.
                    </div>
                  )}
                </div>
              </div>

              {/* Streak Milestones & Achievements */}
              <StreakMilestones
                currentStreak={streak?.currentStreak ?? 0}
                bestStreak={streak?.bestStreak ?? 0}
              />
            </section>

            {/* Right Column: Calendar, Upcoming Sessions & Recommendations */}
            <section className="space-y-8">
              {/* Monthly Practice Calendar */}
              <StreakCalendar />

              <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
                  Upcoming Session
                </p>
                {upcomingCall ? (
                  <div className="space-y-3 rounded-2xl bg-[#F7F3EB] p-6">
                    <p className="font-mono text-xs uppercase text-[#C4623B] font-bold">
                      {upcomingCall.scenario?.category ?? 'Voice Call'}
                    </p>
                    <h3 className="font-serif text-xl font-bold text-[#17324D]">
                      {upcomingCall.scenario?.personaName ?? 'AI Persona'}
                    </h3>
                    <p className="font-mono text-xs text-[#17324D]/70">
                      {upcomingCall.scenario?.personaRole ?? 'Roleplay partner'}
                    </p>
                    <p className="font-mono text-xs text-[#17324D]/60 pt-2">
                      Scheduled: {new Date(upcomingCall.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#F7F3EB] p-6 font-mono text-sm text-[#17324D]/60">
                    No upcoming voice calls scheduled.
                  </div>
                )}
              </div>

              <RecommendationCard challenge={recommendation} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
