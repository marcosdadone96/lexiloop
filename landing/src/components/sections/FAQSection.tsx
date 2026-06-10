'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/Container';

const FAQS = [
  {
    q: 'Do I need an account to start?',
    a: 'No. Start the 5-minute product demo to experience every capability without an account. Create a free account afterward to save vocabulary, personalized practice, exam history, and readiness tracking.',
  },
  {
    q: 'What is the difference between a practice exam and a personalized exam?',
    a: 'A practice exam is a general mock test on an official topic — your baseline assessment. A personalized exam is generated from vocabulary you saved during practice. It targets only your weak words.',
  },
  {
    q: 'Can I use LexiCoil for Goethe B2?',
    a: 'Yes. LexiCoil supports Goethe A1 through C2 with official-format modules: Leseverstehen, Hörverstehen, Schreiben, and Sprechen.',
  },
  {
    q: 'How does personalized practice work?',
    a: "During practice mode, click any word you don't know to save it to your deck. Select words from your deck and LexiCoil generates a new mock exam weaving those items into realistic questions.",
  },
  {
    q: 'How many exams can I generate?',
    a: 'Free accounts get 2 AI-generated exams per billing cycle. Pro is a one-time upgrade that unlocks 20 per cycle. Sample demos and retaking saved exams never count against your quota.',
  },
  {
    q: 'Does LexiCoil replace Goethe or Cambridge materials?',
    a: 'No — it complements them. Use official Modellsätze for familiarity, then use LexiCoil to target vocabulary you personally struggle with.',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl tracking-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="surface-card mx-auto mt-12 max-w-3xl divide-y divide-[var(--border)]">
          {FAQS.map((item, i) => (
            <div key={item.q}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-semibold text-[var(--text-primary)]">{item.q}</span>
                <span className="shrink-0 text-[var(--text-muted)]">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm font-semibold leading-relaxed text-[var(--text-secondary)]">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
