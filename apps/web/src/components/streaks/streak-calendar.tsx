'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface StreakCalendarProps {
  initialYear?: number;
  initialMonth?: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function StreakCalendar({ initialYear, initialMonth }: StreakCalendarProps) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(initialYear ?? now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialMonth ?? now.getMonth() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ['streak-calendar', currentYear, currentMonth],
    queryFn: async () => {
      const res = await apiClient.get<{ activeDates: string[] }>(
        `/streak/calendar?year=${currentYear}&month=${currentMonth}`,
      );
      return res.data;
    },
  });

  const activeDatesSet = new Set(data?.activeDates ?? []);

  // Compute days in month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-3xl border border-[#D8D0C0] bg-white p-6 shadow-xs space-y-4">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#17324D]/60">
            PRACTICE CONSISTENCY
          </p>
          <h3 className="font-serif text-xl font-bold text-[#17324D]">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D0C0] font-mono text-sm text-[#17324D] hover:bg-[#F7F3EB]"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D0C0] font-mono text-sm text-[#17324D] hover:bg-[#F7F3EB]"
          >
            →
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center font-mono text-xs text-[#17324D]/60">
          Loading streak calendar...
        </div>
      ) : (
        <div className="space-y-2">
          {/* Day Names Grid */}
          <div className="grid grid-cols-7 text-center font-mono text-xs uppercase text-[#17324D]/60 font-semibold">
            {DAY_NAMES.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for first week padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 rounded-xl" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isActive = activeDatesSet.has(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dayNum}
                  className={`flex h-10 flex-col items-center justify-center rounded-xl font-mono text-xs transition-colors ${
                    isActive
                      ? 'bg-[#C4623B] font-bold text-white shadow-xs'
                      : isToday
                        ? 'border border-[#17324D] bg-[#17324D]/10 font-bold text-[#17324D]'
                        : 'bg-[#F7F3EB]/60 text-[#17324D]/80'
                  }`}
                >
                  <span>{dayNum}</span>
                  {isActive && <span className="h-1 w-1 rounded-full bg-white" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
