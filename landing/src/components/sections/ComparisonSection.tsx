import { Container } from '@/components/ui/Container';

type Cell = boolean | 'partial';

const ROWS: { label: string; lexicoil: Cell; duolingo: Cell; babbel: Cell; quizlet: Cell; goethe: Cell }[] = [
  { label: 'Adaptive learning from mistakes', lexicoil: true, duolingo: 'partial', babbel: 'partial', quizlet: false, goethe: false },
  { label: 'Official exam focus (Goethe / Cambridge)', lexicoil: true, duolingo: false, babbel: false, quizlet: false, goethe: true },
  { label: 'Personalized vocabulary practice', lexicoil: true, duolingo: 'partial', babbel: 'partial', quizlet: true, goethe: false },
  { label: 'Full practice tests (all modules)', lexicoil: true, duolingo: false, babbel: false, quizlet: false, goethe: true },
  { label: 'Exam-specific preparation', lexicoil: true, duolingo: false, babbel: false, quizlet: false, goethe: true },
  { label: 'Progress tracking & history', lexicoil: true, duolingo: true, babbel: true, quizlet: 'partial', goethe: false },
];

function CellIcon({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (value === 'partial') {
    return <span className="text-xs font-medium text-amber-500">Limited</span>;
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section className="section-pad bg-[var(--bg-elevated)]/50">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            How LexiCoil compares
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Duolingo sells habit. Quizlet sells memorization. LexiCoil sells adaptive exam preparation.
          </p>
        </div>

        <div className="surface-card mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="p-4 font-medium text-[var(--text-muted)]">Feature</th>
                <th className="p-4 font-bold text-[var(--brand)]" style={{ background: 'var(--brand-light)' }}>
                  LexiCoil
                </th>
                <th className="p-4 font-medium text-[var(--text-secondary)]">Duolingo</th>
                <th className="p-4 font-medium text-[var(--text-secondary)]">Babbel</th>
                <th className="p-4 font-medium text-[var(--text-secondary)]">Quizlet</th>
                <th className="p-4 font-medium text-[var(--text-secondary)]">Goethe resources</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-4 font-medium text-[var(--text-primary)]">{row.label}</td>
                  <td className="p-4 text-center" style={{ background: 'var(--brand-light)' }}>
                    <CellIcon value={row.lexicoil} />
                  </td>
                  <td className="p-4 text-center">
                    <CellIcon value={row.duolingo} />
                  </td>
                  <td className="p-4 text-center">
                    <CellIcon value={row.babbel} />
                  </td>
                  <td className="p-4 text-center">
                    <CellIcon value={row.quizlet} />
                  </td>
                  <td className="p-4 text-center">
                    <CellIcon value={row.goethe} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
