'use client';

import { useAuthUi } from '@/context/AuthUiContext';
import { Container } from '@/components/ui/Container';

export function HeroSection() {
  const { openAuth } = useAuthUi();

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, var(--brand-light), transparent), var(--bg-base)',
        }}
      />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-up">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="lc-badge">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[var(--brand)]" />
                Private beta
              </span>
              <span className="lc-badge !bg-[var(--bg-elevated)] !text-[var(--text-secondary)]">
                Free to try
              </span>
            </div>

            <h1 className="font-display text-[2.75rem] leading-[1.08] tracking-tight text-[var(--text-primary)] md:text-[3.5rem] lg:text-[4.25rem]">
              Every mistake becomes your{' '}
              <span className="text-[var(--brand)]">next lesson.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg font-semibold leading-relaxed text-[var(--text-secondary)] md:text-xl">
              Take a Goethe or Cambridge practice test, save the vocabulary you miss, and generate
              personalized exams from your weaknesses — not random topics.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="/demo" className="btn-primary px-8 py-4 text-base text-center">
                Try a sample exam
              </a>
              <button type="button" onClick={() => openAuth('register')} className="btn-secondary px-8 py-4 text-base">
                Create free account
              </button>
            </div>

            <p className="mt-4 text-sm font-semibold text-[var(--text-muted)]">
              Sample exam runs in your browser — no account or AI quota required.
            </p>
          </div>

          <div className="relative animate-fade-up">
            <div
              className="absolute -inset-4 rounded-[28px] opacity-40"
              style={{ background: 'var(--shadow-hero)' }}
            />
            <div className="surface-card relative p-5 md:p-6" style={{ boxShadow: 'var(--shadow-hero)' }}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Practice exam
                  </p>
                  <p className="font-bold text-[var(--text-primary)]">Goethe B2 · Leseverstehen</p>
                </div>
                <span className="rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  Q 4/12
                </span>
              </div>

              <p className="mb-4 text-sm font-semibold leading-relaxed text-[var(--text-secondary)]">
                Welche Aussage zum Thema <strong className="text-[var(--text-primary)]">Nachhaltigkeit</strong>{' '}
                stimmt mit dem Text überein?
              </p>

              <div className="space-y-2">
                <div className="rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
                  A) Die Maßnahmen sind bereits ausreichend.
                  <span className="mt-1 block text-xs font-bold text-red-500">Incorrect</span>
                </div>
                <div className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  B) ...
                </div>
                <div className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  C) ...
                </div>
              </div>

              <div
                className="mt-5 rounded-xl border p-4"
                style={{ borderColor: 'var(--brand)', background: 'var(--brand-light)' }}
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                  Words you missed
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Nachhaltigkeit', 'ausreichend', 'Maßnahmen'].map((w) => (
                    <span
                      key={w}
                      className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)]"
                    >
                      {w}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs font-semibold text-[var(--text-secondary)]">
                  → Saved to your deck → Personalized exam
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
