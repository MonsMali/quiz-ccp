import { Question } from '@/types';

// Conteúdo do quiz "Alucinações de IA" (pt-PT), introduzido verbatim.
//
// Perguntas Verdadeiro/Falso: por convenção de armazenamento, index 1 = Verdadeiro,
// index 0 = Falso (boolean -> index). Assim as perguntas V/F partilham a mesma
// estrutura de contagem (aq:counts) das de escolha múltipla e o código dos gráficos
// mantém-se uniforme (dois "options", duas barras).
const TF_OPTIONS = ['Falso', 'Verdadeiro'];

export const questions: Question[] = [
  {
    id: 'q1',
    type: 'truefalse',
    prompt:
      'Uma ferramenta de IA conversacional pode apresentar informação falsa com total confiança, como se fosse verdadeira.',
    options: TF_OPTIONS,
    correctIndex: 1, // correct: true
    why: 'A IA gera texto plausível, não verifica a verdade, por isso pode afirmar falsidades com confiança.',
  },
  {
    id: 'q2',
    type: 'mc',
    prompt: "O que é uma 'alucinação' de IA?",
    options: [
      'Quando a IA fica lenta e bloqueia.',
      'Quando a IA gera informação que parece credível mas é falsa ou inventada.',
      'Quando a IA se recusa a responder.',
      'Quando a IA precisa de ligação à internet para funcionar.',
    ],
    correctIndex: 1,
    why: 'Alucinação = resposta com aparência credível mas falsa ou inventada.',
  },
  {
    id: 'q3',
    type: 'mc',
    prompt: 'Qual destas situações tem MAIOR risco de alucinação?',
    options: [
      'Pedir um resumo de um texto que tu próprio forneces.',
      'Pedir uma citação exata, data ou estatística específica sobre um tema de nicho.',
      'Pedir ideias para um título.',
      'Pedir para reescrever uma frase de forma mais formal.',
    ],
    correctIndex: 1,
    why: 'Factos específicos sobre temas de nicho são o maior risco; resumir texto fornecido é baixo risco.',
  },
  {
    id: 'q4',
    type: 'truefalse',
    prompt:
      'Se a IA indicar uma fonte ou um link, podes assumir que essa fonte existe e está correta sem a verificar.',
    options: TF_OPTIONS,
    correctIndex: 0, // correct: false
    why: 'A IA pode inventar fontes e links. Verifica sempre.',
  },
];

// Lookup O(1) para scoring server-side.
export const questionsById: Record<string, Question> = Object.fromEntries(
  questions.map((q) => [q.id, q]),
);
