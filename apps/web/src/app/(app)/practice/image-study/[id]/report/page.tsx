'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import type { SessionReport } from '@fluento/shared';

export default function ImageStudyReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const imageId = resolvedParams.id;

  const [report, setReport] = useState<SessionReport | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(`image_report_${imageId}`);
    if (cached) {
      try {
        setReport(JSON.parse(cached));
      } catch {
        // Fallback
      }
    }
  }, [imageId]);

  const scores = report?.scoreJson ?? {
    observation: 78,
    grammar: 72,
    vocabulary: 75,
    expressiveness: 68,
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
              IMAGE STUDY EVALUATION
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-[#17324D]">
              Observation Report
            </h1>
            <p className="mt-2 font-mono text-sm text-[#17324D]/70">
              Detailed AI evaluation of your descriptive vocabulary, spatial detail, and grammar accuracy.
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
              href="/practice/image-study"
              className="rounded-2xl bg-[#C4623B] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-transform hover:scale-[1.02]"
            >
              Next Image Study →
            </Link>
          </div>
        </header>

        {/* Metric Score Cards per FSD §7.6 */}
        <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
            Observation Scores
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-[#F7F3EB] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Observation
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                {scores.observation ?? 78}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7F3EB] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Vocabulary
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                {scores.vocabulary ?? 75}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7F3EB] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Grammar
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                {scores.grammar ?? 72}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7F3EB] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#17324D]/60">
                Expressiveness
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
                {scores.expressiveness ?? 68}
              </p>
            </div>
          </div>
        </section>

        {/* AI Summary Feedback */}
        <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
            AI Coach Feedback
          </h2>
          <p className="font-mono text-base leading-relaxed text-[#17324D]">
            {report?.feedback ||
              'You identified the main subjects well. Focus on incorporating richer descriptive vocabulary and noticing secondary background details.'}
          </p>
        </section>

        {/* Key Strengths & Missed Details */}
        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5D8A6A]">
              Key Strengths
            </h2>
            <ul className="space-y-2 font-mono text-sm text-[#17324D]">
              {(report?.strengths ?? ['Primary subjects correctly identified', 'Good overall sentence structure']).map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#5D8A6A] font-bold">•</span>
                  {str}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#C4623B]">
              Missed Observations & Improvements
            </h2>
            <ul className="space-y-2 font-mono text-sm text-[#17324D]">
              {(report?.improvements ?? ['Include secondary spatial background details', 'Use more specific color/texture adjectives']).map((imp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C4623B] font-bold">•</span>
                  {imp}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Recommended Next Steps */}
        <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
            Recommended Exercises
          </h2>
          <div className="space-y-3 font-mono text-sm text-[#17324D]">
            {(report?.recommendations ?? [
              'Practice describing scenes from memory for 60 seconds',
              'Try Forbidden Words mode to build synonyms',
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
