'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import type { ScheduledCall } from '@fluento/shared';

export function IncomingCallModal() {
  const router = useRouter();
  const [activeCall, setActiveCall] = useState<ScheduledCall | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkCalls = async () => {
      try {
        const { data } = await apiClient.get<ScheduledCall[]>('/calls/upcoming');
        if (!mounted || !data || data.length === 0) return;

        const now = new Date();
        const dueCall = data.find((c) => {
          const schedTime = new Date(c.scheduledTime);
          // Trigger if scheduled time is reached or past within 15 minutes window
          return c.status === 'scheduled' && schedTime <= now;
        });

        if (dueCall) {
          setActiveCall(dueCall);
        }
      } catch {
        // Silent catch for background polling
      }
    };

    checkCalls();
    const interval = setInterval(checkCalls, 10000); // Check every 10 seconds

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!activeCall) return null;

  const scenario = activeCall.scenario;
  const personaName = scenario?.personaName ?? 'AI Persona';
  const personaRole = scenario?.personaRole ?? 'Coach';
  const title = scenario?.title ?? 'Scheduled Call';

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await apiClient.post(`/calls/${activeCall.id}/start`);
      const callId = activeCall.id;
      setActiveCall(null);
      router.push(`/calls/${callId}/room`);
    } catch {
      // If start fails, still try navigating to room
      router.push(`/calls/${activeCall.id}/room`);
      setActiveCall(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await apiClient.post(`/calls/${activeCall.id}/decline`);
    } catch {
      // Ignore error on decline
    } finally {
      setActiveCall(null);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17324D]/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-[#D8D0C0] bg-[#F7F3EB] p-8 shadow-2xl">
        <div className="text-center">
          <span className="inline-block rounded-full bg-[#C4623B]/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-[#C4623B]">
            Incoming Voice Call
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-[#17324D]">
            {personaName}
          </h2>
          <p className="mt-1 font-mono text-sm font-medium text-[#17324D]/70">
            {personaRole}
          </p>
          <div className="mt-4 rounded-2xl border border-[#D8D0C0]/60 bg-white/60 p-3">
            <p className="font-mono text-xs text-[#17324D]/60">Scenario</p>
            <p className="font-serif text-base font-semibold text-[#17324D]">{title}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className="flex-1 rounded-2xl border border-[#B85450] bg-white py-3.5 font-mono text-sm font-semibold uppercase tracking-wider text-[#B85450] transition-colors hover:bg-[#B85450] hover:text-white disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 rounded-2xl border border-[#5D8A6A] bg-[#5D8A6A] py-3.5 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
