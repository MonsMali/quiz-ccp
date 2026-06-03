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
    const savedName = localStorage.getItem('aq_name');
    if (savedName) setName(savedName);

    let active = true;
    (async () => {
      let submitted = localStorage.getItem('aq_submitted') === '1';
      try {
        // Se a ronda no servidor mudou (o formador fez "Repor"), este dispositivo
        // comeca de novo: limpamos a flag local de "ja submeteu".
        const res = await fetch('/api/results', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const serverRound = String(data.round ?? 0);
          if (localStorage.getItem('aq_round') !== serverRound) {
            localStorage.removeItem('aq_submitted');
            localStorage.setItem('aq_round', serverRound);
            submitted = false;
          }
        }
      } catch {
        // Sem rede: mantemos o que estiver guardado localmente.
      }
      if (active) setPreviously(submitted);
    })();

    return () => {
      active = false;
    };
  }, []);

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const progress = ((current + (showFeedback ? 1 : 0)) / questions.length) * 100;

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

  const compact = phase !== 'intro';

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-7">
      {/* Cabecalho */}
      <header className="mb-6 text-center">
        {compact ? (
          <h1 className="font-display text-xl font-extrabold tracking-tight text-brand">
            Alucinações de IA
          </h1>
        ) : (
          <>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Quiz rápido · 4 perguntas
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
              Alucinações de IA
            </h1>
          </>
        )}
      </header>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-1 flex-col rounded-3xl bg-white p-6 shadow-card">
        {phase === 'intro' && (
          <div className="flex flex-1 flex-col">
            <p className="mb-5 text-lg leading-relaxed text-ink/80">
              Responde a {questions.length} perguntas sobre quando a IA inventa informação. Vês logo
              se acertaste.
            </p>
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-brand-50/70 px-4 py-3.5">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand text-[11px] font-extrabold tabular-nums text-white">
                75
              </span>
              <p className="text-sm font-semibold leading-snug text-ink/75">
                Para teres sucesso, precisas de acertar pelo menos {passMark} das {questions.length}{' '}
                perguntas (75%).
              </p>
            </div>
            {previously && (
              <p className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm leading-snug text-brand-700">
                Já participaste neste dispositivo. Podes responder na mesma, mas só a primeira
                resposta conta para os resultados.
              </p>
            )}
            <div className="mt-auto pt-2">
              <button onClick={start} className="btn-primary w-full">
                Começar
              </button>
            </div>
          </div>
        )}

        {phase === 'name' && (
          <div className="flex flex-1 flex-col">
            <label htmlFor="name" className="mb-2 block font-display text-xl font-bold text-ink">
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
              className="mb-5 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3.5 text-lg text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
            />
            <div className="mt-auto pt-2">
              <button onClick={goToQuiz} disabled={!name.trim()} className="btn-primary w-full">
                Continuar
              </button>
            </div>
          </div>
        )}

        {(phase === 'quiz' || phase === 'submitting') && (
          <div>
            <div className="mb-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink/45">
              <span>
                Pergunta {current + 1} de {questions.length}
              </span>
              <span className="tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="mb-6 h-2.5 w-full overflow-hidden rounded-full bg-brand-50">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
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
              <div className="mt-6 animate-fade-up">
                <div className="mb-4 flex gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3.5">
                  <span className="mt-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700">
                    Porquê
                  </span>
                  <p className="text-sm leading-relaxed text-ink/80">{q.why}</p>
                </div>
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
