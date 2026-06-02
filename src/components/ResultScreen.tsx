'use client';

import { questions } from '@/data/quiz';

interface ResultScreenProps {
  score: number;
  perQuestion: { id: string; correct: boolean }[];
  alreadySubmitted?: boolean;
}

export default function ResultScreen({ score, perQuestion, alreadySubmitted }: ResultScreenProps) {
  const total = questions.length;
  const correctById = Object.fromEntries(perQuestion.map((p) => [p.id, p.correct]));

  return (
    <div className="text-center">
      <p className="text-lg text-ink/60">A tua pontuação</p>
      <p className="my-2 text-6xl font-extrabold text-brand">
        {score}<span className="text-3xl text-ink/40">/{total}</span>
      </p>
      <p className="mb-8 text-ink/60">
        {alreadySubmitted
          ? 'Já tinhas participado, por isso esta resposta não foi contada de novo.'
          : 'Obrigado por participar!'}
      </p>

      <div className="space-y-4 text-left">
        {questions.map((q) => {
          const correct = correctById[q.id];
          return (
            <div key={q.id} className="rounded-xl border border-ink/10 bg-white p-4">
              <p className="flex items-start gap-2 font-semibold text-ink">
                <span className={correct ? 'text-green-600' : 'text-red-600'}>
                  {correct ? '✓' : '✗'}
                </span>
                <span>{q.prompt}</span>
              </p>
              <p className="mt-1 pl-6 text-sm text-ink/70">{q.why}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
