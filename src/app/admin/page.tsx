'use client';

import { useEffect, useState } from 'react';
import { ResultsResponse } from '@/types';
import ResultsChart from '@/components/ResultsChart';

// Painel de revelacao: media da turma + um grafico por pergunta. Faz polling a cada 2s.
// Projeta isto DEPOIS de toda a gente responder (o /present e que se projeta durante).
export default function AdminPage() {
  const [data, setData] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/results', { cache: 'no-store' });
        const json = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(json.error || 'Erro ao carregar resultados.');
          return;
        }
        setError(null);
        setData(json as ResultsResponse);
      } catch {
        if (active) setError('Erro de ligação ao servidor.');
      }
    };
    load();
    const timer = setInterval(load, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const reset = async () => {
    if (!window.confirm('Apagar todas as respostas e recomeçar do zero?')) return;
    setResetting(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      setData((prev) =>
        prev
          ? {
              submissions: 0,
              average: 0,
              questions: prev.questions.map((q) => ({ ...q, counts: q.counts.map(() => 0) })),
            }
          : prev,
      );
    } catch {
      setError('Não foi possível repor.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Atualiza ao vivo
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Resultados ao vivo
          </h1>
        </div>
        <button
          onClick={reset}
          disabled={resetting}
          className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink/55 transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
        >
          {resetting ? 'A repor...' : 'Repor'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-lg font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Media e total */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:gap-5">
        <div className="rounded-3xl bg-brand p-6 text-white shadow-card sm:p-7">
          <p className="text-base font-semibold text-white/85 sm:text-lg">Média da turma</p>
          <p className="font-display text-6xl font-extrabold leading-tight tabular-nums sm:text-7xl">
            {(data?.average ?? 0).toFixed(1)}
            <span className="text-2xl text-white/70 sm:text-3xl"> / 4</span>
          </p>
        </div>
        <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 shadow-card sm:p-7">
          <p className="text-base font-semibold text-ink/55 sm:text-lg">Participantes</p>
          <p className="font-display text-6xl font-extrabold leading-tight tabular-nums text-ink sm:text-7xl">
            {data?.submissions ?? 0}
          </p>
        </div>
      </div>

      {/* Graficos por pergunta */}
      <div className="space-y-5">
        {data?.questions.map((q) => <ResultsChart key={q.id} q={q} />)}
      </div>
    </main>
  );
}
