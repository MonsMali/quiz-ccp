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
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 py-12 text-center text-white"
      style={{
        background:
          'radial-gradient(120% 120% at 50% 0%, #0a539f 0%, #0a447f 45%, #04182e 100%)',
      }}
    >
      {/* Textura de pontos subtil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(#fff 1.4px, transparent 1.4px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative flex flex-col items-center">
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          <span className="text-base font-bold uppercase tracking-[0.18em] text-white/90">
            Ao vivo
          </span>
        </div>

        <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Alucinações de IA
        </h1>
        <p className="mb-12 mt-3 max-w-2xl text-2xl font-medium text-white/75 sm:text-3xl">
          Aponta a câmara do telemóvel ao QR code para participar
        </p>

        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          <div className="rounded-[2rem] bg-white p-7 shadow-2xl">
            {joinUrl && (
              <QRCodeSVG value={joinUrl} size={300} level="M" fgColor="#0061C2" bgColor="#ffffff" />
            )}
          </div>

          <div className="text-center lg:text-left">
            {displayUrl && (
              <>
                <p className="text-base font-semibold uppercase tracking-[0.2em] text-white/55">
                  Acede a
                </p>
                <p className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {displayUrl}
                </p>
              </>
            )}
            <div className="mt-10">
              <p className="font-display text-7xl font-extrabold leading-none tabular-nums sm:text-8xl lg:text-[7rem]">
                {submissions}
              </p>
              <p className="mt-1 text-2xl font-semibold text-white/70 sm:text-3xl">
                {submissions === 1 ? 'resposta recebida' : 'respostas recebidas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="relative mt-10 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-lg font-medium text-white backdrop-blur">
          {error}
        </p>
      )}
    </main>
  );
}
