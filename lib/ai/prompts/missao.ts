import type { MissaoInput } from "@/lib/ai/schemas";
import type { Chunk } from "@/lib/rag/retriever";
import { blocoContexto } from "./system";

export function buildMissaoPrompt(i: MissaoInput, chunks: Chunk[], descricaoJovem: string): string {
  const alvo = chunks.length
    ? "a habilidade [1]"
    : `a habilidade ${i.skillCode} (${descricaoJovem})`;
  return `${blocoContexto(chunks)}
Crie um quiz de exatamente 4 questões de múltipla escolha sobre ${alvo},
para o ${i.serie}º ano do EM, ambientado em "${i.interesse}" (situações reais desse universo:
ex. futebol → gols, passes, artilharia do interclasse).
Cada questão:
- enunciado: situação concreta, até 280 caracteres, números pequenos (conta de cabeça ou papel).
- alternativas: 4 opções curtas, uma única correta, distratores plausíveis.
- correta: índice 0–3 da alternativa correta.
- respostaCorreta: o texto EXATO da alternativa correta (é usado para conferir o gabarito).
- explicacao: passo a passo em até 3 frases, que ensina o conceito (sem só repetir a resposta).
  Não cite letras nem a posição das alternativas (a ordem será embaralhada).
- Confira cada conta antes de responder: o gabarito precisa estar certo.
Progressão: questão 1 fácil → 4 desafiadora.
titulo: até 60 caracteres, divertido, ligado ao interesse.`;
}
