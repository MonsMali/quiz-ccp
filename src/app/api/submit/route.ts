import { NextRequest, NextResponse } from 'next/server';
import { isRedisConfigured, getRedis, keys, REDIS_MISSING_MESSAGE } from '@/lib/redis';
import { questions, questionsById } from '@/data/quiz';
import { SubmitBody } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!isRedisConfigured()) {
    console.error(REDIS_MISSING_MESSAGE);
    return NextResponse.json({ success: false, error: REDIS_MISSING_MESSAGE }, { status: 503 });
  }

  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ success: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const { clientId, answers } = body;
  if (!clientId || typeof clientId !== 'string') {
    return NextResponse.json({ success: false, error: 'clientId em falta.' }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return NextResponse.json(
      { success: false, error: `É necessário responder a ${questions.length} perguntas.` },
      { status: 400 },
    );
  }

  // Pontuação autoritativa no servidor (não confiamos no cliente).
  const perQuestion = answers.map((a) => {
    const q = questionsById[a.questionId];
    const correct = !!q && q.correctIndex === a.selectedIndex;
    return { id: a.questionId, correct };
  });
  const score = perQuestion.filter((p) => p.correct).length;

  const redis = getRedis();

  // Ronda atual: a guarda de dupla submissão é por ronda, para que um "Repor"
  // (que incrementa a ronda) deixe o mesmo dispositivo voltar a contar.
  const round = Number((await redis.get(keys.round)) ?? 0);

  // Guarda de dupla submissão: SET NX. Se a chave já existir, este cliente já submeteu.
  const guard = await redis.set(keys.client(round, clientId), 1, { nx: true, ex: 60 * 60 * 24 });
  if (guard === null) {
    return NextResponse.json({
      success: true,
      alreadySubmitted: true,
      score,
      total: questions.length,
      perQuestion,
    });
  }

  // Incrementa contagens + estatísticas numa pipeline.
  const pipe = redis.pipeline();
  for (const a of answers) {
    const q = questionsById[a.questionId];
    if (!q) continue;
    if (Number.isInteger(a.selectedIndex) && a.selectedIndex >= 0 && a.selectedIndex < q.options.length) {
      pipe.hincrby(keys.counts(a.questionId), String(a.selectedIndex), 1);
    }
  }
  pipe.hincrby(keys.stats, 'submissions', 1);
  pipe.hincrby(keys.stats, 'correctSum', score);
  await pipe.exec();

  return NextResponse.json({
    success: true,
    score,
    total: questions.length,
    perQuestion,
  });
}
