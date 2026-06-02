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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Resultados ao vivo</h1>
        <button
          onClick={reset}
          disabled={resetting}
          className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/60 transition hover:bg-ink/5 disabled:opacity-50"
        >
          {resetting ? 'A repor...' : 'Repor'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-lg text-red-700">
          {error}
        </div>
      )}

      {/* Media e total */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-brand p-6 text-white shadow-sm">
          <p className="text-lg opacity-90">Média da turma</p>
          <p className="text-5xl font-extrabold tabular-nums sm:text-6xl">
            {(data?.average ?? 0).toFixed(1)}
            <span className="text-2xl opacity-80"> / 4</span>
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-lg text-ink/60">Participantes</p>
          <p className="text-5xl font-extrabold tabular-nums text-ink sm:text-6xl">
            {data?.submissions ?? 0}
          </p>
        </div>
      </div>

      {/* Graficos por pergunta */}
      <div className="space-y-6">
        {data?.questions.map((q) => <ResultsChart key={q.id} q={q} />)}
      </div>
    </main>
  );
}
