'use client';

interface StreakMilestonesProps {
  currentStreak: number;
  bestStreak: number;
}

const MILESTONES = [
  { target: 3, title: '3-Day Starter', reward: 'Consistency Badge' },
  { target: 7, title: '7-Day Master', reward: 'Weekly Streak Shield' },
  { target: 14, title: '14-Day Champion', reward: 'Communication Ribbon' },
  { target: 30, title: '30-Day Elite', reward: 'Mastery Medal' },
  { target: 100, title: '100-Day Legend', reward: 'Hall of Fame Status' },
];

export function StreakMilestones({ currentStreak, bestStreak }: StreakMilestonesProps) {
  const nextMilestone = MILESTONES.find((m) => currentStreak < m.target) ?? MILESTONES[MILESTONES.length - 1]!;
  const daysLeft = Math.max(0, nextMilestone.target - currentStreak);
  const progressPercent = Math.min(100, Math.round((currentStreak / nextMilestone.target) * 100));

  return (
    <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#C4623B] font-bold">
          MILESTONES & REWARDS
        </p>
        <h3 className="font-serif text-2xl font-bold text-[#17324D]">
          Streak Achievements
        </h3>
      </div>

      {/* Progress to Next Milestone Banner */}
      <div className="rounded-2xl border border-[#C4623B]/30 bg-[#C4623B]/10 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#C4623B]">
              Next Goal: {nextMilestone.title}
            </p>
            <p className="font-mono text-xs text-[#17324D] pt-0.5">
              {daysLeft > 0
                ? `${daysLeft} more day${daysLeft > 1 ? 's' : ''} to unlock ${nextMilestone.reward}`
                : `Milestone Achieved! Unlocked ${nextMilestone.reward}`}
            </p>
          </div>
          <span className="font-mono text-xl font-bold text-[#C4623B]">
            {currentStreak}/{nextMilestone.target}d
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full bg-[#C4623B] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Milestone Badges Grid */}
      <div className="grid gap-3 sm:grid-cols-5">
        {MILESTONES.map((m) => {
          const isUnlocked = bestStreak >= m.target;
          return (
            <div
              key={m.target}
              className={`flex flex-col items-center justify-between rounded-2xl p-4 text-center transition-all ${
                isUnlocked
                  ? 'border border-[#5D8A6A]/40 bg-[#5D8A6A]/10 text-[#17324D]'
                  : 'border border-[#D8D0C0]/60 bg-[#F7F3EB]/50 text-[#17324D]/50'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs font-bold ${
                isUnlocked ? 'bg-[#5D8A6A] text-white' : 'bg-[#17324D]/10 text-[#17324D]/40'
              }`}>
                {isUnlocked ? '✓' : `${m.target}d`}
              </div>
              <p className="mt-3 font-serif text-sm font-bold">{m.title}</p>
              <p className="mt-1 font-mono text-[10px] uppercase text-[#17324D]/60">{m.reward}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
