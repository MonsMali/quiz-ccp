'use client';

import { useEffect, useState } from 'react';
import { questions, passMark } from '@/data/quiz';
import QuizQuestion from '@/components/QuizQuestion';
import ResultScreen from '@/components/ResultScreen';
import { SubmitResponse } from '@/types';

type Phase = 'intro' | 'name' | 'quiz' | 'submitting' | 'result';

function getClientId(): string {
  let id = localStorage.getItem('aq_clientId');
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('aq_clientId', id);
  }
  return id;
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previously, setPreviously] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (localStorage.getItem('aq_submitted') === '1') setPreviously(true);
    const savedName = localStorage.getItem('aq_name');
    if (savedName) setName(savedName);
  }, []);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const start = () => {
    setError(null);
    setPhase('name');
  };

  const goToQuiz = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem('aq_name', trimmed);
    setName(trimmed);
    setPhase('quiz');
  };

  const handleAnswer = (index: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = index;
      return next;
    });
    setShowFeedback(true);
  };

  const submit = async () => {
    setPhase('submitting');
    setError(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: getClientId(),
          answers: questions.map((qq, idx) => ({
            questionId: qq.id,
            selectedIndex: answers[idx] ?? -1,
          })),
        }),
      });
      const data: SubmitResponse = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Ocorreu um erro ao submeter. Tenta novamente.');
        setPhase('quiz');
        return;
      }
      localStorage.setItem('aq_submitted', '1');
      setResult(data);
      setPhase('result');
    } catch {
      setError('Erro de ligação. Verifica a internet e tenta novamente.');
      setPhase('quiz');
    }
  };

  const next = () => {
    setShowFeedback(false);
    if (!isLast) {
      setCurrent((c) => c + 1);
    } else {
      void submit();
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-6">
      {/* Cabecalho */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-brand">Alucinações de IA</h1>
        <p className="text-sm text-ink/60">Quiz rápido · 4 perguntas</p>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 rounded-2xl bg-white p-6 shadow-sm">
        {phase === 'intro' && (
          <div className="text-center">
            <p className="mb-4 text-lg text-ink/80">
              Responde a {questions.length} perguntas sobre quando a IA inventa informação. Vês logo
              se acertaste.
            </p>
            <p className="mb-6 rounded-xl bg-brand-50/70 px-4 py-3 text-sm font-semibold text-ink/80">
              Para teres sucesso, precisas de acertar pelo menos {passMark} das {questions.length}{' '}
              perguntas (75%).
            </p>
            {previously && (
              <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
                Já participaste neste dispositivo. Podes responder na mesma, mas só a primeira
                resposta conta para os resultados.
              </p>
            )}
            <button onClick={start} className="btn-primary w-full">
              Começar
            </button>
          </div>
        )}

        {phase === 'name' && (
          <div>
            <label htmlFor="name" className="mb-2 block text-lg font-semibold text-ink">
              Como te chamas?
            </label>
            <p className="mb-4 text-sm text-ink/60">
              Escreve o teu primeiro nome para continuar.
            </p>
            <input
              id="name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') goToQuiz();
              }}
              placeholder="Primeiro nome"
              maxLength={40}
              className="mb-5 w-full rounded-xl border border-ink/15 px-4 py-3 text-lg text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
            <button onClick={goToQuiz} disabled={!name.trim()} className="btn-primary w-full">
              Continuar
            </button>
          </div>
        )}

        {(phase === 'quiz' || phase === 'submitting') && (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm font-semibold text-ink/50">
              <span>
                Pergunta {current + 1} de {questions.length}
              </span>
              <span>{Math.round(((current + (showFeedback ? 1 : 0)) / questions.length) * 100)}%</span>
            </div>
            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-brand-50">
              <div
                className="h-full bg-brand transition-all"
                style={{
                  width: `${((current + (showFeedback ? 1 : 0)) / questions.length) * 100}%`,
                }}
              />
            </div>

            <QuizQuestion
              key={q.id}
              question={q}
              selectedIndex={answers[current]}
              onAnswer={handleAnswer}
              showFeedback={showFeedback}
            />

            {showFeedback && (
              <div className="mt-6">
                <p className="mb-4 rounded-xl bg-brand-50/70 px-4 py-3 text-sm text-ink/80">
                  {q.why}
                </p>
                <button
                  onClick={next}
                  disabled={phase === 'submitting'}
                  className="btn-primary w-full"
                >
                  {phase === 'submitting'
                    ? 'A submeter...'
                    : isLast
                      ? 'Ver resultado'
                      : 'Seguinte'}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'result' && result && (
          <ResultScreen
            score={result.score}
            perQuestion={result.perQuestion}
            alreadySubmitted={result.alreadySubmitted}
            name={name}
          />
        )}
      </div>
    </main>
  );
}
