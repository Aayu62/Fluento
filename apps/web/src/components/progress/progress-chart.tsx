'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ProgressDataPoint } from '@fluento/shared';

interface ProgressChartProps {
  dataPoints: ProgressDataPoint[];
}

function formatDateLabel(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return dateStr;
  }
}

export function ProgressChart({ dataPoints }: ProgressChartProps) {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-[#F7F3EB]/50 p-6 text-center font-mono text-sm text-[#17324D]/60">
        No historical score entries recorded for this time range yet.
      </div>
    );
  }

  const chartData = dataPoints.map((dp) => ({
    date: formatDateLabel(dp.date),
    Fluency: dp.scores.fluency,
    Grammar: dp.scores.grammar,
    Vocabulary: dp.scores.vocabulary,
    Observation: dp.scores.observation,
    Expressiveness: dp.scores.expressiveness,
  }));

  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8D0C0" opacity={0.5} />
          <XAxis
            dataKey="date"
            stroke="#17324D"
            fontSize={12}
            tickLine={false}
            opacity={0.7}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#17324D"
            fontSize={12}
            tickLine={false}
            opacity={0.7}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#D8D0C0',
              borderRadius: '16px',
              fontFamily: 'monospace',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'monospace',
              fontSize: '12px',
              paddingTop: '10px',
            }}
          />
          <Line
            type="monotone"
            dataKey="Fluency"
            stroke="#C4623B"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#C4623B' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Grammar"
            stroke="#17324D"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#17324D' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Vocabulary"
            stroke="#5D8A6A"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#5D8A6A' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Observation"
            stroke="#D97706"
            strokeWidth={2}
            dot={{ r: 3, fill: '#D97706' }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Expressiveness"
            stroke="#7C3AED"
            strokeWidth={2}
            dot={{ r: 3, fill: '#7C3AED' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
