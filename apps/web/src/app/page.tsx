import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-metadata text-navy/50 mb-3 tracking-widest uppercase">
          COMMUNICATION TRAINING PLATFORM
        </p>
        <h1 className="font-serif text-page-title text-navy mb-4 text-5xl md:text-6xl font-bold">
          Fluento
        </h1>
        <p className="font-mono text-body text-navy/80 text-lg md:text-xl max-w-xl mx-auto mb-8">
          Practice Real Conversations. Build Real Confidence.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-mono font-medium rounded-card bg-accent text-white hover:bg-accent/90 transition-colors shadow-sm"
          >
            Get Started Free &rarr;
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-mono font-medium rounded-card border border-navy/30 bg-transparent text-navy hover:bg-navy/5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/journal"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-mono font-medium rounded-card border border-sage/40 bg-sage/10 text-sage-dark hover:bg-sage/20 transition-colors"
          >
            Journal Dashboard
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-card border border-navy/10 bg-white/60 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-navy mb-2">AI Voice Calls</h3>
            <p className="font-mono text-xs text-navy/70 leading-relaxed">
              Realistic roleplay calls for job interviews, sales pitches, and casual practice with persona feedback reports.
            </p>
          </div>
          <div className="p-6 rounded-card border border-navy/10 bg-white/60 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-navy mb-2">Image Studies</h3>
            <p className="font-mono text-xs text-navy/70 leading-relaxed">
              Observation challenges testing descriptive vocabulary, emotion capture, and forbidden words constraint modes.
            </p>
          </div>
          <div className="p-6 rounded-card border border-navy/10 bg-white/60 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-navy mb-2">Thought Exercises</h3>
            <p className="font-mono text-xs text-navy/70 leading-relaxed">
              Spontaneous speaking practice featuring 30-second quick preparation countdowns and debate modes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
