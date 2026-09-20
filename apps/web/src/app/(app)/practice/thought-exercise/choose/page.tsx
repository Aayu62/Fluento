'use client';

import { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Topic, ThoughtExercise, TopicCategory, ThoughtExerciseFormat, ThoughtExercisePreparation } from '@fluento/shared';

async function getTopics(): Promise<Topic[]> {
  try {
    const { data } = await apiClient.get<Topic[]>('/topics');
    return data;
  } catch {
    return [];
  }
}

function ChooseTopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = (searchParams.get('category') as TopicCategory | 'all') || 'all';
  const selectedFormat = (searchParams.get('format') as ThoughtExerciseFormat | 'all') || 'all';
  const selectedPreparation = (searchParams.get('preparation') as ThoughtExercisePreparation) || 'quick_thinking';

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics-list'],
    queryFn: getTopics,
  });

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchFormat = selectedFormat === 'all' || t.format === selectedFormat;
      return matchCategory && matchFormat;
    });
  }, [topics, selectedCategory, selectedFormat]);

  const handleStartTopic = (topic: Topic) => {
    const exercise: ThoughtExercise = {
      topic,
      preparation: selectedPreparation,
    };
    sessionStorage.removeItem(`timer_${topic.id}`);
    sessionStorage.setItem(`thought_exercise_${topic.id}`, JSON.stringify(exercise));
    router.push(`/practice/thought-exercise/${topic.id}`);
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex flex-col gap-4">
          <button
            onClick={() => router.back()}
            className="self-start font-mono text-xs font-semibold uppercase tracking-widest text-[#17324D]/60 transition-colors hover:text-[#17324D]"
          >
            ← Back to Settings
          </button>
          <div>
            <h1 className="mt-2 font-serif text-3xl font-bold text-[#17324D]">
              Choose a Topic
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs text-[#17324D]/70">
              <span className="rounded-full bg-[#17324D]/10 px-3 py-1">
                Prep: <strong className="text-[#17324D]">{selectedPreparation.replace('_', ' ')}</strong>
              </span>
              <span className="rounded-full bg-[#17324D]/10 px-3 py-1">
                Category: <strong className="text-[#17324D]">{selectedCategory}</strong>
              </span>
              <span className="rounded-full bg-[#17324D]/10 px-3 py-1">
                Format: <strong className="text-[#17324D]">{selectedFormat}</strong>
              </span>
            </div>
          </div>
        </header>

        <section>
          {/* Topics Grid */}
          {isLoading ? (
            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-12 text-center">
              <p className="font-mono text-sm text-[#17324D]/60">Loading speaking topics...</p>
            </div>
          ) : filteredTopics.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-full bg-[#F2EBDD] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#17324D]">
                        {topic.category}
                      </span>
                      <span className="font-mono text-xs uppercase text-[#C4623B]">
                        {topic.difficulty}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#17324D]">
                      {topic.title}
                    </h3>
                    <p className="mt-3 font-mono text-xs text-[#17324D]/80 leading-relaxed line-clamp-3">
                      {topic.prompt}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[#D8D0C0]/50 pt-4">
                    <button
                      onClick={() => handleStartTopic(topic)}
                      className="w-full rounded-xl border border-[#17324D] bg-transparent py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#17324D] transition-colors hover:bg-[#17324D] hover:text-white"
                    >
                      Start Exercise →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-12 text-center">
              <p className="font-mono text-sm text-[#17324D]/60">No topics found matching your criteria.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ChooseTopicPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-sm">Loading...</div>}>
      <ChooseTopicContent />
    </Suspense>
  );
}
