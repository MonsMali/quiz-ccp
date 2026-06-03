'use client';

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Text,
  XAxis,
  YAxis,
} from 'recharts';
import { QuestionResults } from '@/types';

const BRAND = '#0061C2';
const CORRECT = '#16a34a';

const LABEL_WIDTH = 230;

// Tick alinhado a esquerda que quebra dentro da sua propria faixa, para que
// opcoes longas nao fiquem cortadas na margem (problema das labels recharts).
function YTick({ y, payload }: { y?: number; payload?: { value?: string } }) {
  return (
    <Text
      x={4}
      y={y}
      width={LABEL_WIDTH - 12}
      textAnchor="start"
      verticalAnchor="middle"
      style={{ fontSize: 16, fontWeight: 600, fill: '#15151a' }}
    >
      {payload?.value ?? ''}
    </Text>
  );
}

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
      <ResponsiveContainer width="100%" height={Math.max(160, q.options.length * 74)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 60, top: 4, bottom: 4 }}
          barCategoryGap="28%"
        >
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={LABEL_WIDTH}
            tickLine={false}
            axisLine={false}
            tick={<YTick />}
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
