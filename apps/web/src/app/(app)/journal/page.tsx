'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  DashboardData,
  ImageChallenge,
  SessionReport,
  ThoughtExercise,
} from '@fluento/shared';

async function getDashboardData(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/progress/dashboard');
  return data;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function RecommendationCard({ challenge }: { challenge: ImageChallenge | ThoughtExercise | null }) {
  if (!challenge) {
    return (
      <div className="rounded-3xl border border-slate-300/60 bg-slate-50 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recommendation</p>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">Next practice item</h3>
        <p className="mt-3 text-slate-600">Your next challenge will be selected from recent performance and weakest skills.</p>
      </div>
    );
  }

  if ('image' in challenge) {
    return (
      <div className="rounded-3xl border border-slate-300/60 bg-slate-50 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recommendation</p>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">Image description challenge</h3>
        <p className="mt-3 text-slate-600">Describe the scene in detail and practice clear storytelling.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-300/60 bg-slate-50 p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recommendation</p>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{challenge.topic.title}</h3>
      <p className="mt-3 text-slate-600">{challenge.topic.prompt}</p>
      <p className="mt-4 text-sm text-slate-500">Mode: {challenge.mode.replace('_', ' ')}</p>
    </div>
  );
}

function SessionRow({ session }: { session: SessionReport }) {
  return (
    <div className="rounded-3xl border border-slate-300/60 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Session</p>
        <p className="text-xs text-slate-400">{formatDate(session.createdAt)}</p>
      </div>
      <h4 className="mt-3 text-lg font-semibold text-slate-900">{session.sessionType ?? 'Practice session'}</h4>
      <p className="mt-2 text-slate-600 line-clamp-2">{session.feedback || 'No summary available.'}</p>
    </div>
  );
}

export default function JournalPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  const scores = data?.scores;
  const streak = data?.streak;
  const upcomingCall = data?.upcomingCall;
  const recentSessions = data?.recentSessions ?? [];
  const recommendation = data?.recommendedChallenge ?? null;

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

  return (
    <main className="min-h-screen bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Communication Journal</p>
          <h1 className="text-4xl font-serif font-bold text-[#17324D]">Dashboard</h1>
          <p className="max-w-2xl text-slate-600">A calm, journal-like hub for your progress, streaks, upcoming sessions, and next practice steps.</p>
        </header>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">Unable to load dashboard.</p>
            <p className="mt-2 text-slate-600">Please refresh or sign in again.</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="space-y-8">
              <div className="rounded-[2rem] border border-slate-300/60 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Current streak</p>
                    <h2 className="mt-3 text-3xl font-semibold text-[#17324D]">{streak?.currentStreak ?? 0} days</h2>
                    <p className="mt-2 text-slate-600">Best streak: {streak?.bestStreak ?? 0} days</p>
                  </div>
                  <div className="rounded-3xl bg-[#F2EBDD] px-4 py-3 text-sm text-slate-700">
                    Last activity: {streak?.lastActivityDate ?? 'Not recorded'}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-300/60 bg-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Communication scores</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {scoreSummary.map((score) => (
                    <div key={score.label} className="rounded-3xl bg-[#F7F3EB] p-5">
                      <p className="text-sm text-slate-500">{score.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-[#17324D]">{score.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-300/60 bg-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Recent activity</p>
                <div className="mt-6 space-y-4">
                  {recentSessions.length > 0 ? (
                    recentSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="rounded-3xl bg-[#F7F3EB] p-5">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-slate-900">{session.sessionType ?? 'Practice session'}</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{formatDate(session.createdAt)}</p>
                        </div>
                        <p className="mt-3 text-slate-600 line-clamp-2">{session.feedback || 'No feedback recorded.'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl bg-[#F7F3EB] p-6 text-slate-600">
                      No recent activity found yet.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="rounded-[2rem] border border-slate-300/60 bg-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Upcoming session</p>
                {upcomingCall ? (
                  <div className="mt-6 space-y-3 rounded-3xl bg-[#F7F3EB] p-6">
                    <p className="text-sm text-slate-500">{upcomingCall.scenario?.title ?? 'AI call scenario'}</p>
                    <h3 className="text-2xl font-semibold text-[#17324D]">{upcomingCall.scenario?.personaName ?? 'Your conversation partner'}</h3>
                    <p className="text-slate-600">{new Date(upcomingCall.scheduledTime).toLocaleString()}</p>
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl bg-[#F7F3EB] p-6 text-slate-600">No upcoming sessions scheduled.</div>
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
