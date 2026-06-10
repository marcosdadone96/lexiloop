import { Container } from '@/components/ui/Container';

const BENEFITS = [
  {
    title: "Learn only what you don't know",
    desc: 'Stop reviewing vocabulary you already mastered. Every session targets your actual gaps.',
    icon: 'target',
  },
  {
    title: 'Stop wasting study time',
    desc: 'No more random word lists. Practice is driven by mistakes from real exam questions.',
    icon: 'clock',
  },
  {
    title: 'Improve exam scores faster',
    desc: 'Focused repetition on weak areas compounds faster than generic courses.',
    icon: 'chart',
  },
  {
    title: 'Measure real progress',
    desc: 'Track scores, history, and vocabulary growth across every mock exam you take.',
    icon: 'stats',
  },
  {
    title: 'Build confidence before exam day',
    desc: "Walk into Goethe or Cambridge knowing you've drilled your personal weak spots.",
    icon: 'confidence',
  },
  {
    title: 'Official exam format',
    desc: 'Reading, listening, writing, speaking - structured like the real certification papers.',
    icon: 'exam',
  },
];

export function BenefitsSection() {
  return (
    <section className="section-pad">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            What LexiCoil delivers today
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Not another language app. Adaptive exam preparation that respects your time.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="surface-card p-6 transition hover:border-[var(--brand)]/30">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold uppercase text-[var(--brand)]"
                style={{ background: 'var(--brand-light)' }}
              >
                {b.icon.slice(0, 2)}
              </span>
              <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)]">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{b.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
