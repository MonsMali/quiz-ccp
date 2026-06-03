import { NextResponse } from 'next/server';
import { isRedisConfigured, getRedis, keys, REDIS_MISSING_MESSAGE } from '@/lib/redis';
import { questions } from '@/data/quiz';

export const runtime = 'nodejs';

// Limpa contagens e estatisticas entre sessoes e incrementa a ronda. A ronda nova
// faz com que cada dispositivo limpe a sua flag local de "ja submeteu" e que a guarda
// de dupla submissao (que inclui a ronda) deixe toda a gente voltar a contar.
// Sem auth: destina-se a uso de sala, nao exponhas o URL.
export async function POST() {
  if (!isRedisConfigured()) {
    console.error(REDIS_MISSING_MESSAGE);
    return NextResponse.json({ error: REDIS_MISSING_MESSAGE }, { status: 503 });
  }

  const redis = getRedis();
  const pipe = redis.pipeline();
  pipe.del(...keys.all(questions.map((q) => q.id)));
  pipe.incr(keys.round);
  const res = (await pipe.exec()) as [number, number];
  const round = Number(res[1] ?? 0);

  return NextResponse.json({ success: true, round });
}
