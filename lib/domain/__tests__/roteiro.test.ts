import { describe, expect, it } from "vitest";
import { roteiroKaua, AGORA } from "../../../scripts/roteiro-kaua";
import { buildClassView, buildStudentView, localState } from "../../store/selectors";
import { seed } from "./fixtures";

describe("roteiro do Kauã (integração do domínio)", () => {
  const r = roteiroKaua(seed);
  const pts = Object.fromEntries(r.passos.map((p) => [p.passo, p.pontos]));

  it("1.240 → 1.290 → 1.300 → 1.320 → 1.430 → 1.520", () => {
    expect(pts).toEqual({ inicio: 1240, galera: 1290, swipe: 1300, "mentor-simulado": 1320, missao: 1430, semestre: 1520 });
  });

  it("começa no nível 3 e termina no nível 4", () => {
    expect(r.passos[0].nivel).toBe(3);
    expect(r.final.nivel).toBe(4);
  });

  it("missão inicial e sugestões batem o design", () => {
    expect(r.missaoInicial).toBe("EM13MAT316");
    expect(r.sugestoesIniciais).toEqual(["EM13MAT310", "EM13CNT301"]);
  });

  it("resultado do Da Galera: frase, eixos e caminho nº 1", () => {
    expect(r.resultado?.frase).toBe("Você curte organizar o caos com números.");
    expect(r.resultado?.caminhos[0].id).toBe("analista-dados-esportivos");
    expect(r.resultado?.destravar?.code).toBe("EM13MAT316");
  });

  it("Big Tech aparece bloqueado (nível 4) e a analista do clube aberta no detalhe", () => {
    const big = r.mentoresDetalhe.find((m) => m.mentor.id === "m10")!;
    const clube = r.mentoresDetalhe.find((m) => m.mentor.id === "m01")!;
    expect(big.aberto).toBe(false);
    expect(clube.aberto).toBe(true);
  });

  it("missão aprovada sobe EM13MAT316 para dominada", () => {
    expect(r.missao.override?.level).toBe("dominada");
    expect(r.final.snapshot.skills.find((s) => s.code === "EM13MAT316")?.level).toBe("dominada");
  });

  it("Match Day: elegível e match com a analista do clube (m01)", () => {
    expect(r.presenca.reduce((s, e) => s + e.pontos, 0)).toBe(90);
    expect(r.match.eligible).toBe(true);
    if (r.match.eligible) expect(r.match.mentorId).toBe("m01");
  });

  it("professor vê a célula do Kauã mudar ao vivo", () => {
    const antes = buildClassView(seed, localState(), "2A", AGORA);
    const depois = buildClassView(seed, r.state, "2A", AGORA);
    const cel = (t: typeof antes) => t.heatmap.linhas.find((l) => l.code === "EM13MAT316")!.celulas.find((c) => c.studentId === "s001")!.level;
    expect(cel(antes)).toBe("em_desenvolvimento");
    expect(cel(depois)).toBe("dominada");
  });

  it("contraste: Bruno nível 4 com notas baixas; Carla nível 1 com notas altas", () => {
    const bruno = buildStudentView(seed, localState(), "s002", AGORA);
    const carla = buildStudentView(seed, localState(), "s003", AGORA);
    expect(bruno.nivel).toBe(4);
    expect(bruno.snapshot.skills.filter((s) => s.level === "defasagem").length).toBeGreaterThanOrEqual(3);
    expect(carla.nivel).toBe(1);
    expect(carla.mentores.find((m) => m.mentor.id === "m10")?.aberto).toBe(false);
    expect(carla.mentores).toHaveLength(seed.mentors.length);
  });
});
