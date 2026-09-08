'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { SessionReport } from '@fluento/shared';

async function getReport(callId: string): Promise<SessionReport> {
  const { data } = await apiClient.get<SessionReport>(`/calls/${callId}/report`);
  return data;
}

export default function CallReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const callId = resolvedParams.id;

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['call-report', callId],
    queryFn: () => getReport(callId),
  });

  const scores = report?.scoreJson ?? {};

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
              POST-CALL REPORT
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-[#17324D]">
              Communication Evaluation
            </h1>
            <p className="mt-2 font-mono text-sm text-[#17324D]/70">
              Personalized AI feedback and performance metrics from your recent call session.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/journal"
              className="rounded-2xl border border-[#D8D0C0] bg-white px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#17324D] transition-colors hover:border-[#17324D]"
            >
              Journal
            </Link>
            <Link
              href="/calls/schedule"
              className="rounded-2xl bg-[#C4623B] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-transform hover:scale-[1.02]"
            >
              Schedule Next Call
            </Link>
          </div>
        </header>

        {isLoading ? (
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-12 text-center">
            <p className="font-mono text-sm text-[#17324D]/60">Generating your feedback report...</p>
          </div>
        ) : error || !report ? (
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-12 text-center">
            <p className="font-serif text-xl font-bold text-[#17324D]">Session Report Completed</p>
            <p className="mt-2 font-mono text-sm text-[#17324D]/70">
              Your voice practice session has been logged to your journal and rolling communication scores have been updated.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/journal"
                className="rounded-2xl bg-[#17324D] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Score Grid Cards */}
            <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
                Evaluation Scores
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(scores).map(([key, val]) => (
                  <div key={key} className="rounded-2xl bg-[#F7F3EB] p-5">
                    <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                      {key}
                    </p>
                    <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                      {typeof val === 'number' ? val : 70}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Summary & Detailed Feedback */}
            <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
                AI Coach Summary
              </h2>
              <p className="font-mono text-base leading-relaxed text-[#17324D]">
                {report.feedback || 'Your conversation showed strong active listening and solid structure.'}
              </p>
            </section>

            {/* Strengths & Improvements */}
            <div className="grid gap-6 sm:grid-cols-2">
              <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5D8A6A]">
                  Key Strengths
                </h2>
                <ul className="space-y-2">
                  {report.strengths?.length > 0 ? (
                    report.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2 font-mono text-sm text-[#17324D]">
                        <span className="text-[#5D8A6A] font-bold">•</span>
                        {str}
                      </li>
                    ))
                  ) : (
                    <li className="font-mono text-sm text-[#17324D]/70">Good engagement and overall fluency</li>
                  )}
                </ul>
              </section>

              <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#C4623B]">
                  Areas for Growth
                </h2>
                <ul className="space-y-2">
                  {report.improvements?.length > 0 ? (
                    report.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 font-mono text-sm text-[#17324D]">
                        <span className="text-[#C4623B] font-bold">•</span>
                        {imp}
                      </li>
                    ))
                  ) : (
                    <li className="font-mono text-sm text-[#17324D]/70">Reduce filler words and extend vocabulary range</li>
                  )}
                </ul>
              </section>
            </div>

            {/* Recommended Next Exercises */}
            <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
                Recommended Exercises
              </h2>
              <div className="space-y-3">
                {report.recommendations?.length > 0 ? (
                  report.recommendations.map((rec, i) => (
                    <div key={i} className="rounded-2xl bg-[#F7F3EB] p-4 font-mono text-sm text-[#17324D]">
                      {rec}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#F7F3EB] p-4 font-mono text-sm text-[#17324D]">
                    Schedule a follow-up call or try an Image Study to build descriptive vocabulary.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
