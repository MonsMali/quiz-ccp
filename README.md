# Alucinações de IA — quiz de sala ao vivo

Quiz de 4 perguntas (pt-PT) para uma sessão de formação de ~10 minutos. Os participantes
lêem o QR code no telemóvel, respondem e vêem a pontuação. O formador projeta os resultados
ao vivo (gráficos de barras estilo Kahoot) e a média da turma.

## Stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Tailwind CSS
- `@upstash/redis` para armazenamento (serverless-safe, funciona no plano gratuito da Vercel)
- `recharts` para os gráficos
- `qrcode.react` para o QR code
- Sem auth, sem base de dados SQL, sem migrações. "Tempo real" via polling (2s).

## Páginas

| Rota | Para quê | Onde se usa |
|------|----------|-------------|
| `/` | Quiz do participante (telemóvel) | scan do QR |
| `/present` | QR + URL + contador de respostas ao vivo | projetar **durante** as respostas |
| `/admin` | Média da turma + gráfico por pergunta + botão Repor | projetar **na revelação**, no fim |

Mantém `/present` e `/admin` separados: assim não projetas as respostas certas enquanto as
pessoas ainda estão a responder.

## Configurar e correr localmente

1. Cria uma base de dados Redis gratuita em <https://console.upstash.com/> e copia o
   **REST URL** e o **REST TOKEN**.
2. Copia `.env.local.example` para `.env.local` e preenche:

   ```env
   UPSTASH_REDIS_REST_URL=https://....upstash.io
   UPSTASH_REDIS_REST_TOKEN=...
   ```

3. Instala e corre:

   ```bash
   npm install
   npm run dev
   ```

4. Abre <http://localhost:3000> (quiz), <http://localhost:3000/present> e
   <http://localhost:3000/admin>.

Se as variáveis de ambiente faltarem, a app não rebenta em silêncio: as rotas devolvem
HTTP 503 com mensagem clara e o ecrã mostra um aviso vermelho.

## Deploy na Vercel

1. Importa o repositório na Vercel.
2. Em **Settings → Environment Variables**, define `UPSTASH_REDIS_REST_URL` e
   `UPSTASH_REDIS_REST_TOKEN` (a integração Upstash da Vercel também os preenche
   automaticamente).
3. Deploy. O QR em `/present` aponta automaticamente para o domínio onde a app está alojada.

## Como funciona o armazenamento (Redis)

Todo o estado vive em Redis (nada em memória, porque o serverless é stateless):

- `aq:counts:{qid}` — hash por pergunta: campo = índice da opção escolhida, valor = nº de votos.
  Para V/F, `1` = Verdadeiro e `0` = Falso, por isso V/F e escolha múltipla partilham a
  mesma estrutura e renderizam duas barras de forma uniforme.
- `aq:stats` — hash global com `submissions` e `correctSum`. Média = `correctSum / submissions`.
- `aq:client:{clientId}` — guarda de dupla submissão (`SET NX`, expira em 24h).

A pontuação é calculada **no servidor** (`/api/submit`); o cliente nunca é fonte de verdade.
A dupla submissão é evitada por uma flag em `localStorage` (bloqueio imediato) mais a guarda
`aq:client:{clientId}` em Redis (à prova de refresh).

## Repor entre sessões

O botão **Repor** em `/admin` (ou `POST /api/reset`) limpa contagens e estatísticas. Não tem
autenticação — destina-se a uso de sala, por isso não partilhes o URL `/admin` publicamente.
