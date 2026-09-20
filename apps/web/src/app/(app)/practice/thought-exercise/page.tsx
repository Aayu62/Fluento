'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import type { ThoughtExercise, Topic, TopicCategory, ThoughtExerciseFormat, ThoughtExercisePreparation } from '@fluento/shared';
import SplitFlapText from '@/components/ui/SplitFlapText';
import TopicTumbler from '@/components/ui/TopicTumbler';

export default function ThoughtExerciseHubPage() {
  const router = useRouter();
  const [selectedPreparation, setSelectedPreparation] = useState<ThoughtExercisePreparation>('quick_thinking');
  const [selectedFormat, setSelectedFormat] = useState<ThoughtExerciseFormat | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | 'all'>('all');
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [tumblerResult, setTumblerResult] = useState<{ domain: string; premise: string; format: string } | null>(null);
  const [sampleTopics, setSampleTopics] = useState<Topic[]>([]);

  useEffect(() => {
    // Fetch a small sample of topics to populate the tumbler reels on load
    apiClient.get<Topic[]>('/topics?limit=20')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setSampleTopics(res.data);
        }
      })
      .catch(err => console.error('Failed to fetch sample topics:', err));
  }, []);

  const handleStartRandom = async () => {
    setIsLoadingRandom(true);
    setTumblerResult(null);

    try {
      const queryParams = new URLSearchParams({
        preparation: selectedPreparation,
        ...(selectedFormat !== 'all' && { format: selectedFormat }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
      }).toString();

      const { data } = await apiClient.get<ThoughtExercise>(`/topics/random?${queryParams}`);
      
      if (data?.topic?.id) {
        setIsLoadingRandom(false);
        setTumblerResult({
          domain: data.topic.category || 'General',
          premise: data.topic.title,
          format: data.topic.format || 'Monologue'
        });

        // Wait a few seconds to let user read the selected topic on the tumbler
        await new Promise(resolve => setTimeout(resolve, 2500));

        sessionStorage.removeItem(`timer_${data.topic.id}`);
        sessionStorage.setItem(`thought_exercise_${data.topic.id}`, JSON.stringify(data));
        router.push(`/practice/thought-exercise/${data.topic.id}`);
      } else {
        setIsLoadingRandom(false);
        alert('Failed to generate a random topic. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate random topic:', error);
      setIsLoadingRandom(false);
      alert('An error occurred. Please try again.');
    }
  };

  const handleChooseTopic = () => {
    const catParam = selectedCategory !== 'all' ? `category=${selectedCategory}` : '';
    const formatParam = selectedFormat !== 'all' ? `format=${selectedFormat}` : '';
    const prepParam = `preparation=${selectedPreparation}`;
    const queryParams = [catParam, formatParam, prepParam].filter(Boolean).join('&');
    router.push(`/practice/thought-exercise/choose?${queryParams}`);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .solari-housing {
          background: radial-gradient(circle at 50% 0%, #22374e 0%, #0e1e2d 100%);
          box-shadow: 0 24px 48px -12px rgba(3, 29, 53, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 6px rgba(0, 0, 0, 0.6);
        }
        .solari-rivet {
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.8);
        }
      `}} />
      <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
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
        </header>

        {/* Mechanical Solari Control Panel */}
        <section className="mt-8">
          <div className="solari-housing rounded-2xl p-5 sm:p-8 relative overflow-hidden text-[#fef9f0]">
            {/* Rivets */}
            <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-slate-400 solari-rivet"></div>
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-slate-400 solari-rivet"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-slate-400 solari-rivet"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-slate-400 solari-rivet"></div>

            {/* Header / Mode Switcher */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-2.5 py-1 rounded bg-[#C4623B] text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                  Live Dialectic Engine
                </div>
                <span className="font-mono text-xs text-slate-400 tracking-wide uppercase">
                  Preparation Mode Selector
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-[#07131e] p-1 rounded-lg border border-white/10 shadow-inner">
                  <button
                    onClick={() => setSelectedPreparation('quick_thinking')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[11px] uppercase transition-all ${
                      selectedPreparation === 'quick_thinking'
                        ? 'bg-[#C4623B] text-white font-bold shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>⚡ Quick Thinking</span>
                    <span className="text-[10px] opacity-80 tracking-normal ml-0.5">15s / 1m</span>
                  </button>
                  <button
                    onClick={() => setSelectedPreparation('research')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[11px] uppercase transition-all ${
                      selectedPreparation === 'research'
                        ? 'bg-[#C4623B] text-white font-bold shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>📚 Research Mode</span>
                    <span className="text-[10px] opacity-80 tracking-normal ml-0.5">15m / 1m</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tumbler Animation */}
            <TopicTumbler 
              isSpinning={isLoadingRandom} 
              selectedResult={tumblerResult} 
              sampleTopics={sampleTopics.map(t => ({ category: t.category || '', title: t.title, format: t.format || '' }))}
            />

            {/* Filter Strip */}
            <div className="flex flex-col gap-3.5 mt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-[#fef9f0]">
                
                {/* Format Segments */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[10px] uppercase text-slate-400 tracking-wider mr-1">Format:</span>
                  <div className="inline-flex bg-[#0a1520] p-0.5 rounded-lg border border-white/10">
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'monologue', label: 'Monologue' },
                        { id: 'debate', label: 'Debate' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFormat(f.id as ThoughtExerciseFormat | 'all')}
                        className={`px-2.5 py-1 rounded font-mono text-[11px] uppercase transition-colors ${
                          selectedFormat === f.id
                            ? 'bg-[#C4623B] text-white font-bold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Domain Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[10px] uppercase text-slate-400 tracking-wider mr-1">Domain:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'personal', label: 'Personal' },
                        { id: 'professional', label: 'Professional' },
                        { id: 'opinion', label: 'Opinion' },
                        { id: 'technology', label: 'Technology' },
                        { id: 'current_affairs', label: 'Affairs' },
                        { id: 'history', label: 'History' },
                        { id: 'miscellaneous', label: 'Misc' },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-white/15 text-white font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 mt-2 border-t border-white/5">
                <button
                  onClick={handleStartRandom}
                  disabled={isLoadingRandom || tumblerResult !== null}
                  style={{ minHeight: '44px' }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#C4623B] hover:bg-[#a13f17] text-white font-mono text-[12px] font-bold uppercase transition-all transform active:scale-95 shadow-md disabled:opacity-80 disabled:active:scale-100"
                >
                  <span className="text-[16px]">⚡</span>
                  <span>{isLoadingRandom ? '• Generating...' : tumblerResult ? '• Loading...' : '• Random Topic Challenge'}</span>
                </button>

                <button
                  onClick={handleChooseTopic}
                  disabled={isLoadingRandom || tumblerResult !== null}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 text-white font-mono text-[12px] font-bold uppercase transition-all transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔍 Choose Topic
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
