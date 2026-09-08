'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Topic, ThoughtExercise, TopicCategory } from '@fluento/shared';

async function getTopics(): Promise<Topic[]> {
  try {
    const { data } = await apiClient.get<Topic[]>('/topics');
    return data;
  } catch {
    return [
      {
        id: 'topic-1',
        title: 'Why Should We Hire You?',
        category: 'professional',
        difficulty: 'intermediate',
        prompt: 'Explain your core strengths, unique perspective, and how you create value in a team environment.',
      },
      {
        id: 'topic-2',
        title: 'Should AI Replace Classroom Teachers?',
        category: 'opinion',
        difficulty: 'advanced',
        prompt: 'Present your thesis on whether AI tutors can replace human educators, addressing empathy, pedagogy, and efficiency.',
      },
      {
        id: 'topic-3',
        title: 'My Dream Career Path',
        category: 'personal',
        difficulty: 'beginner',
        prompt: 'Describe your ideal career trajectory, the impact you wish to make, and key milestones along the way.',
      },
    ];
  }
}

export default function ThoughtExerciseHubPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | 'all'>('all');
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics-list'],
    queryFn: getTopics,
  });

  const filteredTopics = useMemo(() => {
    if (selectedCategory === 'all') return topics;
    return topics.filter((t) => t.category === selectedCategory);
  }, [topics, selectedCategory]);

  const handleStartRandom = async () => {
    setIsLoadingRandom(true);
    try {
      const catParam = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const { data } = await apiClient.get<ThoughtExercise>(`/topics/random${catParam}`);
      if (data?.topic?.id) {
        sessionStorage.setItem(`thought_exercise_${data.topic.id}`, JSON.stringify(data));
        router.push(`/practice/thought-exercise/${data.topic.id}`);
      } else {
        router.push('/practice/thought-exercise/topic-1');
      }
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleStartTopic = (topic: Topic) => {
    const exercise: ThoughtExercise = {
      topic,
      mode: topic.category === 'opinion' ? 'debate' : 'quick_thinking',
    };
    sessionStorage.setItem(`thought_exercise_${topic.id}`, JSON.stringify(exercise));
    router.push(`/practice/thought-exercise/${topic.id}`);
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
              PART III — THOUGHT EXERCISES
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-[#17324D]">
              Speaking Topic Challenges
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm text-[#17324D]/70 leading-relaxed">
              Master spontaneous communication, monologue structure, 30-second quick thinking, and debate reasoning.
            </p>
          </div>
          <button
            onClick={handleStartRandom}
            disabled={isLoadingRandom}
            className="rounded-2xl bg-[#C4623B] px-6 py-3.5 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoadingRandom ? 'Selecting...' : '⚡ Random Topic Challenge'}
          </button>
        </header>

        {/* Category Selector Tabs */}
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-[#D8D0C0] pb-4">
            {(
              [
                { id: 'all', label: 'All Topics' },
                { id: 'personal', label: 'Personal' },
                { id: 'professional', label: 'Professional' },
                { id: 'opinion', label: 'Opinion & Debate' },
                { id: 'general', label: 'General' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#17324D] font-semibold text-white'
                    : 'bg-white border border-[#D8D0C0] text-[#17324D]/80 hover:border-[#17324D]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

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
            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-8 text-center">
              <p className="font-mono text-sm text-[#17324D]/60">No topics found for this category.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
