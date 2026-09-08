'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { CallScenario, ScheduledCall } from '@fluento/shared';

async function getScenarios(): Promise<CallScenario[]> {
  const { data } = await apiClient.get<CallScenario[]>('/calls/scenarios');
  return data;
}

async function getUpcomingCalls(): Promise<ScheduledCall[]> {
  const { data } = await apiClient.get<ScheduledCall[]>('/calls/upcoming');
  return data;
}

export default function CallsPage() {
  const router = useRouter();

  const { data: scenarios = [], isLoading: isLoadingScenarios } = useQuery({
    queryKey: ['call-scenarios'],
    queryFn: getScenarios,
  });

  const { data: upcomingCalls = [], refetch: refetchUpcoming, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['upcoming-calls'],
    queryFn: getUpcomingCalls,
  });

  const handleStartCall = async (callId: string) => {
    try {
      await apiClient.post(`/calls/${callId}/start`);
    } catch {
      // Ignore error if call already started
    }
    router.push(`/calls/${callId}/room`);
  };

  const handleDeclineCall = async (callId: string) => {
    try {
      await apiClient.post(`/calls/${callId}/decline`);
      refetchUpcoming();
    } catch {
      // Silent catch
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
              PART I — VOICE PRACTICE
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-[#17324D]">
              Voice Calls
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm text-[#17324D]/70">
              Schedule live AI roleplay calls for interview prep, sales practice, and spontaneous conversation.
            </p>
          </div>
          <Link
            href="/calls/schedule"
            className="inline-flex items-center justify-center rounded-2xl bg-[#C4623B] px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            + Schedule New Call
          </Link>
        </header>

        {/* Section: Upcoming Scheduled Calls */}
        <section className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/70">
            Upcoming Scheduled Calls
          </h2>

          {isLoadingUpcoming ? (
            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 text-center">
              <p className="font-mono text-sm text-[#17324D]/60">Loading upcoming sessions...</p>
            </div>
          ) : upcomingCalls.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#17324D]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#17324D]">
                        {call.scenario?.category ?? 'Voice Call'}
                      </span>
                      <span className="font-mono text-xs text-[#17324D]/60">
                        {new Date(call.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-bold text-[#17324D]">
                      {call.scenario?.personaName ?? 'AI Persona'}
                    </h3>
                    <p className="font-mono text-xs text-[#17324D]/70">
                      {call.scenario?.personaRole}
                    </p>
                    <p className="mt-3 font-serif text-sm italic text-[#17324D]/80">
                      "{call.scenario?.title}"
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-[#D8D0C0]/50 pt-4">
                    <button
                      onClick={() => handleStartCall(call.id)}
                      className="flex-1 rounded-xl bg-[#5D8A6A] py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-[#4d7358]"
                    >
                      Start Call
                    </button>
                    <button
                      onClick={() => handleDeclineCall(call.id)}
                      className="rounded-xl border border-[#B85450] px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#B85450] transition-colors hover:bg-[#B85450] hover:text-white"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#D8D0C0]/60 bg-white/70 p-8 text-center">
              <p className="font-serif text-base text-[#17324D]">No upcoming calls scheduled.</p>
              <p className="mt-1 font-mono text-xs text-[#17324D]/60">
                Choose a scenario below or click "Schedule New Call" to set up your next practice session.
              </p>
            </div>
          )}
        </section>

        {/* Section: Available Roleplay Scenarios */}
        <section className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/70">
            Available Roleplay Scenarios
          </h2>

          {isLoadingScenarios ? (
            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 text-center">
              <p className="font-mono text-sm text-[#17324D]/60">Loading scenarios...</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#F2EBDD] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#17324D]">
                        {scenario.category.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-xs uppercase text-[#C4623B]">
                        {scenario.difficulty}
                      </span>
                    </div>

                    <h3 className="mt-4 font-serif text-xl font-bold text-[#17324D]">
                      {scenario.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs font-semibold text-[#17324D]/70">
                      Partner: {scenario.personaName} ({scenario.personaRole})
                    </p>
                    <p className="mt-3 font-mono text-xs line-clamp-3 text-[#17324D]/80 leading-relaxed">
                      {scenario.promptTemplate}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[#D8D0C0]/50 pt-4">
                    <Link
                      href={`/calls/schedule?scenarioId=${scenario.id}`}
                      className="block w-full text-center rounded-xl border border-[#17324D] bg-transparent py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#17324D] transition-colors hover:bg-[#17324D] hover:text-white"
                    >
                      Schedule Scenario
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
