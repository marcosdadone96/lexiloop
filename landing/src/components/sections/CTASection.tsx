'use client';

import { useAuthUi } from '@/context/AuthUiContext';
import { tryExamAsGuest } from '@/lib/tryExam';
import { Container } from '@/components/ui/Container';

export function CTASection() {
  const { openAuth } = useAuthUi();

  return (
    <section className="section-pad">
      <Container>
        <div
          className="relative overflow-hidden rounded-[24px] px-8 py-16 text-center md:px-16 md:py-20"
          style={{ background: 'var(--lc-navy)', color: '#fff' }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at top right, var(--brand), transparent 55%)',
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl tracking-tight md:text-4xl lg:text-5xl">
              Every mistake becomes your next lesson.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg font-semibold opacity-80">
              Try the 5-minute product demo now. Create an account when you want to save your progress.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={tryExamAsGuest} className="btn-primary px-8 py-4 text-base">
                Try 5-minute demo
              </button>
              <button
                type="button"
                onClick={() => openAuth('register')}
                className="btn-secondary border-white/20 bg-white/10 px-8 py-4 text-base text-white hover:bg-white/15"
              >
                Create free account
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
