'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import type { Image, ImageChallenge, ChallengeMode, SessionReport } from '@fluento/shared';

export default function ActiveImageStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const imageId = resolvedParams.id;
  const router = useRouter();

  const [image, setImage] = useState<Image | null>(null);
  const [mode, setMode] = useState<ChallengeMode>('standard');
  const [modeConfig, setModeConfig] = useState<ImageChallenge['modeConfig']>({});
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
      const cached = sessionStorage.getItem(`image_challenge_${imageId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as ImageChallenge;
          if (parsed.image && mounted) {
            setImage(parsed.image);
            setMode(parsed.mode ?? 'standard');
            setModeConfig(parsed.modeConfig ?? {});
            setIsLoading(false);
            return;
          }
        } catch {
          // Ignore parse error
        }
      }

      // Fetch image details from API
      try {
        const { data } = await apiClient.get<Image>(`/images/${imageId}`);
        if (mounted) {
          setImage(data);
        }
      } catch {
        if (mounted) {
          // Placeholder fallback image for demo
          setImage({
            id: imageId,
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            difficulty: 'intermediate',
            metadata: {
              sceneType: 'beach',
              primaryObjects: ['beach', 'ocean', 'sun'],
              secondaryObjects: [],
              activities: ['relaxing'],
              relationships: [],
              atmosphere: ['peaceful'],
              referenceDescription: 'A quiet tropical beach.',
              advancedDescription: 'A tranquil coastline with clear blue water and warm sunlight.',
            },
            createdAt: new Date().toISOString(),
          });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [imageId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!responseText.trim()) {
      setErrorMsg('Please record or type a descriptive response before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: report } = await apiClient.post<SessionReport>('/challenges/image/submit', {
        imageId,
        mode,
        responseText: responseText.trim(),
      });

      // Save report in session storage and navigate
      if (report?.id) {
        sessionStorage.setItem(`image_report_${imageId}`, JSON.stringify(report));
      }
      router.push(`/practice/image-study/${imageId}/report`);
    } catch {
      // Direct navigation on fallback
      router.push(`/practice/image-study/${imageId}/report`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const forbiddenWords = (modeConfig && 'forbiddenWords' in modeConfig && Array.isArray((modeConfig as { forbiddenWords?: string[] }).forbiddenWords))
    ? (modeConfig as { forbiddenWords: string[] }).forbiddenWords
    : [];
  const emotion = (modeConfig && 'emotion' in modeConfig && typeof (modeConfig as { emotion?: string }).emotion === 'string')
    ? (modeConfig as { emotion: string }).emotion
    : 'peaceful';
  const perspective = (modeConfig && 'perspective' in modeConfig && typeof (modeConfig as { perspective?: string }).perspective === 'string')
    ? (modeConfig as { perspective: string }).perspective
    : 'journalist';

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#17324D]/60">
              IMAGE STUDY SESSION
            </p>
            <h1 className="font-serif text-3xl font-bold text-[#17324D]">
              Visual Observation Challenge
            </h1>
          </div>
          <span className="rounded-full bg-[#17324D]/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#17324D] self-start sm:self-auto">
            {mode.replace('_', ' ')} MODE
          </span>
        </header>

        {isLoading ? (
          <div className="rounded-3xl border border-[#D8D0C0] bg-white p-12 text-center">
            <p className="font-mono text-sm text-[#17324D]/60">Loading challenge image...</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column: Image Render Frame */}
            <section className="flex flex-col rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-[#D8D0C0]/60 bg-[#F7F3EB]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image?.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}
                  alt="Study visual"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-between font-mono text-xs text-[#17324D]/60">
                <span>Difficulty: {image?.difficulty ?? 'Intermediate'}</span>
                <span>ID: {imageId.slice(0, 8)}...</span>
              </div>
            </section>

            {/* Right Column: Instructions, Mode Callout, Response Form */}
            <section className="flex flex-col justify-between rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs space-y-6">
              <div className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
                  Challenge Instructions
                </h2>

                {/* Mode Specific Callout Box */}
                {mode === 'forbidden_words' && (
                  <div className="rounded-2xl border border-[#C4623B]/30 bg-[#C4623B]/10 p-5 space-y-2">
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#C4623B]">
                      Forbidden Words Constraint
                    </p>
                    <p className="font-mono text-sm text-[#17324D]">
                      Do not use the following words in your description:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {forbiddenWords.map((word: string, i: number) => (
                        <span
                          key={i}
                          className="rounded-full bg-[#C4623B] px-3 py-1 font-mono text-xs font-semibold text-white"
                        >
                          ✕ {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mode === 'emotion' && (
                  <div className="rounded-2xl border border-[#5D8A6A]/30 bg-[#5D8A6A]/10 p-5 space-y-1">
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#5D8A6A]">
                      Emotion Target
                    </p>
                    <p className="font-serif text-lg font-bold text-[#17324D]">
                      Describe this scene as <span className="underline decoration-[#5D8A6A]">{emotion}</span>.
                    </p>
                    <p className="font-mono text-xs text-[#17324D]/70">
                      Use emotional adjectives and expressive phrasing matching this atmosphere.
                    </p>
                  </div>
                )}

                {mode === 'perspective' && (
                  <div className="rounded-2xl border border-[#17324D]/20 bg-[#17324D]/5 p-5 space-y-1">
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#17324D]">
                      Role Perspective
                    </p>
                    <p className="font-serif text-lg font-bold text-[#17324D]">
                      Describe this scene as a <span className="underline decoration-[#17324D]">{perspective}</span>.
                    </p>
                    <p className="font-mono text-xs text-[#17324D]/70">
                      Adopt the tone, vocabulary, and viewpoint of this specific persona.
                    </p>
                  </div>
                )}

                {mode === 'standard' && (
                  <div className="rounded-2xl border border-[#D8D0C0] bg-[#F7F3EB]/50 p-5 space-y-1">
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#17324D]/70">
                      Standard Description
                    </p>
                    <p className="font-mono text-sm text-[#17324D]/80 leading-relaxed">
                      Describe the scene in clear, rich detail. Detail main subjects, secondary objects, background atmosphere, and spatial arrangements.
                    </p>
                  </div>
                )}
              </div>

              {/* Response Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <p className="font-mono text-xs text-[#B85450]">{errorMsg}</p>
                )}

                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#17324D]/70">
                    Your Description
                  </label>
                  <button
                    type="button"
                    onClick={toggleVoiceCapture}
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
                  placeholder="Record your description or type detailed response here..."
                  rows={6}
                  className="w-full rounded-2xl border border-[#D8D0C0] bg-[#F7F3EB]/50 p-4 font-mono text-sm text-[#17324D] focus:border-[#17324D] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !responseText.trim()}
                  className="w-full rounded-2xl bg-[#C4623B] py-4 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? 'Evaluating Observation...' : 'Submit Description →'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
