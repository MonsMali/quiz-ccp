import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alucinações de IA — Quiz',
  description: 'Quiz rápido de 4 perguntas sobre alucinações de IA.',
};

export const viewport: Viewport = {
  themeColor: '#C2006C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className="min-h-screen bg-brand-50/40 text-ink antialiased">{children}</body>
    </html>
  );
}
