export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-paper">
      {/* DESIGN.md §8 — notebook grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(#D8D0C0 1px, transparent 1px), linear-gradient(90deg, #D8D0C0 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.15,
        }}
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        {children}
      </div>
    </div>
  );
}
