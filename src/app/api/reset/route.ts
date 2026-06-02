import { NextResponse } from 'next/server';
import { isRedisConfigured, getRedis, keys, REDIS_MISSING_MESSAGE } from '@/lib/redis';
import { questions } from '@/data/quiz';

export const runtime = 'nodejs';

// Limpa contagens e estatisticas entre sessoes. Nao apaga as guardas de cliente
// (aq:client:*) porque essas expiram sozinhas em 24h; para um novo grupo de pessoas
// isso e irrelevante. Sem auth: destina-se a uso de sala, nao exponhas o URL.
export async function POST() {
  if (!isRedisConfigured()) {
    console.error(REDIS_MISSING_MESSAGE);
    return NextResponse.json({ error: REDIS_MISSING_MESSAGE }, { status: 503 });
  }

  const redis = getRedis();
  await redis.del(...keys.all(questions.map((q) => q.id)));

  return NextResponse.json({ success: true });
}
