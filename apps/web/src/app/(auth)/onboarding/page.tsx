'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils/cn';
import type { UserGoal, SkillLevel } from '@fluento/shared';

// ─── Step data ────────────────────────────────────────────────────────────────

const GOALS: { value: UserGoal; label: string; description: string }[] = [
  { value: 'interview_preparation', label: 'Interview Preparation', description: 'Crack HR and technical interviews' },
  { value: 'improve_fluency', label: 'Improve Fluency', description: 'Speak smoothly without hesitation' },
  { value: 'sales_practice', label: 'Sales Practice', description: 'Pitch products and close deals' },
  { value: 'general_communication', label: 'General Communication', description: 'Everyday professional conversations' },
];

const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'I struggle to express myself clearly' },
  { value: 'intermediate', label: 'Intermediate', description: 'I can communicate but lack confidence' },
  { value: 'advanced', label: 'Advanced', description: 'I communicate well but want to refine' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 rounded-full transition-all',
            i < current ? 'w-8 bg-accent' : i === current ? 'w-8 bg-navy' : 'w-4 bg-border',
          )}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<UserGoal[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.completeOnboarding,
    onSuccess: (profile) => {
      setProfile(profile);
      router.push('/journal');
    },
  });

  function toggleGoal(goal: UserGoal) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }

  function handleFinish() {
    if (!selectedLevel || selectedGoals.length === 0) return;
    mutate({ goals: selectedGoals, skillLevel: selectedLevel });
  }

  // ─── Step 0: Welcome ────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="w-full max-w-lg text-center">
        <p className="text-metadata mb-4 text-navy/50">WELCOME TO FLUENTO</p>
        <h1 className="font-serif text-4xl font-bold text-navy mb-6">
          Your Communication Journey Begins
        </h1>
        <p className="font-mono text-base text-navy/70 leading-relaxed mb-10 max-w-content mx-auto">
          Fluento helps you practice real conversations, build confidence, and communicate
          effectively — through structured daily practice.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-10 text-left">
          {[
            { label: 'AI Voice Calls', desc: 'Practice with realistic personas' },
            { label: 'Image Studies', desc: 'Sharpen descriptive language' },
            { label: 'Thought Exercises', desc: 'Develop spontaneous speech' },
          ].map((item) => (
            <div key={item.label} className="rounded-card border border-border bg-paper-secondary p-4">
              <p className="font-mono text-xs font-medium text-navy mb-1">{item.label}</p>
              <p className="font-mono text-xs text-navy/60">{item.desc}</p>
            </div>
          ))}
        </div>
        <Button size="lg" onClick={() => setStep(1)}>
          Get Started
        </Button>
      </div>
    );
  }

  // ─── Step 1: Goal Selection ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <StepIndicator current={1} total={3} />
          <p className="text-metadata mt-6 mb-2 text-navy/50">STEP 1 OF 3</p>
          <h2 className="font-serif text-3xl font-bold text-navy mb-2">
            What are your goals?
          </h2>
          <p className="font-mono text-sm text-navy/60">Select all that apply.</p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {GOALS.map((goal) => {
            const selected = selectedGoals.includes(goal.value);
            return (
              <button
                key={goal.value}
                onClick={() => toggleGoal(goal.value)}
                className={cn(
                  'rounded-card border p-4 text-left transition-colors',
                  selected
                    ? 'border-navy bg-navy text-white'
                    : 'border-border bg-paper hover:border-navy/40',
                )}
              >
                <p className={cn('font-mono text-sm font-medium', selected ? 'text-white' : 'text-navy')}>
                  {goal.label}
                </p>
                <p className={cn('font-mono text-xs mt-1', selected ? 'text-white/70' : 'text-navy/60')}>
                  {goal.description}
                </p>
              </button>
            );
          })}
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={selectedGoals.length === 0}
          onClick={() => setStep(2)}
        >
          Continue
        </Button>
      </div>
    );
  }

  // ─── Step 2: Skill Assessment ────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <StepIndicator current={2} total={3} />
          <p className="text-metadata mt-6 mb-2 text-navy/50">STEP 2 OF 3</p>
          <h2 className="font-serif text-3xl font-bold text-navy mb-2">
            How would you rate your current level?
          </h2>
          <p className="font-mono text-sm text-navy/60">
            This helps us personalise your practice sessions.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {SKILL_LEVELS.map((level) => {
            const selected = selectedLevel === level.value;
            return (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={cn(
                  'rounded-card border p-4 text-left transition-colors',
                  selected
                    ? 'border-navy bg-navy text-white'
                    : 'border-border bg-paper hover:border-navy/40',
                )}
              >
                <p className={cn('font-mono text-sm font-medium', selected ? 'text-white' : 'text-navy')}>
                  {level.label}
                </p>
                <p className={cn('font-mono text-xs mt-1', selected ? 'text-white/70' : 'text-navy/60')}>
                  {level.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button
            size="lg"
            className="flex-1"
            disabled={!selectedLevel || isPending}
            loading={isPending}
            onClick={handleFinish}
          >
            Enter Journal
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
