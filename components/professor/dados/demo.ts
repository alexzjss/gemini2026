import type {
  AffinityProfile,
  ClassGroup,
  Serie,
  Skill,
  SkillLevel,
  Teacher,
} from "@/lib/types";

/**
 * DADOS DE DEMONSTRAÇÃO — só enquanto o seed (Agente 2) não chega.
 *
 * Reproduzem as metas de docs/05 que aparecem na tela do professor:
 * 2º EM A com EM13MAT316 em 70% de defasagem (Kauã em desenvolvimento),
 * top interesses futebol/games/empreendedorismo e 3 alunos em atenção
 * (Bruno + 1 inatividade + 1 notas em queda). Carla no 3º EM A com
 * inatividade. Tudo fictício e determinístico (mesma semente → mesmos dados).
 *
 * Quando `lib/store/selectors.ts` existir, `fonte.ts` deixa de importar este
 * arquivo e ele pode ser apagado.
 */

export const TURMAS: ClassGroup[] = [
  { id: "1A", schoolId: "esc-demo", serie: 1, nome: "1º EM A" },
  { id: "2A", schoolId: "esc-demo", serie: 2, nome: "2º EM A" },
  { id: "3A", schoolId: "esc-demo", serie: 3, nome: "3º EM A" },
];

export const PROFESSOR: Teacher = {
  id: "prof-demo",
  nome: "Prof.ª Helena Duarte",
  disciplina: "Matemática",
  classIds: ["1A", "2A", "3A"],
};

const sk = (code: string, area: Skill["area"], descricaoJovem: string): Skill => ({
  code,
  area,
  areaLabel: ({ MAT: "Matemática", LGG: "Linguagens", CNT: "Natureza", CHS: "Humanas" } as const)[area],
  descricaoJovem,
  chunkId: `bncc-${code}`,
});

/** 16 habilidades de docs/05. `descricaoJovem` é texto nosso, não o oficial. */
export const SKILLS: Skill[] = [
  sk("EM13MAT101", "MAT", "Ler gráficos e taxas de variação"),
  sk("EM13MAT302", "MAT", "Funções do 1º e 2º grau no dia a dia"),
  sk("EM13MAT310", "MAT", "Problemas de contagem e combinações"),
  sk("EM13MAT316", "MAT", "Estatística: média, moda, mediana e desvio"),
  sk("EM13LGG101", "LGG", "Entender como as linguagens criam sentido"),
  sk("EM13LGG303", "LGG", "Debater e defender um ponto de vista com argumento"),
  sk("EM13LGG701", "LGG", "Usar tecnologia digital pra se expressar e produzir"),
  sk("EM13LP01", "LGG", "Relacionar o texto ao contexto em que foi produzido"),
  sk("EM13CNT101", "CNT", "Energia e suas transformações"),
  sk("EM13CNT204", "CNT", "Movimentos na Terra e no espaço"),
  sk("EM13CNT301", "CNT", "Levantar hipóteses e testar com dados"),
  sk("EM13CNT303", "CNT", "Ler divulgação científica com olhar crítico"),
  sk("EM13CHS101", "CHS", "Comparar fontes e narrativas diferentes sobre um fato"),
  sk("EM13CHS401", "CHS", "Trabalho, tecnologia e mudanças sociais"),
  sk("EM13CHS403", "CHS", "Desigualdades no mundo do trabalho"),
  sk("EM13CHS501", "CHS", "Direitos humanos e cidadania"),
];

/** Carreiras (subconjunto de docs/05) com as tags que somam nos interesses. */
export const CARREIRAS: Record<string, { nome: string; tags: string[] }> = {
  "analista-dados-esportivos": { nome: "Analista de dados esportivos", tags: ["futebol", "dados"] },
  "gestor-esports": { nome: "Gestor(a) de equipe de e-sports", tags: ["games"] },
  "dev-games": { nome: "Desenvolvedor(a) de games", tags: ["games", "tecnologia"] },
  "dev-software": { nome: "Desenvolvedor(a) de software", tags: ["tecnologia", "dados"] },
  "designer-ux": { nome: "Designer gráfico/UX", tags: ["design", "redes sociais"] },
  "jornalista-esportivo": { nome: "Jornalista esportivo(a)", tags: ["futebol", "comunicação"] },
  "criador-conteudo": { nome: "Criador(a) de conteúdo/audiovisual", tags: ["redes sociais", "música"] },
  enfermeiro: { nome: "Enfermeiro(a)", tags: ["saúde", "cuidado"] },
  professor: { nome: "Professor(a)", tags: ["educação", "cuidado"] },
  "empreendedor-local": { nome: "Empreendedor(a) de negócio local", tags: ["empreendedorismo"] },
  "marketing-digital": { nome: "Técnico(a) em marketing digital", tags: ["empreendedorismo", "redes sociais"] },
  "educador-fisico": { nome: "Educador(a) físico(a)", tags: ["futebol", "saúde"] },
  "tecnico-meio-ambiente": { nome: "Técnico(a) em meio ambiente", tags: ["meio ambiente", "ciência"] },
};

export interface SkillDemo {
  level: SkillLevel;
  media: number;
  tendencia: "subindo" | "estavel" | "caindo";
}

export interface AlunoDemo {
  id: string;
  matricula: string;
  nome: string;
  inicial: string;
  classId: ClassGroup["id"];
  serie: Serie;
  frequencia: number[];
  ultimoAcessoDiasAtras: number;
  pontos: number;
  galeraConcluido: boolean;
  perfil?: AffinityProfile;
  queroConhecer: string[];
  salvas: string[];
  top4: string[];
  skills: Record<string, SkillDemo>;
  missoes: { skillCode: string; acertos: number; total: number; at: string }[];
}

/* ---------- geração determinística ---------- */

function mulberry32(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(2026);
const entre = (min: number, max: number) => min + rnd() * (max - min);
const inteiro = (min: number, max: number) => Math.floor(entre(min, max + 1));
const escolher = <T,>(lista: T[]) => lista[Math.floor(rnd() * lista.length)];

const NOMES = [
  "Ana Clara", "Yasmin", "Davi", "Maria Eduarda", "Pedro", "Larissa", "Gustavo",
  "Isabelly", "João Vitor", "Emanuelly", "Ryan", "Vitória", "Enzo", "Ketlyn",
  "Sophia", "Luiz Felipe", "Heloísa", "Cauê", "Bianca", "Thiago", "Lorena",
  "Wesley", "Nicole", "Arthur", "Jéssica", "Samuel", "Rebeca", "Lívia",
];

/** Habilidades com avaliação no boletim de cada turma (3 componentes × 2 bimestres). */
const COBERTURA: Record<ClassGroup["id"], string[]> = {
  "1A": ["EM13MAT101", "EM13MAT302", "EM13MAT316", "EM13LGG101", "EM13LGG303", "EM13LP01", "EM13CNT101", "EM13CNT301", "EM13CHS101", "EM13CHS501"],
  "2A": ["EM13MAT316", "EM13MAT310", "EM13MAT101", "EM13LGG701", "EM13LGG303", "EM13CNT301", "EM13CNT204", "EM13CHS101", "EM13CHS401", "EM13LP01"],
  "3A": ["EM13MAT316", "EM13MAT302", "EM13MAT310", "EM13LGG701", "EM13LGG101", "EM13CNT303", "EM13CNT301", "EM13CHS403", "EM13CHS401", "EM13CHS501"],
};

/** Peso de cada carreira ao sortear quero/salva/top4 por turma. */
const CARREIRAS_TURMA: Record<ClassGroup["id"], string[]> = {
  "1A": ["dev-games", "criador-conteudo", "educador-fisico", "designer-ux", "enfermeiro", "dev-software", "professor"],
  "2A": ["analista-dados-esportivos", "jornalista-esportivo", "gestor-esports", "empreendedor-local", "educador-fisico", "marketing-digital", "dev-games"],
  "3A": ["empreendedor-local", "enfermeiro", "dev-software", "marketing-digital", "professor", "tecnico-meio-ambiente", "designer-ux"],
};

function mediaPorNivel(level: SkillLevel) {
  const [min, max] = level === "defasagem" ? [2.6, 4.9] : level === "em_desenvolvimento" ? [5, 6.9] : [7, 9.6];
  return Math.round(entre(min, max) * 10) / 10;
}

function nivelAleatorio(pDef: number, pDev: number): SkillLevel {
  const r = rnd();
  return r < pDef ? "defasagem" : r < pDef + pDev ? "em_desenvolvimento" : "dominada";
}

function perfilAleatorio(): AffinityProfile {
  return {
    analisar: inteiro(15, 90),
    tech: inteiro(15, 90),
    criar: inteiro(15, 90),
    cuidar: inteiro(15, 90),
    negocios: inteiro(15, 90),
    esportes: inteiro(15, 90),
  };
}

function diasAtras(n: number) {
  const d = new Date("2026-11-27T12:00:00-03:00");
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function gerarAluno(i: number, classId: ClassGroup["id"], serie: Serie): AlunoDemo {
  const nome = NOMES[(i * 5 + serie * 3) % NOMES.length];
  const skills: Record<string, SkillDemo> = {};
  for (const code of COBERTURA[classId]) {
    if (rnd() < 0.08) continue; // sem avaliação → "sem dado"
    const level = nivelAleatorio(0.3, 0.38);
    skills[code] = { level, media: mediaPorNivel(level), tendencia: escolher(["subindo", "estavel", "estavel"] as const) };
  }
  const opcoes = CARREIRAS_TURMA[classId];
  // Primeiras carreiras da lista têm mais chance (peso decrescente).
  const sorteia = () => opcoes[Math.min(opcoes.length - 1, Math.floor(rnd() * rnd() * opcoes.length))];
  const galera = rnd() < 0.8;
  const quero = galera ? [sorteia()] : [];
  const salvas = galera ? [...new Set([sorteia(), sorteia()])] : [];
  const top4 = galera ? [...new Set([sorteia(), sorteia(), sorteia(), sorteia()])] : [];
  const nMissoes = inteiro(0, 6);
  const codes = Object.keys(skills);
  return {
    id: `${classId.toLowerCase()}-${String(i + 1).padStart(2, "0")}`,
    matricula: `2026${classId}${String(i + 10).padStart(2, "0")}`,
    nome,
    inicial: nome[0],
    classId,
    serie,
    frequencia: Array.from({ length: 8 }, () => inteiro(84, 96)),
    ultimoAcessoDiasAtras: inteiro(0, 6),
    pontos: inteiro(80, 1150),
    galeraConcluido: galera,
    perfil: galera ? perfilAleatorio() : undefined,
    queroConhecer: quero,
    salvas,
    top4,
    skills,
    missoes: Array.from({ length: nMissoes }, (_, k) => ({
      skillCode: escolher(codes),
      acertos: inteiro(1, 4),
      total: 4,
      at: diasAtras(3 + k * 6),
    })),
  };
}

/* ---------- heróis e metas ---------- */

const KAUA: AlunoDemo = {
  id: "s001",
  matricula: "2026001",
  nome: "Kauã",
  inicial: "K",
  classId: "2A",
  serie: 2,
  frequencia: [92, 88, 95, 90, 85, 93, 90, 91],
  ultimoAcessoDiasAtras: 0,
  pontos: 1240,
  galeraConcluido: false,
  perfil: { analisar: 80, tech: 52, criar: 30, cuidar: 22, negocios: 35, esportes: 76 },
  queroConhecer: [],
  salvas: ["analista-dados-esportivos"],
  top4: [],
  skills: {
    EM13MAT316: { level: "em_desenvolvimento", media: 5.8, tendencia: "subindo" },
    EM13MAT310: { level: "defasagem", media: 4.6, tendencia: "estavel" },
    EM13MAT101: { level: "em_desenvolvimento", media: 6.3, tendencia: "estavel" },
    EM13LGG701: { level: "dominada", media: 8.6, tendencia: "estavel" },
    EM13LGG303: { level: "dominada", media: 8.1, tendencia: "subindo" },
    EM13CNT301: { level: "em_desenvolvimento", media: 6.1, tendencia: "estavel" },
    EM13CHS101: { level: "dominada", media: 7.8, tendencia: "estavel" },
  },
  missoes: [
    { skillCode: "EM13MAT310", acertos: 2, total: 4, at: diasAtras(4) },
    { skillCode: "EM13CNT301", acertos: 3, total: 4, at: diasAtras(11) },
    { skillCode: "EM13MAT316", acertos: 2, total: 4, at: diasAtras(19) },
  ],
};

const BRUNO: AlunoDemo = {
  id: "s002",
  matricula: "2026002",
  nome: "Bruno",
  inicial: "B",
  classId: "2A",
  serie: 2,
  frequencia: [85, 80, 55, 50, 62, 70, 74, 78],
  ultimoAcessoDiasAtras: 1,
  pontos: 1580,
  galeraConcluido: true,
  perfil: { analisar: 48, tech: 70, criar: 40, cuidar: 30, negocios: 66, esportes: 58 },
  queroConhecer: ["jornalista-esportivo"],
  salvas: ["gestor-esports", "empreendedor-local"],
  top4: ["jornalista-esportivo", "gestor-esports", "empreendedor-local", "marketing-digital"],
  skills: {
    EM13MAT316: { level: "defasagem", media: 4.2, tendencia: "subindo" },
    EM13MAT310: { level: "defasagem", media: 3.9, tendencia: "subindo" },
    EM13MAT101: { level: "defasagem", media: 4.4, tendencia: "estavel" },
    EM13LGG701: { level: "em_desenvolvimento", media: 5.5, tendencia: "subindo" },
    EM13LGG303: { level: "defasagem", media: 4.8, tendencia: "estavel" },
    EM13CNT301: { level: "em_desenvolvimento", media: 5.1, tendencia: "subindo" },
    EM13CHS101: { level: "defasagem", media: 4.5, tendencia: "estavel" },
  },
  missoes: [
    { skillCode: "EM13MAT316", acertos: 3, total: 4, at: diasAtras(2) },
    { skillCode: "EM13LGG701", acertos: 4, total: 4, at: diasAtras(6) },
    { skillCode: "EM13CNT301", acertos: 3, total: 4, at: diasAtras(9) },
  ],
};

const CARLA: AlunoDemo = {
  id: "s003",
  matricula: "2026003",
  nome: "Carla",
  inicial: "C",
  classId: "3A",
  serie: 3,
  frequencia: [96, 94, 95, 92, 90, 93, 91, 94],
  ultimoAcessoDiasAtras: 20,
  pontos: 180,
  galeraConcluido: false,
  queroConhecer: [],
  salvas: [],
  top4: [],
  skills: {
    EM13MAT316: { level: "dominada", media: 9.2, tendencia: "estavel" },
    EM13MAT302: { level: "dominada", media: 9.6, tendencia: "estavel" },
    EM13MAT310: { level: "dominada", media: 8.8, tendencia: "estavel" },
    EM13LGG701: { level: "dominada", media: 8.5, tendencia: "estavel" },
    EM13CNT303: { level: "dominada", media: 9.0, tendencia: "estavel" },
    EM13CHS403: { level: "dominada", media: 8.7, tendencia: "estavel" },
  },
  missoes: [],
};

function montarTurma(classId: ClassGroup["id"], serie: Serie, quantos: number, inicio: number) {
  return Array.from({ length: quantos }, (_, i) => gerarAluno(inicio + i, classId, serie));
}

const turma1A = montarTurma("1A", 1, 10, 0);
const gerados2A = montarTurma("2A", 2, 8, 10);
const gerados3A = montarTurma("3A", 3, 9, 20);

// 2º EM A: carreiras fixas para o top de interesses sair futebol, games e
// empreendedorismo (nessa ordem), como no roteiro. 7 dos 8 gerados fizeram o
// Da Galera → 80% da turma com Kauã (em aberto) e Bruno (feito).
const CARREIRAS_2A = [
  "analista-dados-esportivos", "gestor-esports", "empreendedor-local", "educador-fisico",
  "dev-games", "jornalista-esportivo", "marketing-digital", "analista-dados-esportivos",
];
gerados2A.forEach((a, i) => {
  const feito = i !== 7;
  a.galeraConcluido = feito;
  a.perfil = feito ? (a.perfil ?? perfilAleatorio()) : undefined;
  const c = (k: number) => CARREIRAS_2A[(i + k) % CARREIRAS_2A.length];
  a.queroConhecer = feito ? [c(0)] : [];
  a.salvas = feito ? [c(1)] : [];
  a.top4 = feito ? [c(0), c(3)] : [];
  // EM13MAT316: 7 dos 10 em defasagem (Kauã em desenvolvimento, Bruno em defasagem).
  const nivel316: SkillLevel = i < 6 ? "defasagem" : i === 6 ? "em_desenvolvimento" : "dominada";
  a.skills.EM13MAT316 = { level: nivel316, media: mediaPorNivel(nivel316), tendencia: "estavel" };
  for (const s of Object.values(a.skills)) if (s.tendencia === "caindo") s.tendencia = "estavel";
});
turma1A[3].ultimoAcessoDiasAtras = 15;
// Sinal "inatividade" (≥ 14 dias sem entrar).
gerados2A[2].ultimoAcessoDiasAtras = 17;
// Sinal "notas em queda" (≥ 2 habilidades caindo).
{
  const codes = Object.keys(gerados2A[5].skills).slice(0, 2);
  for (const c of codes) gerados2A[5].skills[c].tendencia = "caindo";
}

export const ALUNOS: AlunoDemo[] = [...turma1A, KAUA, BRUNO, ...gerados2A, CARLA, ...gerados3A];
