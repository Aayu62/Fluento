import { useEffect, useState, useRef } from 'react';

const REEL_1 = ['Philosophy', 'Ethics & Justice', 'Geopolitics', 'Technology & AI', 'Macro-Economics', 'History', 'Personal', 'Science'];
const REEL_2 = [
  'Universal Basic Income Paradox',
  'AI Jurors in Capital Legal Trials?',
  'Algorithmic Censorship vs Free Speech',
  'Germline Gene-Editing Human Rights',
  'Digital Sovereignty of Micronations',
  'The Morality of Extreme Wealth',
  'Interplanetary Colonization Ethics'
];
const REEL_3 = [
  'Declamation · 120s',
  'Oxford Debate · Pro',
  'Impromptu Monologue · 60s',
  'Socratic Refutation · 90s',
  'Toulmin Exposition · 180s',
  'Open Monologue · 1m'
];

export default function TopicTumbler({ 
  isSpinning,
  selectedResult,
  sampleTopics
}: { 
  isSpinning: boolean;
  selectedResult?: { domain: string; premise: string; format: string } | null;
  sampleTopics?: { category: string; title: string; format: string }[];
}) {
  const [offsets, setOffsets] = useState({ domain: -64 * 3, premise: -64 * 3, format: -64 * 3 });
  const [blur, setBlur] = useState({ domain: false, premise: false, format: false });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const reel1Data = sampleTopics?.length ? Array.from(new Set(sampleTopics.map(t => t.category || 'General'))) : REEL_1;
  const reel2Data = sampleTopics?.length ? sampleTopics.map(t => t.title) : REEL_2;
  const reel3Data = sampleTopics?.length ? Array.from(new Set(sampleTopics.map(t => t.format || 'Monologue'))) : REEL_3;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isSpinning) {
      // FAST SPIN
      setBlur({ domain: true, premise: true, format: true });
      let tick = 0;
      intervalRef.current = setInterval(() => {
        tick++;
        setOffsets({
          domain: -64 * (tick % reel1Data.length) - (Math.random() * 20),
          premise: -64 * ((tick + 1) % reel2Data.length) - (Math.random() * 20),
          format: -64 * ((tick + 2) % reel3Data.length) - (Math.random() * 20),
        });
      }, 100);
    } else if (!selectedResult) {
      // SLOW IDLE SPIN (Mechanical ticking)
      setBlur({ domain: false, premise: false, format: false });
      let tick = 0;
      intervalRef.current = setInterval(() => {
        tick++;
        setOffsets({
          domain: -64 * (tick % reel1Data.length),
          premise: -64 * ((tick + 1) % reel2Data.length),
          format: -64 * ((tick + 2) % reel3Data.length),
        });
      }, 1500); // 1.5s per tick
    } else {
      // HALT
      setBlur({ domain: false, premise: false, format: false });
      setOffsets({ domain: -64, premise: -64, format: -64 });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpinning, selectedResult]);

  const createReelItems = (items: string[], isPrimary = false, overrideText?: string) => {
    const baseItems = [...items];
    if (overrideText && !isSpinning) {
      // When offset is -64, index 1 is exactly in the center with our new padding logic
      baseItems[1] = overrideText;
    }
    const repeated = [...baseItems, ...baseItems, ...baseItems, ...baseItems, ...baseItems];
    return repeated.map((item, idx) => (
      <div 
        key={idx} 
        className={`h-16 w-full flex items-center justify-center font-serif text-center px-2 transition-all duration-150 ${
          isPrimary ? 'text-lg font-bold text-[#fef9f0]' : 'text-sm text-[#fef9f0]/50'
        }`}
      >
        {item}
      </div>
    ));
  };

  return (
    <div className="relative w-full rounded-xl p-4 shadow-2xl backdrop-blur-sm bg-[#0c1825]/90 border border-white/10 mt-6 mb-4">
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-16 pointer-events-none z-20 flex items-center justify-between px-2">
        <div className="w-2 h-10 bg-[#C4623B] rounded-r-md shadow-md" />
        <div className="flex-1 mx-2 h-14 rounded bg-white/5 shadow-[0_0_15px_rgba(196,98,59,0.2)] border-y border-[#C4623B]/30" />
        <div className="w-2 h-10 bg-[#C4623B] rounded-l-md shadow-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 relative overflow-hidden rounded-lg h-48 bg-black/50" style={{ perspective: '950px' }}>
        
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#0c1825] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0c1825] to-transparent z-10 pointer-events-none" />

        <div className="hidden md:flex md:col-span-3 relative h-full flex-col items-center overflow-hidden bg-black/20 rounded">
          <div className="absolute top-2 font-mono text-[9px] uppercase tracking-widest text-[#fef9f0]/40 z-20">Reel I • Domain</div>
          <div 
            className="flex flex-col items-center w-full transition-transform ease-linear pt-[64px] pb-[64px]"
            style={{ 
              transform: `translateY(${offsets.domain}px)`,
              filter: blur.domain ? 'blur(2px)' : 'none',
              transitionDuration: isSpinning ? '100ms' : (!selectedResult ? '300ms' : '500ms')
            }}
          >
            {createReelItems(reel1Data, false, selectedResult?.domain)}
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 relative h-full flex flex-col items-center overflow-hidden bg-black/40 rounded">
          <div className="absolute top-2 font-mono text-[9px] uppercase tracking-widest text-[#C4623B] z-20">Reel II • Premise</div>
          <div 
            className="flex flex-col items-center w-full transition-transform ease-linear pt-[64px] pb-[64px]"
            style={{ 
              transform: `translateY(${offsets.premise}px)`,
              filter: blur.premise ? 'blur(3px)' : 'none',
              transitionDuration: isSpinning ? '100ms' : (!selectedResult ? '300ms' : '500ms')
            }}
          >
            {createReelItems(reel2Data, true, selectedResult?.premise)}
          </div>
        </div>

        <div className="hidden md:flex md:col-span-3 relative h-full flex-col items-center overflow-hidden bg-black/20 rounded">
          <div className="absolute top-2 font-mono text-[9px] uppercase tracking-widest text-[#fef9f0]/40 z-20">Reel III • Format</div>
          <div 
            className="flex flex-col items-center w-full transition-transform ease-linear pt-[64px] pb-[64px]"
            style={{ 
              transform: `translateY(${offsets.format}px)`,
              filter: blur.format ? 'blur(2px)' : 'none',
              transitionDuration: isSpinning ? '100ms' : (!selectedResult ? '300ms' : '500ms')
            }}
          >
            {createReelItems(reel3Data, false, selectedResult?.format)}
          </div>
        </div>

      </div>
    </div>
  );
}
