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
  // Guarda de dupla submissao por cliente (SET NX).
  client: (clientId: string) => `aq:client:${clientId}`,
  // Lista de chaves a apagar num reset.
  all: (qIds: string[]) => [
    'aq:stats',
    ...qIds.map((id) => `aq:counts:${id}`),
  ],
};
