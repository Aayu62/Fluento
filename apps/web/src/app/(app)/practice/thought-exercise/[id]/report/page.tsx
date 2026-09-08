'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import type { SessionReport } from '@fluento/shared';

export default function ThoughtExerciseReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const topicId = resolvedParams.id;

  const [report, setReport] = useState<SessionReport | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(`thought_report_${topicId}`);
    if (cached) {
      try {
        setReport(JSON.parse(cached));
      } catch {
        // Fallback
      }
    }
  }, [topicId]);

  const scores = report?.scoreJson ?? {
    fluency: 82,
    grammar: 76,
    vocabulary: 80,
    argumentStrength: 75,
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
              THOUGHT EXERCISE EVALUATION
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-[#17324D]">
              Performance Report
            </h1>
            <p className="mt-2 font-mono text-sm text-[#17324D]/70">
              Detailed AI feedback on speech fluency, structural clarity, grammar, and argument strength.
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
              href="/practice/thought-exercise"
              className="rounded-2xl bg-[#C4623B] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-transform hover:scale-[1.02]"
            >
              Next Thought Exercise →
            </Link>
          </div>
        </header>

        {/* Metric Score Cards per TDD §3.4 */}
        <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
            Evaluation Breakdown
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-[#F7F3EB] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Fluency
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                {scores.fluency ?? 82}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7F3EB] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Grammar
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                {scores.grammar ?? 76}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7F3EB] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Vocabulary
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                {scores.vocabulary ?? 80}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7F3EB] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Argument Strength
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                {scores.argumentStrength ?? 75}
              </p>
            </div>
          </div>
        </section>

        {/* AI Summary Feedback */}
        <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
            AI Speech Coach Feedback
          </h2>
          <p className="font-mono text-base leading-relaxed text-[#17324D]">
            {report?.feedback ||
              'Great spontaneity! Your arguments flowed naturally. Focus on avoiding hesitation fillers and strengthening your conclusion with precise vocabulary.'}
          </p>
        </section>

        {/* Strengths & Areas for Improvement */}
        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5D8A6A]">
              Key Strengths
            </h2>
            <ul className="space-y-2 font-mono text-sm text-[#17324D]">
              {(report?.strengths ?? ['Strong opening stance', 'Consistent pacing throughout speech', 'Clear logical structure']).map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#5D8A6A] font-bold">•</span>
                  {str}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#C4623B]">
              Recommended Improvements
            </h2>
            <ul className="space-y-2 font-mono text-sm text-[#17324D]">
              {(report?.improvements ?? ['Reduce verbal pause fillers ("um", "like")', 'Incorporate more sophisticated discourse markers']).map((imp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C4623B] font-bold">•</span>
                  {imp}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Next Steps */}
        <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
            Suggested Next Practice
          </h2>
          <div className="space-y-3 font-mono text-sm text-[#17324D]">
            {(report?.recommendations ?? [
              'Try Debate Mode to practice counterpoint rebuttals',
              'Practice 30-second prep Quick Thinking challenges',
            ]).map((rec, i) => (
              <div key={i} className="rounded-2xl bg-[#F7F3EB] p-4">
                {rec}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
