import { Container } from '@/components/ui/Container';

const STEPS = [
  {
    title: 'Take a practice exam',
    desc: 'A general Goethe or Cambridge mock test on an official topic. This is your baseline assessment — not yet personalized.',
    tag: 'Practice exam',
  },
  {
    title: 'Save words you miss',
    desc: 'In practice mode, click any difficult word. LexiCoil saves it as evidence from your real mistakes.',
    tag: 'Vocabulary evidence',
  },
  {
    title: 'Generate a personalized exam',
    desc: 'Select saved words from your deck. LexiCoil builds a new official-format test using only your weak vocabulary.',
    tag: 'Personalized exam',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-pad">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl tracking-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            How LexiCoil works
          </h2>
          <p className="mt-4 text-lg font-semibold text-[var(--text-secondary)]">
            Practice exam first. Personalization comes from your mistakes — not on day one.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold text-[var(--brand)]"
                style={{ background: 'var(--brand-light)' }}
              >
                {i + 1}
              </div>
              <span className="lc-badge mb-2">{step.tag}</span>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">{step.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--text-secondary)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
