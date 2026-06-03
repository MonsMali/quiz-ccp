import { Redis } from '@upstash/redis';

export const REDIS_MISSING_MESSAGE =
  'Redis nao configurado. Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.';

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!isRedisConfigured()) {
    throw new Error(REDIS_MISSING_MESSAGE);
  }
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    });
  }
  return client;
}

// Todas as chaves usam o prefixo "aq:" (Alucinacoes Quiz).
export const keys = {
  // Hash por pergunta: campo = indice da opcao escolhida, valor = contagem.
  counts: (qid: string) => `aq:counts:${qid}`,
  // Hash global: campos "submissions" e "correctSum".
  stats: 'aq:stats',
  // Contador de ronda. O "Repor" incrementa-o; serve para que cada dispositivo
  // perceba que comecou uma nova sessao e limpe a sua flag local de "ja submeteu".
  round: 'aq:round',
  // Guarda de dupla submissao por cliente, por ronda (SET NX). Como inclui a ronda,
  // um "Repor" deixa o mesmo dispositivo voltar a contar numa sessao nova.
  client: (round: number, clientId: string) => `aq:client:${round}:${clientId}`,
  // Lista de chaves de contagem a apagar num reset (a ronda e incrementada a parte).
  all: (qIds: string[]) => [
    'aq:stats',
    ...qIds.map((id) => `aq:counts:${id}`),
  ],
};
