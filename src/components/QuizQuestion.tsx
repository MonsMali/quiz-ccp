'use client';

import { Question } from '@/types';

interface QuizQuestionProps {
  question: Question;
  selectedIndex: number | null;
  onAnswer: (index: number) => void;
  showFeedback: boolean;
}

// Adaptado do componente do cmo_quiz: feedback imediato (certo/errado) e revelacao
// da opcao correta. Sem multilingue (apenas pt-PT) e sem baralhar opcoes, para que
// o indice da opcao coincida sempre com a estrutura de contagem em Redis.
export default function QuizQuestion({
  question,
  selectedIndex,
  onAnswer,
  showFeedback,
}: QuizQuestionProps) {
  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    onAnswer(index);
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold leading-relaxed text-ink sm:text-2xl">
        {question.prompt}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = i === question.correctIndex;
          const answered = selectedIndex !== null;
          const isRevealed = showFeedback && !isSelected && isCorrect && answered;
          const isDim = showFeedback && !isSelected && !isCorrect && answered;

          let buttonClass = 'btn-answer';
          let iconClass = 'bg-brand-50 text-brand';

          if (showFeedback && isSelected) {
            if (isCorrect) {
              buttonClass += ' !border-l-green-500 !bg-green-50';
              iconClass = 'bg-green-500 text-white';
            } else {
              buttonClass += ' !border-l-red-500 !bg-red-50';
              iconClass = 'bg-red-500 text-white';
            }
          } else if (isSelected) {
            buttonClass += ' selected';
            iconClass = 'bg-brand text-white';
          }

          if (isRevealed) {
            buttonClass += ' !border-l-green-500 !bg-green-50';
            iconClass = 'bg-green-500 text-white';
          }
          if (isDim) {
            buttonClass += ' opacity-[0.45]';
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={showFeedback}
              aria-pressed={isSelected}
              className={`${buttonClass} transition-opacity`}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${iconClass}`}
                >
                  {showFeedback && isSelected && isCorrect && '✓'}
                  {showFeedback && isSelected && !isCorrect && '✗'}
                  {isRevealed && '✓'}
                  {(!showFeedback || (!isSelected && !isRevealed)) &&
                    String.fromCharCode(65 + i)}
                </span>
                <span className="pt-1 text-left text-ink">{option}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
