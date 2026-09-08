'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { CallScenario, CallCategory } from '@fluento/shared';

async function getScenarios(): Promise<CallScenario[]> {
  const { data } = await apiClient.get<CallScenario[]>('/calls/scenarios');
  return data;
}

export default function ScheduleCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialScenarioId = searchParams.get('scenarioId');

  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['call-scenarios'],
    queryFn: getScenarios,
  });

  const [category, setCategory] = useState<CallCategory>('interview');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenarioId ?? '');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().split('T')[0]!,
  );
  const [scheduledTime, setScheduledTime] = useState<string>('14:00');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => s.category === category);
  }, [scenarios, category]);

  const selectedScenario = useMemo(() => {
    return scenarios.find((s) => s.id === selectedScenarioId);
  }, [scenarios, selectedScenarioId]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedScenarioId) {
      setErrorMsg('Please select a call scenario.');
      return;
    }

    const scheduledIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    if (new Date(scheduledIso) <= new Date()) {
      setErrorMsg('Scheduled time must be in the future.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/calls/schedule', {
        scenarioId: selectedScenarioId,
        scheduledTime: scheduledIso,
      });
      router.push('/calls');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response?: { data?: { message?: string } } }).response;
        setErrorMsg(resp?.data?.message ?? 'Failed to schedule call.');
      } else {
        setErrorMsg('Failed to schedule call.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
            SCHEDULE CALL
          </p>
          <h1 className="font-serif text-4xl font-bold text-[#17324D]">
            Schedule an AI Voice Call
          </h1>
          <p className="font-mono text-sm text-[#17324D]/70">
            Select category, scenario, date, and time for your personalized practice session.
          </p>
        </header>

        <form onSubmit={handleSchedule} className="space-y-8">
          {errorMsg && (
            <div className="rounded-2xl bg-[#B85450]/10 p-4 font-mono text-sm text-[#B85450] border border-[#B85450]/30">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Category Selection */}
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
              Step 1: Select Category
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { id: 'interview', label: 'Interview Practice' },
                  { id: 'sales', label: 'Sales Practice' },
                  { id: 'daily_conversation', label: 'Daily Conversation' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    setSelectedScenarioId('');
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    category === cat.id
                      ? 'border-[#17324D] bg-[#17324D] text-white shadow-xs'
                      : 'border-[#D8D0C0] bg-[#F7F3EB]/50 text-[#17324D] hover:border-[#17324D]/50'
                  }`}
                >
                  <p className="font-mono text-xs uppercase tracking-wider opacity-80">Category</p>
                  <p className="mt-1 font-serif text-lg font-bold">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Scenario Selection */}
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
              Step 2: Choose Roleplay Scenario
            </h2>

            {isLoading ? (
              <p className="font-mono text-sm text-[#17324D]/60">Loading scenarios...</p>
            ) : filteredScenarios.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredScenarios.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                      selectedScenarioId === sc.id
                        ? 'border-[#C4623B] bg-[#C4623B]/5 ring-2 ring-[#C4623B]'
                        : 'border-[#D8D0C0] bg-white hover:border-[#17324D]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#C4623B]">
                        {sc.difficulty}
                      </span>
                      {selectedScenarioId === sc.id && (
                        <span className="rounded-full bg-[#C4623B] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-serif text-lg font-bold text-[#17324D]">
                      {sc.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-[#17324D]/70">
                      Partner: {sc.personaName} ({sc.personaRole})
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-sm text-[#17324D]/60">
                No scenarios found for this category.
              </p>
            )}
          </div>

          {/* Step 3 & 4: Date & Time Selection */}
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
              Step 3 & 4: Date & Time
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#17324D]/70 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#D8D0C0] bg-[#F7F3EB]/50 p-3.5 font-mono text-sm text-[#17324D] focus:border-[#17324D] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#17324D]/70 mb-2">
                  Select Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full rounded-2xl border border-[#D8D0C0] bg-[#F7F3EB]/50 p-3.5 font-mono text-sm text-[#17324D] focus:border-[#17324D] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 5: Summary & Confirm */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#D8D0C0] bg-white p-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Summary
              </p>
              <p className="font-serif text-lg font-bold text-[#17324D]">
                {selectedScenario ? selectedScenario.title : 'No scenario selected'}
              </p>
              <p className="font-mono text-xs text-[#17324D]/70">
                Scheduled for: {scheduledDate} at {scheduledTime}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedScenarioId}
              className="rounded-2xl bg-[#C4623B] px-8 py-4 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm & Schedule Call'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
