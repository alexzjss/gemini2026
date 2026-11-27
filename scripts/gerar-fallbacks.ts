/**
 * npm run fallbacks — grava respostas REAIS da IA em data/fallbacks/*.json para o roteiro da demo.
 *
 * Uso: em um terminal, `npm run dev` com GEMINI_API_KEY; em outro, `npm run fallbacks`.
 * (BASE_URL=https://preview... npm run fallbacks também funciona.)
 *
 * Só grava respostas com source "ai"; as chaves "default" (escritas à mão) nunca são sobrescritas.
 * Diagnóstico, Da Galera e Match dos heróis usam o seed + lib/domain; se ainda não existirem,
 * essas rotas são puladas com aviso.
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const ROOT = process.cwd();
const DIR = path.join(ROOT, "data/fallbacks");
const agora = () => new Date().toISOString();
const HEROIS = ["s001", "s002", "s003"];

type Json = Record<string, unknown>;
let gravadas = 0;
let puladas = 0;

async function chamar<T = Json>(rota: string, body: unknown): Promise<{ data: T; source: string } | null> {
  try {
    const r = await fetch(`${BASE}/api/${rota}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      console.warn(`  ⚠️  ${rota}: HTTP ${r.status} ${await r.text()}`);
      return null;
    }
    return (await r.json()) as { data: T; source: string };
  } catch (e) {
    console.error(`  ❌ ${rota}: ${(e as Error).message} — o app está rodando em ${BASE}?`);
    return null;
  }
}

function gravar(arquivo: string, chave: string, valor: unknown) {
  if (chave === "default") throw new Error("não sobrescrevo default");
  const file = path.join(DIR, `${arquivo}.json`);
  const atual = JSON.parse(fs.readFileSync(file, "utf8")) as Json;
  atual[chave] = valor;
  fs.writeFileSync(file, `${JSON.stringify(atual, null, 2)}\n`);
  gravadas++;
  console.log(`  ✓ ${arquivo}.json → ${chave}`);
}

function pular(motivo: string) {
  puladas++;
  console.warn(`  – ${motivo}`);
}

/* ---------------- missão ---------------- */
async function missoes() {
  console.log("missao");
  const casos: [string, string, string][] = [
    ["EM13MAT316:futebol", "EM13MAT316", "futebol"],
    ["EM13MAT316:games", "EM13MAT316", "games"],
    ["EM13MAT310:futebol", "EM13MAT310", "futebol"],
    ["EM13CNT301:futebol", "EM13CNT301", "futebol"],
    ["EM13MAT316", "EM13MAT316", "escola"],
  ];
  for (const [chave, skillCode, interesse] of casos) {
    const r = await chamar<{ titulo: string; questoes: { enunciado: string; alternativas: string[]; correta: number; explicacao: string }[] }>(
      "missao",
      { skillCode, interesse, serie: 2 },
    );
    if (r?.source !== "ai") { pular(`${chave}: veio do fallback`); continue; }
    gravar("missao", chave, {
      titulo: r.data.titulo,
      questoes: r.data.questoes.map(({ enunciado, alternativas, correta, explicacao }) => ({ enunciado, alternativas, correta, explicacao })),
    });
  }
}

/* ---------------- mentor simulado (roteiro de 3 turnos) ---------------- */
async function mentor() {
  console.log("mentor-simulado");
  const careerId = "analista-dados-esportivos";
  const skillCode = "EM13MAT316";
  const falasAluno = [
    "Como é o seu dia a dia no clube?",
    "Massa! Me mostra como você usa isso na prática?",
    "A média dá 1,2 gol por jogo, mas não conta tudo: ele zerou em dois jogos.",
  ];
  const historico: { role: "aluno" | "mentor"; texto: string; at: string }[] = [];
  let desafioAberto: { skillCode: string; enunciado: string } | undefined;
  const respostas: Json[] = [];
  for (const fala of falasAluno) {
    historico.push({ role: "aluno", texto: fala, at: agora() });
    const r = await chamar<{ fala: string; miniDesafio?: { skillCode: string; enunciado: string }; desafioResolvido?: boolean }>(
      "mentor-simulado",
      { careerId, skillCode, serie: 2, historico, desafioAberto },
    );
    if (r?.source !== "ai") { pular("mentor: veio do fallback — mantendo o roteiro escrito à mão"); return; }
    respostas.push(r.data);
    historico.push({ role: "mentor", texto: r.data.fala, at: agora() });
    if (r.data.miniDesafio) desafioAberto = r.data.miniDesafio;
    if (r.data.desafioResolvido) desafioAberto = undefined;
  }
  // O roteiro offline precisa abrir o desafio no turno 2 e resolvê-lo no 3.
  if (!(respostas[1] as { miniDesafio?: unknown }).miniDesafio || (respostas[2] as { desafioResolvido?: boolean }).desafioResolvido !== true) {
    pular("mentor: a IA não seguiu o roteiro desafio→resolução — mantendo o roteiro escrito à mão");
    return;
  }
  respostas.forEach((r, i) => gravar("mentor", `${careerId}:${i + 1}`, r));
}

/* ---------------- plano de aula ---------------- */
async function planos() {
  console.log("plano-aula");
  for (const interesse of ["futebol", "games"]) {
    const r = await chamar<Json>("plano-aula", {
      classId: "2A",
      skillCode: "EM13MAT316",
      interesse,
      distribuicao: { defasagem: 70, em_desenvolvimento: 20, dominada: 10 },
      nAlunos: 10,
    });
    if (r?.source !== "ai") { pular(`plano ${interesse}: veio do fallback`); continue; }
    const { titulo, objetivo, etapas, avaliacao, adaptacoes, seloEtico } = r.data;
    gravar("plano", `2A:EM13MAT316:${interesse}`, { titulo, objetivo, etapas, avaliacao, adaptacoes, seloEtico });
  }
}

/* ---------------- heróis: diagnóstico, Da Galera, match ---------------- */
type Axis = "analisar" | "tech" | "criar" | "cuidar" | "negocios" | "esportes";
const EIXOS: Axis[] = ["analisar", "tech", "criar", "cuidar", "negocios", "esportes"];

function cos(a: Record<Axis, number>, b: Record<Axis, number>) {
  let d = 0, na = 0, nb = 0;
  for (const e of EIXOS) { d += a[e] * b[e]; na += a[e] ** 2; nb += b[e] ** 2; }
  return na && nb ? d / Math.sqrt(na * nb) : 0;
}

function lerSeed<T>(nome: string): T | null {
  const f = path.join(ROOT, "data/seed", `${nome}.json`);
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as T) : null;
}

async function herois() {
  console.log("diagnostico / galera / match (heróis)");
  const students = lerSeed<Json[]>("students");
  const reportCards = lerSeed<Json[]>("report-cards");
  const skills = lerSeed<{ code: string; descricaoJovem: string }[]>("skills");
  const careers = lerSeed<{ id: string; nome: string; skills: string[]; affinity: Record<Axis, number> }[]>("careers");
  if (!students?.length || !reportCards?.length || !skills?.length || !careers?.length) {
    pular("seed incompleto (rode npm run seed) — heróis pulados");
    return;
  }
  let diagnostico: { skillStatuses: (rc: unknown, overrides: unknown) => { code: string; level: string; media: number; tendencia: string; progresso: number }[] };
  try {
    diagnostico = await import("../lib/domain/diagnostico");
  } catch {
    pular("lib/domain/diagnostico ainda não existe — heróis pulados");
    return;
  }
  const desc = (code: string) => skills.find((s) => s.code === code)?.descricaoJovem ?? code;

  for (const id of HEROIS) {
    const st = students.find((s) => s.id === id) as
      | { id: string; serie: 1 | 2 | 3; frequencia: number[]; missoesSeed: number; evolucoesSeed: number; galeraSeed?: { perfil: Record<Axis, number>; queroConhecer: string[]; salvas: string[] } }
      | undefined;
    if (!st) { pular(`${id} não está no seed`); continue; }
    const statuses = diagnostico.skillStatuses(reportCards.find((r) => r.studentId === id), {});

    const d = await chamar("diagnostico", {
      studentId: id,
      serie: st.serie,
      skills: statuses.map((s) => ({ code: s.code, level: s.level, descricaoJovem: desc(s.code) })),
    });
    if (d?.source === "ai") gravar("diagnostico", id, d.data); else pular(`diagnostico ${id}: fallback`);

    // Perfil do herói: o do seed ou, para o Kauã (teste parcial), o perfil típico do roteiro.
    const perfil = st.galeraSeed?.perfil ?? { analisar: 85, tech: 45, criar: 30, cuidar: 20, negocios: 25, esportes: 80 };
    const top = [...careers].sort((a, b) => cos(perfil, b.affinity) - cos(perfil, a.affinity)).slice(0, 4);
    const statusDe = (code: string) => statuses.find((s) => s.code === code)?.level ?? "em_desenvolvimento";
    const destravarCode = top[0].skills.find((c) => statusDe(c) !== "dominada") ?? top[0].skills[0];
    const g = await chamar("galera", {
      studentId: id,
      perfil,
      top4: top.map((c) => ({ id: c.id, nome: c.nome, skills: c.skills })),
      destravar: { code: destravarCode, descricaoJovem: desc(destravarCode), status: statusDe(destravarCode) },
    });
    if (g?.source === "ai") {
      const data = g.data as { porQueCombina: Record<string, string>; destravarTexto: string };
      gravar("galera", id, { ...data, modelo: "Combina com {combina}: tem tudo a ver com as suas escolhas no Da Galera." });
    } else pular(`galera ${id}: fallback`);

    const freq = st.frequencia.reduce((a, b) => a + b, 0) / st.frequencia.length;
    const m = await chamar<{ eligible: boolean; explicacao?: string; perguntasSugeridas?: string[] }>("match", {
      snapshot: {
        studentId: id,
        serie: st.serie,
        nivel: id === "s003" ? 1 : 4,
        perfil,
        top4: top.map((c) => c.id),
        salvas: [],
        queroConhecer: st.galeraSeed?.queroConhecer ?? [top[0].id],
        preferenciasMentor: [],
        skills: statuses,
        evolucoes: st.evolucoesSeed + (id === "s001" ? 1 : 0),
        missoes: st.missoesSeed + (id === "s001" ? 1 : 0),
        frequenciaMedia: Math.round(freq),
        galeraConcluido: true,
      },
    });
    if (m?.source === "ai" && m.data.eligible && m.data.explicacao) {
      gravar("match", id, { explicacao: m.data.explicacao, perguntasSugeridas: m.data.perguntasSugeridas });
    } else pular(`match ${id}: fallback ou não elegível`);
  }
}

async function main() {
  console.log(`Gerando fallbacks reais via ${BASE}\n`);
  await missoes();
  await mentor();
  await planos();
  await herois();
  console.log(`\n${gravadas} respostas gravadas, ${puladas} puladas. Revise o diff antes de commitar.`);
}

main();
