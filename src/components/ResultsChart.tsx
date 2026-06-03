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

const BRAND = '#0061C2';
const CORRECT = '#16a34a';

// Um grafico de barras horizontais por pergunta. Perguntas V/F tem duas barras
// (Falso / Verdadeiro), tal como as de escolha multipla tem uma barra por opcao.
// A opcao correta aparece a verde; as restantes em azul (brand).
export default function ResultsChart({ q }: { q: QuestionResults }) {
  const data = q.options.map((label, i) => ({
    label,
    votes: q.counts[i] ?? 0,
    correct: i === q.correctIndex,
  }));

  return (
    <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 shadow-card sm:p-7">
      <h3 className="mb-5 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
        {q.prompt}
      </h3>
      <ResponsiveContainer width="100%" height={Math.max(150, q.options.length * 66)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 60, top: 4, bottom: 4 }}
          barCategoryGap="28%"
        >
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={240}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 17, fontWeight: 600, fill: '#15151a' }}
          />
          <Bar dataKey="votes" radius={[0, 10, 10, 0]} isAnimationActive={false} barSize={40}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.correct ? CORRECT : BRAND} />
            ))}
            <LabelList
              dataKey="votes"
              position="right"
              style={{ fontSize: 22, fontWeight: 800, fill: '#15151a' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
