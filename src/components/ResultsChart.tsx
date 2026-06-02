'use client';

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { QuestionResults } from '@/types';

const BRAND = '#C2006C';
const CORRECT = '#16a34a';

// Um grafico de barras horizontais por pergunta. Perguntas V/F tem duas barras
// (Falso / Verdadeiro), tal como as de escolha multipla tem uma barra por opcao.
// A opcao correta aparece a verde; as restantes em magenta.
export default function ResultsChart({ q }: { q: QuestionResults }) {
  const data = q.options.map((label, i) => ({
    label,
    votes: q.counts[i] ?? 0,
    correct: i === q.correctIndex,
  }));

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-xl font-bold text-ink sm:text-2xl">{q.prompt}</h3>
      <ResponsiveContainer width="100%" height={Math.max(140, q.options.length * 60)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 56, top: 4, bottom: 4 }}
        >
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={240}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 16, fill: '#15151a' }}
          />
          <Bar dataKey="votes" radius={[0, 8, 8, 0]} isAnimationActive={false} barSize={36}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.correct ? CORRECT : BRAND} />
            ))}
            <LabelList
              dataKey="votes"
              position="right"
              style={{ fontSize: 20, fontWeight: 700, fill: '#15151a' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
