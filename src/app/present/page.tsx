'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ResultsResponse } from '@/types';

// Pagina de projecao para o "hook" inicial: apenas QR + URL + contador de respostas.
// NAO mostra graficos nem respostas certas (isso e o /admin, para a revelacao).
export default function PresentPage() {
  const [joinUrl, setJoinUrl] = useState('');
  const [submissions, setSubmissions] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJoinUrl(window.location.origin);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/results', { cache: 'no-store' });
        const json = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(json.error || 'Erro ao carregar.');
          return;
        }
        setError(null);
        setSubmissions((json as ResultsResponse).submissions);
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

  const displayUrl = joinUrl.replace(/^https?:\/\//, '');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="mb-2 text-5xl font-extrabold text-brand sm:text-6xl">Alucinações de IA</h1>
      <p className="mb-10 text-2xl text-ink/70">Aponta a câmara do telemóvel ao QR code para participar</p>

      <div className="rounded-3xl bg-white p-8 shadow-lg">
        {joinUrl && (
          <QRCodeSVG
            value={joinUrl}
            size={340}
            level="M"
            fgColor="#C2006C"
            bgColor="#ffffff"
          />
        )}
      </div>

      {displayUrl && (
        <p className="mt-8 text-3xl font-bold tracking-tight text-ink">{displayUrl}</p>
      )}

      <div className="mt-12 flex items-baseline gap-4">
        <span className="text-7xl font-extrabold tabular-nums text-brand">{submissions}</span>
        <span className="text-3xl text-ink/70">
          {submissions === 1 ? 'resposta recebida' : 'respostas recebidas'}
        </span>
      </div>

      {error && (
        <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-lg text-red-700">
          {error}
        </p>
      )}
    </main>
  );
}
