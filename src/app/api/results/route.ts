import { NextResponse } from 'next/server';
import { isRedisConfigured, getRedis, keys, REDIS_MISSING_MESSAGE } from '@/lib/redis';
import { questions } from '@/data/quiz';
import { QuestionResults } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isRedisConfigured()) {
    console.error(REDIS_MISSING_MESSAGE);
    return NextResponse.json({ error: REDIS_MISSING_MESSAGE }, { status: 503 });
  }

  const redis = getRedis();

  const pipe = redis.pipeline();
  pipe.hgetall(keys.stats);
  for (const q of questions) pipe.hgetall(keys.counts(q.id));
  const res = (await pipe.exec()) as (Record<string, unknown> | null)[];

  const stats = res[0] || {};
  const submissions = Number(stats.submissions ?? 0);
  const correctSum = Number(stats.correctSum ?? 0);
  const average = submissions > 0 ? correctSum / submissions : 0;

  const questionResults: QuestionResults[] = questions.map((q, i) => {
    const counts = res[i + 1] || {};
    return {
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      options: q.options,
      correctIndex: q.correctIndex,
      counts: q.options.map((_, idx) => Number(counts[String(idx)] ?? 0)),
    };
  });

  return NextResponse.json({ submissions, average, questions: questionResults });
}
