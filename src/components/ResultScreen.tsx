'use client';

import { questions, passMark } from '@/data/quiz';

interface ResultScreenProps {
  score: number;
  perQuestion: { id: string; correct: boolean }[];
  alreadySubmitted?: boolean;
  name?: string;
}

export default function ResultScreen({
  score,
  perQuestion,
  alreadySubmitted,
  name,
}: ResultScreenProps) {
  const total = questions.length;
  const passed = score >= passMark;
  const correctById = Object.fromEntries(perQuestion.map((p) => [p.id, p.correct]));

  // Anel de progresso da pontuacao (raio 52 => circunferencia ~326.7)
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - (total ? score / total : 0));
  const ringColor = passed ? '#16a34a' : '#0061C2';

  return (
    <div className="animate-fade-up text-center">
      <div className="relative mx-auto mb-4 grid h-36 w-36 place-items-center">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e4eefc" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <p className="font-display text-5xl font-extrabold leading-none text-ink">
            {score}
            <span className="text-2xl text-ink/40">/{total}</span>
          </p>
        </div>
      </div>

      <p className={`font-display text-2xl font-extrabold ${passed ? 'text-green-600' : 'text-ink'}`}>
        {passed
          ? `Parabéns${name ? ', ' + name : ''}! Conseguiste.`
          : `Não foi desta${name ? ', ' + name : ''}.`}
      </p>
      <p className="mb-8 mt-1 text-sm text-ink/55">
        {alreadySubmitted
          ? 'Já tinhas participado, por isso esta resposta não foi contada de novo.'
          : `Critério de sucesso: pelo menos ${passMark} de ${total} (75%).`}
      </p>

      <div className="space-y-3 text-left">
        {questions.map((q) => {
          const correct = correctById[q.id];
          return (
            <div
              key={q.id}
              className="rounded-2xl border border-ink/[0.07] bg-white p-4 shadow-card"
            >
              <p className="flex items-start gap-2.5 font-semibold text-ink">
                <span
                  className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs ${
                    correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                  }`}
                >
                  {correct ? '✓' : '✗'}
                </span>
                <span className="leading-snug">{q.prompt}</span>
              </p>
              <p className="mt-2 pl-[1.875rem] text-sm leading-relaxed text-ink/65">{q.why}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
