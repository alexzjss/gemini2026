// npm run seed — gera data/seed/students.json e report-cards.json (determinístico, mulberry32(2026))
// e valida as metas de docs/05. Sai com erro se alguma meta não bater.
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { AffinityProfile, Assessment, ClassGroup, ReportCard, Serie, Student } from "../lib/types";
import { buildClassView, buildStudentView, localState } from "../lib/store/selectors";
import { carregarSeed, SEED_DIR } from "./seed-data";
import { AGORA, roteiroKaua } from "./roteiro-kaua";

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMES = [
  "Ana Clara", "Beatriz", "Caio", "Daniel", "Eduarda", "Felipe", "Gabriel", "Giovanna", "Gustavo", "Heitor",
  "Isabela", "João Pedro", "Júlia", "Kevin", "Larissa", "Lucas", "Luana", "Marcela", "Mateus", "Maria Eduarda",
  "Miguel", "Nicole", "Otávio", "Pedro Henrique", "Rafaela", "Rayssa", "Samuel", "Sofia", "Thiago", "Vitória",
  "Wesley", "Yasmin", "Arthur", "Bianca", "Davi", "Emily", "Enzo", "Lívia", "Ryan", "Stefany",
];
const SOBRENOMES = ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Almeida", "Gomes", "Ferreira"];

/** As 6 habilidades avaliadas no boletim de cada aluno (2 avaliações por habilidade, 1 por bimestre). */
const SKILLS_BOLETIM = ["EM13MAT316", "EM13MAT310", "EM13LGG701", "EM13LGG303", "EM13CHS101", "EM13CNT301"];
const COMPONENTE: Record<string, string> = { MAT: "Matemática", LGG: "Língua Portuguesa", CHS: "História", CNT: "Biologia" };

type Notas = Record<string, [number, number]>; // code → [bim1, bim2]

const r1 = (x: number) => Math.round(Math.min(10, Math.max(0, x)) * 10) / 10;

function boletim(studentId: string, notas: Notas, skillsDesc: Map<string, string>): ReportCard {
  const avaliacoes: Assessment[] = [];
  for (const code of SKILLS_BOLETIM)
    notas[code].forEach((nota, i) => {
      const b = (i + 1) as 1 | 2;
      avaliacoes.push({
        id: `${studentId}-${code}-b${b}`,
        componente: COMPONENTE[code.slice(4, 7)] ?? "Componente",
        titulo: `Avaliação ${b} – ${skillsDesc.get(code)}`,
        bimestre: b,
        nota,
        skillCodes: [code],
      });
    });
  return { studentId, avaliacoes };
}

const ARQUETIPOS: Record<string, AffinityProfile> = {
  futebol: { analisar: 65, tech: 35, criar: 30, cuidar: 25, negocios: 30, esportes: 85 },
  games: { analisar: 40, tech: 85, criar: 60, cuidar: 15, negocios: 35, esportes: 20 },
  negocios: { analisar: 50, tech: 35, criar: 45, cuidar: 25, negocios: 85, esportes: 15 },
  cuidar: { analisar: 30, tech: 15, criar: 40, cuidar: 85, negocios: 20, esportes: 35 },
  criar: { analisar: 20, tech: 55, criar: 85, cuidar: 30, negocios: 35, esportes: 20 },
  natureza: { analisar: 55, tech: 20, criar: 20, cuidar: 50, negocios: 15, esportes: 80 },
};

/** Gerados da 2A, escritos para bater as metas da demo (MAT316 70%, 3 alertas, interesses). */
const PLANO_2A: { arq: string; quero: string[]; salvas: string[]; mat316: "def" | "ok"; extra?: "inativo" | "queda" }[] = [
  { arq: "futebol", quero: ["jornalista-esportivo"], salvas: ["analista-dados-esportivos"], mat316: "def" },
  { arq: "futebol", quero: ["analista-dados-esportivos"], salvas: ["jornalista-esportivo"], mat316: "def" },
  { arq: "games", quero: ["dev-games"], salvas: ["gestor-esports"], mat316: "def" },
  { arq: "games", quero: ["gestor-esports"], salvas: [], mat316: "def" },
  { arq: "negocios", quero: ["empreendedor-local"], salvas: ["tecnico-adm-marketing"], mat316: "def" },
  { arq: "futebol", quero: [], salvas: ["jornalista-esportivo"], mat316: "def" },
  { arq: "games", quero: [], salvas: ["dev-games"], mat316: "ok", extra: "inativo" },
  { arq: "cuidar", quero: ["enfermeiro"], salvas: [], mat316: "ok", extra: "queda" },
];

export function gerar() {
  const base = carregarSeed({ students: [], reportCards: [] });
  const rnd = mulberry32(2026);
  const entre = (a: number, b: number) => a + rnd() * (b - a);
  const inteiro = (a: number, b: number) => Math.floor(entre(a, b + 1));
  const escolhe = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];
  const desc = new Map(base.skills.map((s) => [s.code, s.descricaoJovem]));

  const students: Student[] = [];
  const reportCards: ReportCard[] = [];

  // ---------- Heróis (à mão, docs/05) ----------
  students.push(
    {
      id: "s001", matricula: "2026001", nome: "Kauã Oliveira", inicial: "K", classId: "2A", serie: 2, hero: "kaua",
      frequencia: [92, 88, 95, 90, 85, 93, 90, 91], frequenciaProjetada: [90, 88, 92, 90, 70, 72, 90, 88],
      ultimoAcessoDiasAtras: 1, pontosSeed: 1240, missoesSeed: 3, evolucoesSeed: 1,
      galeraParcialSeed: { g01: "A", g02: "A", g03: "D", g04: "A", g05: "A", g06: "A" },
    },
    {
      id: "s002", matricula: "2026002", nome: "Bruno Santos", inicial: "B", classId: "2A", serie: 2, hero: "bruno",
      frequencia: [85, 80, 78, 80, 55, 50, 70, 78], frequenciaProjetada: [82, 85, 84, 86, 88, 85, 87, 90],
      ultimoAcessoDiasAtras: 2, pontosSeed: 1580, missoesSeed: 14, evolucoesSeed: 5,
      galeraSeed: { perfil: { analisar: 35, tech: 30, criar: 25, cuidar: 60, negocios: 70, esportes: 85 }, queroConhecer: ["educador-fisico"], salvas: ["gestor-esports"] },
    },
    {
      id: "s003", matricula: "2026003", nome: "Carla Ribeiro", inicial: "C", classId: "3A", serie: 3, hero: "carla",
      frequencia: [96, 95, 97, 94, 96, 95, 93, 96], frequenciaProjetada: [95, 96, 94, 95, 96, 95, 94, 96],
      ultimoAcessoDiasAtras: 20, pontosSeed: 180, missoesSeed: 0, evolucoesSeed: 0,
    },
  );
  reportCards.push(
    boletim("s001", {
      EM13MAT316: [5.2, 6.4], EM13MAT310: [4.4, 4.8], EM13LGG701: [8.2, 8.6],
      EM13LGG303: [8.0, 8.4], EM13CHS101: [7.6, 8.0], EM13CNT301: [5.9, 6.3],
    }, desc),
    boletim("s002", {
      EM13MAT316: [4.0, 4.6], EM13MAT310: [3.6, 4.2], EM13LGG701: [5.0, 5.6],
      EM13LGG303: [4.4, 4.8], EM13CHS101: [5.2, 5.8], EM13CNT301: [3.8, 4.4],
    }, desc),
    boletim("s003", {
      EM13MAT316: [9.2, 9.4], EM13MAT310: [8.6, 8.8], EM13LGG701: [9.4, 9.6],
      EM13LGG303: [9.0, 9.2], EM13CHS101: [8.5, 8.9], EM13CNT301: [9.1, 9.3],
    }, desc),
  );

  // ---------- Gerados ----------
  let n = 4;
  const nomesUsados = new Set(["Kauã", "Bruno", "Carla"]);
  const novoNome = () => {
    let nome: string;
    do nome = escolhe(NOMES); while (nomesUsados.has(nome));
    nomesUsados.add(nome);
    return `${nome} ${escolhe(SOBRENOMES)}`;
  };
  const freqOk = () => Array.from({ length: 8 }, () => inteiro(84, 97));
  const perfilDe = (arq: string): AffinityProfile => {
    const p = { ...ARQUETIPOS[arq] };
    for (const k of Object.keys(p) as (keyof AffinityProfile)[]) p[k] = Math.max(0, Math.min(100, Math.round(p[k] + entre(-8, 8))));
    return p;
  };
  const notasDe = (habilidade: number, mat316?: "def" | "ok", queda = false): Notas => {
    const notas: Notas = {};
    SKILLS_BOLETIM.forEach((code, i) => {
      let m = r1(habilidade + entre(-1.5, 1.5));
      if (code === "EM13MAT316" && mat316 === "def") m = r1(entre(3.0, 4.6));
      if (code === "EM13MAT316" && mat316 === "ok") m = r1(entre(5.4, 7.6));
      const d = queda && i >= 2 && i <= 3 ? -1.6 : entre(-0.4, 0.4);
      notas[code] = [r1(m - d / 2), r1(m + d / 2)];
    });
    return notas;
  };

  const gerarAluno = (classId: ClassGroup["id"], serie: Serie, opts: { perfil?: AffinityProfile; quero?: string[]; salvas?: string[]; mat316?: "def" | "ok"; extra?: "inativo" | "queda" }) => {
    const id = `s${String(n).padStart(3, "0")}`;
    const nome = novoNome();
    const s: Student = {
      id, matricula: `2026${String(n).padStart(3, "0")}`, nome, inicial: nome[0], classId, serie,
      frequencia: freqOk(), frequenciaProjetada: freqOk(),
      ultimoAcessoDiasAtras: opts.extra === "inativo" ? 16 : inteiro(0, 6),
      pontosSeed: inteiro(10, 140) * 10, missoesSeed: inteiro(0, 10), evolucoesSeed: inteiro(0, 4),
      ...(opts.perfil ? { galeraSeed: { perfil: opts.perfil, queroConhecer: opts.quero ?? [], salvas: opts.salvas ?? [] } } : {}),
    };
    students.push(s);
    reportCards.push(boletim(id, notasDe(entre(5, 8.5), opts.mat316, opts.extra === "queda"), desc));
    n++;
  };

  for (const p of PLANO_2A) gerarAluno("2A", 2, { perfil: perfilDe(p.arq), quero: p.quero, salvas: p.salvas, mat316: p.mat316, extra: p.extra });

  const arqs = Object.keys(ARQUETIPOS);
  const outras: [ClassGroup["id"], Serie, number][] = [["1A", 1, 10], ["3A", 3, 9]];
  for (const [classId, serie, qtd] of outras)
    for (let i = 0; i < qtd; i++) {
      const fez = rnd() < 0.7;
      if (!fez) { gerarAluno(classId, serie, {}); continue; }
      const perfil = perfilDe(escolhe(arqs));
      const ids = base.careers.map((c) => c.id);
      gerarAluno(classId, serie, { perfil, quero: rnd() < 0.5 ? [escolhe(ids)] : [], salvas: [escolhe(ids)] });
    }

  return { students, reportCards };
}

export function validar(gerados: ReturnType<typeof gerar>): string[] {
  const seed = carregarSeed(gerados);
  const st = localState();
  const erros: string[] = [];
  const checa = (ok: boolean, msg: string) => { if (!ok) erros.push(msg); };

  checa(seed.students.length === 30, `esperava 30 alunos, veio ${seed.students.length}`);
  for (const c of ["1A", "2A", "3A"]) checa(seed.students.filter((s) => s.classId === c).length === 10, `turma ${c} sem 10 alunos`);

  const turma = buildClassView(seed, st, "2A", AGORA);
  const mat = turma.defasagem.find((d) => d.code === "EM13MAT316");
  checa(mat?.defasagem === 7 && mat.total === 10, `2A EM13MAT316: esperava 7/10 em defasagem, veio ${mat?.defasagem}/${mat?.total}`);
  checa(turma.resumo.maiorDefasagem?.code === "EM13MAT316", `maior defasagem da 2A deveria ser EM13MAT316, veio ${turma.resumo.maiorDefasagem?.code}`);
  const top3 = turma.topInteresses.slice(0, 3).map((t) => t.tag).join(",");
  checa(top3 === "futebol,games,empreendedorismo", `top interesses 2A: esperava futebol,games,empreendedorismo, veio ${top3}`);
  const alertas = turma.atencao.map((a) => a.student.id).sort();
  checa(alertas.length === 3 && alertas.includes("s002"), `2A: esperava 3 alertas incluindo Bruno, veio ${alertas.join(",")}`);

  const kaua = buildStudentView(seed, st, "s001", AGORA);
  const lv = (code: string) => kaua.snapshot.skills.find((s) => s.code === code);
  checa(lv("EM13MAT316")?.level === "em_desenvolvimento" && lv("EM13MAT316")?.media === 5.8 && lv("EM13MAT316")?.tendencia === "subindo", "Kauã EM13MAT316 deveria ser 5,8 em desenvolvimento subindo");
  checa(lv("EM13MAT310")?.level === "defasagem" && lv("EM13MAT310")?.media === 4.6, "Kauã EM13MAT310 deveria ser 4,6 defasagem");
  for (const c of ["EM13LGG701", "EM13LGG303", "EM13CHS101"]) checa(lv(c)?.level === "dominada", `Kauã ${c} deveria ser dominada`);
  checa(lv("EM13CNT301")?.level === "em_desenvolvimento" && lv("EM13CNT301")?.media === 6.1, "Kauã EM13CNT301 deveria ser 6,1 em desenvolvimento");
  checa(kaua.pontos === 1240 && kaua.nivel === 3 && kaua.faltam === 260, `Kauã: esperava 1.240 pts, nível 3, faltam 260; veio ${kaua.pontos}/${kaua.nivel}/${kaua.faltam}`);
  checa(kaua.galera.respondidos === 6, `Kauã deveria ter 6/10 no Da Galera, veio ${kaua.galera.respondidos}`);
  checa(kaua.missaoDoDia?.code === "EM13MAT316", `missão do dia do Kauã deveria ser EM13MAT316, veio ${kaua.missaoDoDia?.code}`);

  const bruno = buildStudentView(seed, st, "s002", AGORA);
  checa(bruno.nivel === 4, `Bruno deveria estar no nível 4, veio ${bruno.nivel}`);
  const carla = buildStudentView(seed, st, "s003", AGORA);
  checa(carla.nivel === 1 && carla.snapshot.skills.every((s) => s.level === "dominada"), "Carla deveria ser nível 1 com tudo dominado");
  const t3 = buildClassView(seed, st, "3A", AGORA);
  checa(t3.atencao.some((a) => a.student.id === "s003" && a.sinais.some((x) => x.tipo === "inatividade")), "Carla deveria ter sinal de inatividade");

  const r = roteiroKaua(seed);
  checa(r.final.pontos === 1520 && r.final.nivel === 4, `roteiro do Kauã: esperava 1.520 pts nível 4, veio ${r.final.pontos}/${r.final.nivel}`);
  checa(r.match.eligible && r.match.mentorId === "m01", `roteiro do Kauã: match esperado m01 (analista do clube), veio ${JSON.stringify(r.match)}`);
  return erros;
}

const ehMain = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/gerar-seed.ts");
if (ehMain) {
  const g = gerar();
  const erros = validar(g);
  if (erros.length) {
    console.error("Seed NÃO bate as metas de docs/05:\n- " + erros.join("\n- "));
    process.exit(1);
  }
  const studentsJson = JSON.stringify(g.students, null, 2) + "\n";
  const cardsJson = JSON.stringify(g.reportCards, null, 2) + "\n";
  writeFileSync(SEED_DIR + "students.json", studentsJson);
  writeFileSync(SEED_DIR + "report-cards.json", cardsJson);
  const hash = createHash("sha256").update(studentsJson + cardsJson).digest("hex").slice(0, 12);
  console.log(`Seed ok: ${g.students.length} alunos, ${g.reportCards.length} boletins · hash ${hash}`);
}
