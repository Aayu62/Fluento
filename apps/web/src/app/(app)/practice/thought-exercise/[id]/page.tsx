'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Topic, ThoughtExercisePreparation, SessionReport } from '@fluento/shared';

export default function ActiveThoughtExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const topicId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [preparation, setPreparation] = useState<ThoughtExercisePreparation>('quick_thinking');
  
  const [phase, setPhase] = useState<'prep' | 'action'>('prep');
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(15);
  const [actionTimeLeft, setActionTimeLeft] = useState<number>(60);

  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // Check session storage first for pre-fetched challenge
      const cached = sessionStorage.getItem(`thought_exercise_${topicId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.topic && mounted) {
            setTopic(parsed.topic);
            const loadedPrep = parsed.preparation ?? 'quick_thinking';
            setPreparation(loadedPrep);
            const timerCached = sessionStorage.getItem(`timer_${topicId}`);
            if (timerCached) {
              try {
                const parsedTimer = JSON.parse(timerCached);
                setPhase(parsedTimer.phase);
                setPrepTimeLeft(parsedTimer.prepTimeLeft);
                setActionTimeLeft(parsedTimer.actionTimeLeft);
              } catch {}
            } else {
              setPrepTimeLeft(loadedPrep === 'research' ? 900 : 15);
            }
            setIsLoading(false);
            return;
          }
        } catch {
          // Ignore parse error
        }
      }

      // Fallback topic data
      if (mounted) {
        setTopic({
          id: topicId,
          title: 'Remote Work vs In-Office Collaboration',
          category: 'professional',
          difficulty: 'intermediate',
          prompt: 'Should companies mandate in-person work, or is remote flexibility overall better for long-term productivity and employee well-being?',
          format: 'debate',
        });
        setPreparation('quick_thinking');
        const timerCached = sessionStorage.getItem(`timer_${topicId}`);
        if (timerCached) {
          try {
            const parsedTimer = JSON.parse(timerCached);
            setPhase(parsedTimer.phase);
            setPrepTimeLeft(parsedTimer.prepTimeLeft);
            setActionTimeLeft(parsedTimer.actionTimeLeft);
          } catch {}
        } else {
          setPrepTimeLeft(15);
        }
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [topicId]);

  // Persist Timer State
  useEffect(() => {
    sessionStorage.setItem(`timer_${topicId}`, JSON.stringify({ phase, prepTimeLeft, actionTimeLeft }));
  }, [phase, prepTimeLeft, actionTimeLeft, topicId]);

  // Preparation Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'prep' && prepTimeLeft > 0) {
      timer = setInterval(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'prep' && prepTimeLeft === 0) {
      setPhase('action');
    }
    return () => clearInterval(timer);
  }, [phase, prepTimeLeft]);

  // Action Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'action' && actionTimeLeft > 0) {
      timer = setInterval(() => {
        setActionTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'action' && actionTimeLeft === 0 && !isSubmitting) {
      // Auto-submit when time is up
      handleFinalSubmit();
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, actionTimeLeft, isSubmitting]);

  // Web Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setResponseText(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceCapture = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your response in the box below.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const skipPrep = () => {
    setPrepTimeLeft(0);
    setPhase('action');
  };

  const handleFinalSubmit = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (!responseText.trim()) {
      setErrorMsg('Please record or type your response before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: report } = await apiClient.post<SessionReport>('/topics/submit', {
        topicId,
        mode: topic?.format ?? 'monologue', // Fallback for backwards compat
        responseText: responseText.trim(),
      });

      if (report?.id) {
        sessionStorage.setItem(`thought_report_${topicId}`, JSON.stringify(report));
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['progress-history'] });
      queryClient.invalidateQueries({ queryKey: ['progress-sessions'] });
      router.push(`/practice/thought-exercise/${topicId}/report`);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['progress-history'] });
      queryClient.invalidateQueries({ queryKey: ['progress-sessions'] });
      router.push(`/practice/thought-exercise/${topicId}/report`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    handleFinalSubmit();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
              THOUGHT EXERCISE SESSION
            </p>
            <h1 className="font-serif text-3xl font-bold text-[#17324D]">
              {topic?.title ?? 'Spontaneous Speech Challenge'}
            </h1>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <span className="rounded-full bg-[#17324D]/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#17324D]">
              {topic?.format?.toUpperCase() ?? 'MONOLOGUE'}
            </span>
            <span className="rounded-full bg-[#C4623B]/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#C4623B]">
              {preparation.replace('_', ' ')}
            </span>
          </div>
        </header>

        {isLoading ? (
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-12 text-center">
            <p className="font-mono text-sm text-[#17324D]/60">Loading exercise prompt...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Prompt Banner */}
            <section className="rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#C4623B] font-bold">
                  Category: {topic?.category ?? 'General'}
                </span>
                <span className="font-mono text-xs text-[#17324D]/60 capitalize">
                  Difficulty: {topic?.difficulty ?? 'Intermediate'}
                </span>
              </div>
              <p className="font-serif text-2xl font-bold leading-snug text-[#17324D]">
                &ldquo;{topic?.prompt}&rdquo;
              </p>
            </section>

            {/* Preparation Banner */}
            {phase === 'prep' && (
              <section className="rounded-3xl border border-[#17324D]/20 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#17324D]">
                    Preparation Phase
                  </p>
                  <p className="font-mono text-sm text-[#17324D]/80 mt-1">
                    {preparation === 'research' 
                      ? 'You have 15 minutes to research and structure your points.'
                      : 'You have 15 seconds to quickly gather your thoughts!'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-mono text-3xl font-bold px-5 py-2 rounded-2xl bg-[#17324D] text-white">
                    {formatTime(prepTimeLeft)}
                  </div>
                  <button 
                    onClick={skipPrep}
                    className="font-mono text-xs font-bold uppercase tracking-wider text-[#17324D] underline hover:text-[#C4623B]"
                  >
                    I'm Ready
                  </button>
                </div>
              </section>
            )}

            {/* Speaking/Action Banner */}
            {phase === 'action' && (
              <section className="rounded-3xl border border-[#C4623B]/40 bg-[#C4623B]/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#C4623B] animate-pulse">
                    Speaking Phase Active!
                  </p>
                  <p className="font-mono text-sm text-[#17324D]">
                    You have exactly 1 minute to speak or type your response.
                  </p>
                </div>
                <div className="font-mono text-3xl font-bold px-5 py-2 rounded-2xl bg-[#C4623B] text-white">
                  {formatTime(actionTimeLeft)}
                </div>
              </section>
            )}

            {/* Debate Mode Callout */}
            {topic?.format === 'debate' && (
              <section className="rounded-3xl border border-[#5D8A6A]/40 bg-[#5D8A6A]/10 p-6 space-y-2">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#5D8A6A]">
                  Debate Format Reminder
                </p>
                <p className="font-mono text-xs text-[#17324D]/70">
                  You are arguing the assigned perspective in the prompt. Make sure to structure your argument persuasively and address potential counter-points!
                </p>
              </section>
            )}

            {/* Response Section */}
            <section className={`rounded-3xl border border-[#D8D0C0] bg-white p-8 shadow-xs space-y-6 ${phase === 'prep' ? 'opacity-50 pointer-events-none' : ''}`}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <p className="font-mono text-xs text-[#B85450]">{errorMsg}</p>
                )}

                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#17324D]/70">
                    Your Response
                  </label>
                  <button
                    type="button"
                    onClick={toggleVoiceCapture}
                    disabled={phase === 'prep'}
                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                      isListening
                        ? 'bg-[#C4623B] text-white animate-pulse'
                        : 'bg-[#5D8A6A] text-white hover:bg-[#4d7358]'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white" />
                    {isListening ? 'Listening...' : 'Push to Speak'}
                  </button>
                </div>

                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  disabled={phase === 'prep'}
                  placeholder="Express your thoughts clearly, structure your argument, or record voice input above..."
                  rows={8}
                  className="w-full rounded-2xl border border-[#D8D0C0] bg-[#F7F3EB]/50 p-4 font-mono text-sm text-[#17324D] focus:border-[#17324D] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !responseText.trim() || phase === 'prep'}
                  className="w-full rounded-2xl bg-[#17324D] py-4 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? 'Evaluating Thought Exercise...' : 'Submit Exercise →'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
