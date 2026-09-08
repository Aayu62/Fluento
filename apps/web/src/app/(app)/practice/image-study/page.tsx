'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import type { ImageChallenge, Difficulty } from '@fluento/shared';

export default function ImageStudyHubPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartChallenge = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const url = difficulty !== 'all' ? `/challenges/image?difficulty=${difficulty}` : '/challenges/image';
      const { data } = await apiClient.get<ImageChallenge>(url);
      if (data?.image?.id) {
        // Pass mode and config in session storage or query params
        sessionStorage.setItem(`image_challenge_${data.image.id}`, JSON.stringify(data));
        router.push(`/practice/image-study/${data.image.id}`);
      } else {
        setErrorMsg('No image challenges available.');
      }
    } catch {
      // If /challenges/image fails, try fallback endpoint
      try {
        const { data: img } = await apiClient.get<{ id: string }>(`/images/random`);
        if (img?.id) {
          router.push(`/practice/image-study/${img.id}`);
          return;
        }
      } catch {
        setErrorMsg('Unable to load an image challenge. Please check backend connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
            PART II — IMAGE STUDIES
          </p>
          <h1 className="font-serif text-4xl font-bold text-[#17324D]">
            Image Description Challenge
          </h1>
          <p className="font-mono text-sm text-[#17324D]/70 max-w-2xl leading-relaxed">
            Enhance your observation, descriptive vocabulary, and expressive communication through structured visual challenges.
          </p>
        </header>

        {errorMsg && (
          <div className="rounded-2xl border border-[#B85450]/30 bg-[#B85450]/10 p-4 font-mono text-sm text-[#B85450]">
            {errorMsg}
          </div>
        )}

        {/* Start Random Challenge Card */}
        <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C4623B]">
              RANDOM CHALLENGE GENERATOR
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[#17324D]">
              Start an Image Study Session
            </h2>
            <p className="mt-1 font-mono text-xs text-[#17324D]/70">
              The system will select a scene and assign a challenge mode (Standard, Forbidden Words, Emotion, or Perspective).
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-wider text-[#17324D]/70">
              Target Difficulty
            </label>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { id: 'all', label: 'Any Difficulty' },
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'intermediate', label: 'Intermediate' },
                  { id: 'advanced', label: 'Advanced' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`rounded-2xl px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                    difficulty === d.id
                      ? 'bg-[#17324D] text-white shadow-xs'
                      : 'border border-[#D8D0C0] bg-[#F7F3EB]/50 text-[#17324D] hover:border-[#17324D]/50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartChallenge}
              disabled={isLoading}
              className="w-full rounded-2xl bg-[#C4623B] py-4 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? 'Selecting Scene & Mode...' : 'Begin Image Study Challenge →'}
            </button>
          </div>
        </section>

        {/* Overview of Challenge Modes per PRD §8 */}
        <section className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/70">
            Available Challenge Modes
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs">
              <span className="rounded-full bg-[#F2EBDD] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#17324D]">
                Mode 1
              </span>
              <h3 className="mt-3 font-serif text-xl font-bold text-[#17324D]">
                Standard Description
              </h3>
              <p className="mt-2 font-mono text-xs text-[#17324D]/70 leading-relaxed">
                Describe the image freely. Focus on main subjects, secondary details, activities, and spatial relationships.
              </p>
            </div>

            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs">
              <span className="rounded-full bg-[#C4623B]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#C4623B]">
                Mode 2
              </span>
              <h3 className="mt-3 font-serif text-xl font-bold text-[#17324D]">
                Forbidden Words
              </h3>
              <p className="mt-2 font-mono text-xs text-[#17324D]/70 leading-relaxed">
                Describe the scene without using restricted key terms. Forces creative vocabulary and alternative phrasing.
              </p>
            </div>

            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs">
              <span className="rounded-full bg-[#5D8A6A]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#5D8A6A]">
                Mode 3
              </span>
              <h3 className="mt-3 font-serif text-xl font-bold text-[#17324D]">
                Emotion Mode
              </h3>
              <p className="mt-2 font-mono text-xs text-[#17324D]/70 leading-relaxed">
                Describe the scene conveying a specified emotional atmosphere (e.g., peaceful, nostalgic, excited, or sad).
              </p>
            </div>

            <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs">
              <span className="rounded-full bg-[#17324D]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#17324D]">
                Mode 4
              </span>
              <h3 className="mt-3 font-serif text-xl font-bold text-[#17324D]">
                Perspective Mode
              </h3>
              <p className="mt-2 font-mono text-xs text-[#17324D]/70 leading-relaxed">
                Adopt a specific persona (e.g. journalist, child, travel blogger, or poet) to describe the image.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
