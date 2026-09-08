'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import type { ScheduledCall, CallScenario } from '@fluento/shared';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function ActiveCallRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const callId = resolvedParams.id;
  const router = useRouter();

  const [call, setCall] = useState<ScheduledCall | null>(null);
  const [scenario, setScenario] = useState<CallScenario | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [inputText, setInputText] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const turnsEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Fetch call details and initial turns
  useEffect(() => {
    let mounted = true;

    const initCall = async () => {
      try {
        const { data: callData } = await apiClient.get<ScheduledCall>(`/calls/${callId}`);
        if (!mounted) return;

        setCall(callData);
        if (callData.scenario) {
          setScenario(callData.scenario);
        }

        // Fetch existing turns if any
        const { data: turnData } = await apiClient.get<Turn[]>(`/calls/${callId}/turns`);
        if (mounted && Array.isArray(turnData)) {
          setTurns(turnData);

          // If no initial turns exist, generate initial persona opening prompt
          if (turnData.length === 0 && callData.scenario) {
            const initialTurn: Turn = {
              role: 'assistant',
              content: `Hello! I'm ${callData.scenario.personaName}, your ${callData.scenario.personaRole}. ${callData.scenario.promptTemplate}`,
            };
            await apiClient.post(`/calls/${callId}/turns`, {
              role: 'assistant',
              content: initialTurn.content,
            });
            setTurns([initialTurn]);
          }
        }
      } catch {
        // Fallback for demo/dev if API call has issues
      }
    };

    initCall();

    return () => {
      mounted = false;
    };
  }, [callId]);

  // Call timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll transcript
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // Web Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleSendUserTurn(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [callId]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use text input below.');
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

  const handleSendUserTurn = async (contentToSend: string) => {
    const userTurn: Turn = { role: 'user', content: contentToSend };
    setTurns((prev) => [...prev, userTurn]);
    setInputText('');

    try {
      await apiClient.post(`/calls/${callId}/turns`, {
        role: 'user',
        content: contentToSend,
      });

      // Simulate AI response response turn
      setTimeout(async () => {
        const responses = [
          `That makes sense. Could you elaborate a bit more on how you handled that?`,
          `Great point. In this ${scenario?.category.replace('_', ' ') ?? 'scenario'}, how would you approach the next step?`,
          `I understand. What specific experience guided your decision there?`,
        ];
        const aiContent = responses[Math.floor(Math.random() * responses.length)]!;
        const aiTurn: Turn = { role: 'assistant', content: aiContent };

        setTurns((prev) => [...prev, aiTurn]);
        await apiClient.post(`/calls/${callId}/turns`, {
          role: 'assistant',
          content: aiContent,
        });
      }, 1200);
    } catch {
      // Fallback
    }
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      await apiClient.post(`/calls/${callId}/end`);
      router.push(`/calls/${callId}/report`);
    } catch {
      router.push(`/calls/${callId}/report`);
    } finally {
      setIsEnding(false);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const personaName = scenario?.personaName ?? call?.scenario?.personaName ?? 'Sarah';
  const personaRole = scenario?.personaRole ?? call?.scenario?.personaRole ?? 'HR Manager';

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F7F3EB] px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {/* Header / Session Metadata Card */}
        <header className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C4623B]">
              Active Voice Practice
            </span>
            <h1 className="mt-1 font-serif text-2xl font-bold text-[#17324D]">
              {personaName}
            </h1>
            <p className="font-mono text-xs text-[#17324D]/70">{personaRole}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-2xl bg-[#F7F3EB] px-4 py-2 font-mono text-base font-bold text-[#17324D]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#5D8A6A] animate-pulse" />
              {formatTime(seconds)}
            </div>

            <button
              onClick={handleEndCall}
              disabled={isEnding}
              className="rounded-2xl border border-[#B85450] bg-[#B85450] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-[#a04642] disabled:opacity-50"
            >
              {isEnding ? 'Ending...' : 'End Call'}
            </button>
          </div>
        </header>

        {/* Live Conversation Transcript Feed */}
        <section className="flex flex-col h-[460px] rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs overflow-hidden">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60 mb-4 pb-2 border-b border-[#D8D0C0]/50">
            Live Session Transcript
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {turns.map((turn, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] ${
                  turn.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#17324D]/50 mb-1">
                  {turn.role === 'user' ? 'You' : personaName}
                </span>
                <div
                  className={`rounded-2xl p-4 font-mono text-sm leading-relaxed ${
                    turn.role === 'user'
                      ? 'bg-[#17324D] text-white rounded-br-xs'
                      : 'bg-[#F7F3EB] text-[#17324D] border border-[#D8D0C0]/60 rounded-bl-xs'
                  }`}
                >
                  {turn.content}
                </div>
              </div>
            ))}
            <div ref={turnsEndRef} />
          </div>
        </section>

        {/* Audio Controls & User Response Input Bar */}
        <footer className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  isMuted
                    ? 'bg-[#B85450] text-white'
                    : 'border border-[#D8D0C0] text-[#17324D] hover:bg-[#F2EBDD]'
                }`}
              >
                {isMuted ? 'Mic Muted' : 'Mic On'}
              </button>

              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  isSpeakerOn
                    ? 'border border-[#17324D] bg-[#17324D] text-white'
                    : 'border border-[#D8D0C0] text-[#17324D] hover:bg-[#F2EBDD]'
                }`}
              >
                {isSpeakerOn ? 'Speaker On' : 'Earpiece'}
              </button>
            </div>

            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                isListening
                  ? 'bg-[#C4623B] text-white animate-pulse'
                  : 'bg-[#5D8A6A] text-white hover:bg-[#4d7358]'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
              {isListening ? 'Listening...' : 'Push to Speak'}
            </button>
          </div>

          {/* Text Response Fallback Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) handleSendUserTurn(inputText.trim());
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type your response here..."
              disabled={isMuted}
              className="flex-1 rounded-2xl border border-[#D8D0C0] bg-[#F7F3EB]/50 px-4 py-3 font-mono text-sm text-[#17324D] focus:border-[#17324D] focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isMuted}
              className="rounded-2xl bg-[#17324D] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </main>
  );
}
