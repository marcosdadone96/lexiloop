import { Container } from '@/components/ui/Container';

const FLOW = [
  {
    label: 'Exam question',
    content: (
      <div className="text-sm">
        <p className="mb-2 font-medium text-[var(--text-primary)]">Was bedeutet &quot;obwohl&quot; im Kontext?</p>
        <p className="text-[var(--text-secondary)]">Multiple choice - B2 Reading</p>
      </div>
    ),
  },
  {
    label: 'Missed word',
    content: (
      <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-500">obwohl</div>
    ),
  },
  {
    label: 'Your deck',
    content: (
      <div className="space-y-1.5 text-xs">
        {['obwohl', 'trotzdem', 'dennoch'].map((w) => (
          <div
            key={w}
            className="flex items-center gap-2 rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span className="font-medium text-[var(--text-primary)]">{w}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Flashcard',
    content: (
      <div className="text-center text-sm">
        <p className="text-lg font-bold text-[var(--text-primary)]">obwohl</p>
        <p className="mt-1 text-[var(--text-secondary)]">although / even though</p>
        <span
          className="mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium text-[var(--brand)]"
          style={{ background: 'var(--brand-light)' }}
        >
          I know this
        </span>
      </div>
    ),
  },
  {
    label: 'New personalized exam',
    content: (
      <div className="text-sm">
        <p className="font-semibold text-[var(--brand)]">Personal B2 test</p>
        <p className="mt-1 text-[var(--text-secondary)]">Built from 12 words you missed</p>
      </div>
    ),
  },
];

export function DemoSection() {
  return (
    <section id="exams" className="section-pad bg-[var(--bg-elevated)]/50">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            See LexiCoil in action
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">From mistake to mastery in seconds.</p>
        </div>

        <div className="mt-14 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-center">
          {FLOW.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4 lg:flex-col lg:gap-3">
              <div className="surface-card min-w-[160px] flex-1 p-5 lg:min-w-[180px] lg:flex-none">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {step.label}
                </p>
                {step.content}
              </div>
              {i < FLOW.length - 1 && (
                <span className="hidden text-[var(--brand)] lg:block" aria-hidden="true">
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
