(() => {
'use strict';
const D = window.DATA;
const KEY = 'aluno-ui.v1';

/* ---------------- estado ---------------- */
const fresh = () => ({
  points: 1240,
  answers: D.presetAnswers.slice(),
  pick: null,
  testDone: false,
  careerIdx: 0,
  saved: ['Gestor(a) de equipe de e-sports', 'Técnico(a) em logística'],
  liked: [],
  missionsDone: [],
  skillBonus: {},
  liveWon: [],
  matches: []
});
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch { S = fresh(); }
const save = () => localStorage.setItem(KEY, JSON.stringify(S));

const fmt = (n) => n.toLocaleString('pt-BR');
const level = () => {
  let cur = D.levels[0];
  for (const l of D.levels) if (S.points >= l.min) cur = l;
  const next = D.levels.find((l) => l.n === cur.n + 1);
  return { ...cur, next, missing: next ? next.min - S.points : 0, pct: next ? Math.round((S.points / next.min) * 100) : 100 };
};
const award = (pts, why) => {
  const before = level().n;
  S.points += pts; save();
  const after = level();
  toast(after.n > before ? `Nível ${after.n} desbloqueado! +${pts} pts` : `+${pts} pts · ${why}`);
};
let toastT;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/* ---------------- ícones ---------------- */
const svg = (w, body, extra = '') => `<svg class="ico" width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${extra} aria-hidden="true">${body}</svg>`;
const I = {
  spark: (w = 16) => svg(w, '<path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>', 'stroke-width="2.2" stroke-linejoin="round"'),
  arrow: (w = 18) => svg(w, '<path d="M5 12h14M13 6l6 6-6 6"/>', 'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"'),
  back: (w = 20) => svg(w, '<path d="M19 12H5M11 6l-6 6 6 6"/>', 'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"'),
  x: (w = 20, sw = 2.4) => svg(w, '<path d="M6 6l12 12M18 6L6 18"/>', `stroke-width="${sw}" stroke-linecap="round"`),
  home: (w = 22) => svg(w, '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>', 'stroke-width="2" stroke-linejoin="round"'),
  cards: (w = 22) => svg(w, '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M3 7v10M21 7v10"/>', 'stroke-width="2" stroke-linejoin="round"'),
  target: (w = 22) => svg(w, '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', 'stroke-width="2"'),
  user: (w = 22) => svg(w, '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', 'stroke-width="2" stroke-linecap="round"'),
  bookmark: (w = 16, sw = 2.2) => svg(w, '<path d="M6 3h12v18l-6-4-6 4z"/>', `stroke-width="${sw}" stroke-linejoin="round"`),
  heart: (w = 22) => svg(w, '<path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/>', 'stroke-width="2.4" stroke-linejoin="round"'),
  mic: (w = 20, sw = 2) => svg(w, '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', `stroke-width="${sw}" stroke-linecap="round"`),
  micOff: (w = 30) => svg(w, '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M3 3l18 18"/>', 'stroke-width="2.2" stroke-linecap="round"'),
  cc: (w = 22) => svg(w, '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 12h4M13 12h4M7 15h7"/>', 'stroke-width="2" stroke-linecap="round"'),
  lock: (w = 14, sw = 2.6) => svg(w, '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', `stroke-width="${sw}" stroke-linecap="round"`),
  check: (w = 14, sw = 3.2) => svg(w, '<path d="M5 12l5 5 9-10"/>', `stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`),
  up: (w = 12) => svg(w, '<path d="M12 19V5M5 12l7-7 7 7"/>', 'stroke-width="3.4" stroke-linecap="round"')
};

/* ---------------- shell ---------------- */
const tabs = [
  { r: 'inicio', label: 'Início', ic: I.home },
  { r: 'carreiras', label: 'Carreiras', ic: I.cards },
  { r: 'missoes', label: 'Missões', ic: I.target },
  { r: 'perfil', label: 'Perfil', ic: I.user }
];
const sideLinks = [
  { r: 'inicio', label: 'Início', ic: I.home },
  { r: 'carreiras', label: 'Carreiras', ic: I.cards },
  { r: 'teste', label: 'Da Galera', ic: I.spark },
  { r: 'perfil', label: 'Ficha e mentores', ic: I.user, also: ['missoes'] }
];
function shell(route, inner, { sub } = {}) {
  const L = level();
  const side = `<aside class="side">
    <span class="brand">${esc(D.appName)}</span>
    <nav aria-label="Navegação principal">${sideLinks.map((l) => `<a href="#/${l.r}" ${l.r === route || (l.also || []).includes(route) ? 'aria-current="page"' : ''}>${l.ic(20)}${l.label}</a>`).join('')}</nav>
    <div class="me"><span class="avatar">${D.student.initial}</span><span><strong>${esc(D.student.name)}</strong><span>${sub === 'pts' ? `Nível ${L.n} · ${fmt(S.points)} pts` : D.student.gradeShort}</span></span></div>
  </aside>`;
  const tabbar = `<nav class="tabbar" aria-label="Navegação principal">${tabs.map((t) => `<a href="#/${t.r}" ${t.r === route ? 'aria-current="page"' : ''}><span>${t.ic(22)}</span>${t.label}</a>`).join('')}</nav>`;
  return `<div class="shell">${side}<div class="page">${inner}${tabbar}</div></div>`;
}
const ptsPill = () => `<span class="pill dark">${I.spark()} ${fmt(S.points)}</span>`;
const skillPct = (s) => Math.min(100, s.base + (S.skillBonus[s.code] || 0));

/* ---------------- telas ---------------- */
const V = {};

V.inicio = () => {
  const L = level();
  const answered = S.testDone ? 10 : S.answers.length;
  const left = 10 - answered;
  const nextMission = D.missions.find((m) => !S.missionsDone.includes(m.id));
  const mission = nextMission
    ? `<section aria-label="Missão do dia" class="card-lime">
        <div style="display:flex;justify-content:space-between;align-items:center"><span class="eyebrow">Missão do dia</span><span class="code">${nextMission.code}</span></div>
        <h2 class="d" style="font-size:clamp(24px,2.2vw,30px);line-height:1.1">${esc(nextMission.long)}</h2>
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:8px;padding-top:4px">
          <span style="font-size:14px;font-weight:600">+${nextMission.pts} pts · ${nextMission.min} min</span>
          <a class="btn ink" href="#/missao/${nextMission.id}">Começar ${I.arrow()}</a>
        </div></section>`
    : `<section aria-label="Missão do dia" class="card-lime"><span class="eyebrow">Missão do dia</span><h2 class="d" style="font-size:24px;line-height:1.1">Tudo feito por hoje. Amanhã tem mais.</h2><a class="btn ink" style="align-self:flex-start" href="#/missoes">Ver missões ${I.arrow()}</a></section>`;
  const testMob = S.testDone
    ? `<a class="rowlink" href="#/resultado"><span class="sq">10/10</span><span style="flex:1;display:flex;flex-direction:column;gap:2px"><span style="font-weight:700;font-size:16px">Seu resultado do Da Galera</span><span style="font-size:13px" class="muted">Veja o que combina com você</span></span>${I.arrow(22)}</a>`
    : `<a class="rowlink" href="#/teste"><span class="sq">${answered}/10</span><span style="flex:1;display:flex;flex-direction:column;gap:2px"><span style="font-weight:700;font-size:16px">Continua o Da Galera</span><span style="font-size:13px" class="muted">Faltam ${left} cenário${left > 1 ? 's' : ''}, uns ${Math.max(1, Math.round(left * 0.75))} minuto${left > 1 ? 's' : ''}</span></span>${I.arrow(22)}</a>`;
  const levelCard = (desk) => desk
    ? `<section aria-label="Seu nível" class="card-dark" style="gap:14px"><span class="eyebrow" style="color:var(--muted-dark)">Seu nível</span><span class="d" style="font-size:40px;line-height:1">${L.n} · ${L.name}</span><div class="bar thick on-dark"><i style="width:${L.pct}%"></i></div><span style="font-size:14px;color:var(--muted-dark)">${fmt(S.points)} de ${L.next ? fmt(L.next.min) : '—'}</span><p style="font-size:14px;line-height:1.45;color:var(--muted-dark)">Pontos vêm de missões, frequência e evolução no que você ainda não domina. Nota alta sozinha não conta mais.</p></section>`
    : `<section aria-label="Seu nível" class="card-dark"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="d" style="font-size:22px">Nível ${L.n} · ${L.name}</span><span style="font-size:13px;color:var(--muted-dark)">${fmt(S.points)} / ${L.next ? fmt(L.next.min) : '—'}</span></div><div class="bar thick on-dark"><i style="width:${L.pct}%"></i></div><p style="font-size:13px;line-height:1.4;color:var(--muted-dark)">Seus pontos vêm de esforço: missões, frequência e evolução no que você ainda não domina. Nota alta sozinha não conta mais.</p></section>`;
  const goal = L.next ? `Faltam <strong style="color:var(--ink)">${fmt(L.missing)} pontos</strong> pro nível ${L.next.n}${L.next.n === 4 ? ', que abre os mentores de alta demanda' : ''}.` : 'Você chegou no nível máximo.';
  const testDesk = `<a href="#/${S.testDone ? 'resultado' : 'teste'}" class="tile" style="background:var(--blue);color:#fff;border-radius:24px;padding:24px;gap:12px">
      <span class="eyebrow" style="color:var(--on-blue)">Teste Da Galera</span>
      <span class="d" style="font-size:56px;line-height:1">${answered}<span style="font-size:28px;color:var(--on-blue)">/10</span></span>
      <span style="font-size:15px;line-height:1.45;color:var(--on-blue)">${S.testDone ? 'Pronto! Veja o que combina com você.' : `Faltam ${left} cenário${left > 1 ? 's' : ''}, uns ${Math.max(1, Math.round(left * 0.75))} minutos. Ninguém vai te dar nota aqui.`}</span>
      <span style="margin-top:auto;display:inline-flex;align-items:center;gap:8px;font-weight:700">${S.testDone ? 'Ver resultado' : 'Continuar'} ${I.arrow()}</span></a>`;
  const careerTiles = D.careers.map((c) => `<a href="#/carreiras" class="tile" data-goto-career="${D.careers.indexOf(c)}"><span style="font-size:13px;font-weight:700" class="muted">combina: ${esc(c.why)}</span><span class="t">${esc(c.title)}</span><span class="code sm" style="margin-top:auto">${c.code}</span></a>`).join('');
  const lockTile = L.n >= 4
    ? `<a href="#/perfil" class="tile dashed">${I.check(24, 2.4)}<span class="t">Mentores de alta demanda</span><span class="muted" style="font-size:14px">Abertos pra você. Bora pedir match.</span></a>`
    : `<a href="#/perfil" class="tile dashed">${I.lock(24, 2)}<span class="t">Mentores de alta demanda</span><span class="muted" style="font-size:14px">Abrem no nível 4. Faltam ${fmt(L.missing)} pts.</span></a>`;

  return shell('inicio', `
    <header class="topbar"><span class="brand">${esc(D.appName)}</span><div style="display:flex;align-items:center;gap:8px">${ptsPill()}<a href="#/perfil" class="avatar" aria-label="Abrir meu perfil">${D.student.initial}</a></div></header>
    <main class="content">
      <div class="page-head">
        <div><h1 class="d" style="font-size:40px;line-height:1;letter-spacing:-.02em">E aí, ${esc(D.student.name)}.</h1>
        <p style="margin-top:8px;font-size:15px;line-height:1.45" class="muted">${goal}</p></div>
        <span class="pill dark desk-only" style="font-size:16px;padding:10px 16px">${I.spark(18)} ${fmt(S.points)} pontos</span>
      </div>
      <div class="mob-only stack" style="gap:14px">${levelCard(false)}${mission}${testMob}</div>
      <div class="grid3 desk-only">${levelCard(true)}${mission}${testDesk}</div>
      <section aria-label="Carreiras pra você" class="desk-only">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:14px"><h2 class="d" style="font-size:28px">Carreiras que combinam com você</h2><a href="#/carreiras" style="font-weight:700;font-size:15px">Abrir o swipe</a></div>
        <div class="grid4">${careerTiles}${lockTile}</div>
      </section>
    </main>`);
};

/* ---- teste ---- */
V.teste = () => {
  if (S.testDone) { location.hash = '#/resultado'; return ''; }
  const i = S.answers.length; // índice do cenário atual
  const sc = D.scenarios[i];
  const keys = ['A', 'B', 'C', 'D'];
  const segs = Array.from({ length: 10 }, (_, k) => `<span class="${k < i ? 'done' : k === i ? 'now' : ''}"></span>`).join('');
  const aff = affinities(S.answers).slice(0, 3);
  const last = i === 9;
  return `<div class="on-blue" style="min-height:100vh;min-height:100dvh;display:flex;flex-direction:column">
    <header class="quiz-head">
      <div class="row">
        <a href="#/inicio" class="iconbtn soft exit" aria-label="Sair do teste">${I.x(20)}<span class="desk-only">Sair e continuar depois</span></a>
        <span class="d ttl" style="font-size:18px">Da Galera</span>
        <span class="mob-only" style="font-size:14px;font-weight:700;min-width:44px;text-align:right">${i + 1}/10</span>
      </div>
      <div class="segs" role="progressbar" aria-label="Progresso do teste" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${i + 1}">${segs}</div>
      <span class="count desk-only" style="font-weight:700">Cenário ${i + 1} de 10</span>
    </header>
    <main class="quiz-main" style="flex:1;display:flex;flex-direction:column">
      <div class="quiz-col slide-in" style="flex:1;display:flex;flex-direction:column;gap:18px;padding:24px 20px 0;width:100%;max-width:560px;margin:0 auto" id="qcol">
        <div style="display:flex;flex-direction:column;gap:10px"><span class="tag-lime">${esc(sc.when)}</span><h1 class="quiz-q">${esc(sc.q)}</h1></div>
        <div class="opts" role="radiogroup" aria-label="Escolha uma opção">
          ${sc.a.map((o, k) => `<button type="button" class="opt" role="radio" aria-checked="${S.pick === k}" data-pick="${k}"><span class="k">${keys[k]}</span><span class="l">${esc(o[1])}</span></button>`).join('')}
        </div>
        <div class="quiz-foot" style="margin-top:auto">
          <p>Não tem resposta certa e ninguém vai te dar nota aqui.</p>
          ${S.pick !== null
            ? `<button type="button" class="btn big lime" data-next>${last ? 'Ver meu resultado' : 'Próximo cenário'} ${I.arrow(20)}</button>`
            : `<span class="btn big ghost">Escolha uma opção</span>`}
        </div>
      </div>
      <aside class="quiz-aside" aria-label="O que já apareceu">
        <span class="eyebrow" style="color:var(--muted-dark)">Até agora, você curte</span>
        ${aff.map((a, k) => `<div class="stack" style="gap:6px"><div style="display:flex;justify-content:space-between;font-size:15px;font-weight:${k ? 600 : 700};${k ? 'color:var(--muted-dark)' : ''}"><span>${a.label}</span></div><div class="bar on-dark"><i style="width:${a.pct}%;${k ? 'background:var(--blue-soft)' : ''}"></i></div></div>`).join('')}
        <p>Isso se mistura com a sua ficha BNCC pra sugerir carreiras. Quem decide o caminho é você.</p>
      </aside>
    </main>
  </div>`;
};
function affinities(ans) {
  const count = { org: 0, esp: 0, neg: 0, cri: 0 };
  ans.forEach((k) => count[k]++);
  const max = Math.max(1, ...Object.values(count));
  return Object.keys(count)
    .map((k) => ({ k, label: D.dims[k].label, n: count[k], pct: Math.round(20 + (count[k] / max) * 70) }))
    .sort((a, b) => b.n - a.n);
}

/* ---- resultado ---- */
V.resultado = () => {
  if (!S.testDone) { location.hash = '#/teste'; return ''; }
  const aff = affinities(S.answers);
  const top = aff[0].k;
  const strength = (a) => (a.pct >= 70 ? 'forte' : a.pct >= 45 ? 'médio' : 'leve');
  const paths = [...new Set([...D.dims[aff[0].k].paths, ...D.dims[aff[1].k].paths])].slice(0, 4);
  const tip = D.growTip[top];
  return shell('resultado', `
    <header class="topbar"><a href="#/inicio" class="iconbtn" aria-label="Voltar pro início">${I.back()}</a><span class="pill lime">+50 pts por terminar</span></header>
    <main class="content center-col">
      <div><span class="eyebrow muted">Da Galera · seu resultado</span>
      <h1 class="d" style="margin-top:6px;font-size:clamp(34px,4vw,52px);line-height:1.02;letter-spacing:-.02em">${esc(D.headline[top])}</h1></div>
      <section aria-label="Suas afinidades" class="card stack" style="gap:12px">
        ${aff.map((a) => { const s = strength(a); const hi = s === 'forte'; return `<div class="stack" style="gap:6px"><div style="display:flex;justify-content:space-between;font-size:14px;font-weight:${hi ? 700 : 600};${hi ? '' : 'color:var(--muted)'}"><span>${a.label}</span><span>${s}</span></div><div class="bar"><i class="${hi ? '' : 'soft'}" style="width:${a.pct}%"></i></div></div>`; }).join('')}
      </section>
      <section aria-label="Caminhos que combinam" class="stack">
        <h2 class="d" style="font-size:20px">Caminhos que combinam</h2>
        <div class="chips">${paths.map((p) => `<span class="chip">${esc(p)}</span>`).join('')}</div>
      </section>
      <section aria-label="Habilidade pra destravar" class="card-dark" style="padding:16px;gap:8px">
        <div style="display:flex;align-items:center;gap:8px"><span class="code lime">${tip.code}</span><span style="font-size:13px;color:var(--muted-dark)">em desenvolvimento</span></div>
        <p style="font-size:15px;line-height:1.4;font-weight:600">Pra chegar lá, destrava <span style="color:var(--lime)">${tip.word}</span>${esc(tip.rest)}</p>
      </section>
      <p style="font-size:13px;line-height:1.4" class="muted">Seu boletim mostra de onde você parte, não até onde você vai. Esses caminhos mudam conforme você explora.</p>
      <div style="margin-top:auto;display:flex;flex-direction:column;gap:10px">
        <a href="#/carreiras" class="btn big blue">Ver carreiras ${I.arrow(20)}</a>
        <button type="button" class="btn" data-redo style="background:none;color:var(--muted);text-decoration:underline">Refazer o teste</button>
      </div>
    </main>`);
};

/* ---- carreiras ---- */
V.carreiras = () => {
  const n = D.careers.length;
  const i = S.careerIdx % n;
  const c = D.careers[i];
  const L = level();
  const savedLabel = `${S.saved.length} <span class="mob-only">salvas</span><span class="desk-only">carreiras salvas</span>`;
  const card = `<div class="deck">
      <div class="behind" aria-hidden="true"></div>
      <article class="ccard" aria-label="${esc(c.title)}" id="ccard">
        <div class="head theme-${c.theme}">
          <div class="r"><span class="eyebrow">${i + 1} de ${n} hoje</span><span class="why">combina: ${esc(c.why)}</span></div>
          <h2>${esc(c.title)}</h2>
        </div>
        <div class="body">
          <div class="stack"><span class="eyebrow muted">Raio-x de um dia</span>${c.day.map((d) => `<div class="dayrow"><b>${d[0]}</b><span>${esc(d[1])}</span></div>`).join('')}</div>
          <div class="school mob-only"><span class="code">${c.code}</span><span><strong>Onde a escola aparece:</strong> ${esc(c.schoolShort)}</span></div>
          <a href="#/live/${i}" class="voice mob-only">${I.mic(20)} Perguntar por voz pra um mentor simulado</a>
        </div>
        <span class="stamp yes" id="stampY">Quero!</span><span class="stamp no" id="stampN">Passo</span>
      </article>
    </div>`;
  const actions = `<div class="actions">
      <button type="button" class="round l" data-swipe="pass" aria-label="Passar">${I.x(26, 2.6)}</button>
      <button type="button" class="round m" data-swipe="save" aria-label="Salvar pra depois" aria-pressed="${S.saved.includes(c.title)}">${I.bookmark(22, 2.4)}</button>
      <button type="button" class="likebtn" data-swipe="match">${I.heart()} Quero conhecer</button>
    </div>`;
  const matched = S.matches.includes(c.mentor);
  const side = `<div class="b carr-side">
      <section aria-label="Onde a escola aparece" class="card-dark" style="padding:22px;gap:10px"><span class="eyebrow" style="color:var(--muted-dark)">Onde a escola aparece</span><span class="code lime">${c.code}</span><p>${esc(c.school)}</p><span style="font-size:14px;color:var(--lime)">${esc(c.status)}</span></section>
      <section aria-label="Formação e mercado" class="card stack" style="border-radius:24px;padding:22px;gap:12px">
        <div class="stack" style="gap:4px"><span class="eyebrow muted">Como chegar</span><span style="font-size:15px;line-height:1.45">${esc(c.path)}</span></div>
        <div class="stack" style="gap:4px"><span class="eyebrow muted">Quanto ganha</span><span style="font-size:15px;font-weight:700;border:2px dashed var(--ink);border-radius:10px;padding:8px 10px;align-self:flex-start">${esc(D.salary)}</span></div>
      </section>
      <a href="#/live/${i}" class="live-cta"><span class="mi">${I.mic(24, 2.2)}</span><span class="stack" style="gap:2px"><span style="font-weight:800;font-size:17px">Conversar por voz com um mentor simulado</span><span style="font-size:14px">Gemini Live · tira dúvida e faz um mini-desafio valendo pontos</span></span></a>
      <section aria-label="Mentores reais" class="card stack" style="border-radius:24px;padding:18px 22px;gap:12px">
        <span class="eyebrow muted">Mentores reais dessa área</span>
        <div class="mrow"><span class="av">${c.mentorInitial}</span><span class="grow"><strong>${esc(c.mentor)}</strong><br><span class="muted">perfil ilustrativo · disponível</span></span><button type="button" data-match="${esc(c.mentor)}" ${matched ? 'disabled' : ''}>${matched ? 'Pedido enviado' : 'Pedir match'}</button></div>
        <div class="mrow"><span class="av lock">${I.lock(16, 2.4)}</span><span class="grow"><strong>${esc(c.bigTech)}</strong><br><span class="muted">perfil ilustrativo · ${L.n >= 4 ? 'disponível' : 'abre no nível 4'}</span></span>${L.n >= 4 ? `<button type="button" data-match="${esc(c.bigTech)}" ${S.matches.includes(c.bigTech) ? 'disabled' : ''}>${S.matches.includes(c.bigTech) ? 'Pedido enviado' : 'Pedir match'}</button>` : ''}</div>
      </section>
    </div>`;
  return shell('carreiras', `
    <header class="topbar"><h1 class="d" style="font-size:28px;letter-spacing:-.01em">Carreiras</h1><span class="pill outline">${I.bookmark()} ${savedLabel}</span></header>
    <main class="content" style="padding-bottom:0">
      <div class="page-head desk-only"><div><h1>Carreiras</h1><p>Escolhidas pelo que você curte no Da Galera e pela sua ficha BNCC.</p></div><span class="pill outline">${I.bookmark()} ${savedLabel}</span></div>
      <div class="two carr-two">
        <div class="a" style="flex:1;display:flex;flex-direction:column;max-width:480px;width:100%">${card}${actions}</div>
        ${side}
      </div>
    </main>`, { sub: 'pts' });
};
function swipe(kind) {
  const c = D.careers[S.careerIdx % D.careers.length];
  if (kind === 'save' || kind === 'match') {
    if (!S.saved.includes(c.title)) S.saved.push(c.title);
  }
  if (kind === 'match' && !S.liked.includes(c.title)) {
    S.liked.push(c.title); S.careerIdx++; save(); award(10, 'explorou uma carreira');
  } else {
    S.careerIdx++; save();
    if (kind === 'save') toast('Salva pra depois');
  }
}
function flyCard(kind) {
  const el = document.getElementById('ccard');
  if (!el) return swipe(kind);
  const dx = kind === 'pass' ? -1 : 1;
  el.classList.add('fly');
  el.style.transform = kind === 'save' ? 'translateY(-120%) rotate(-4deg)' : `translateX(${dx * 130}%) rotate(${dx * 18}deg)`;
  el.style.opacity = '0';
  setTimeout(() => { swipe(kind); render(); }, 300);
}
function bindDrag() {
  const el = document.getElementById('ccard'); if (!el) return;
  const y = document.getElementById('stampY'), n = document.getElementById('stampN');
  let x0 = null, dx = 0, id = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a,button')) return;
    x0 = e.clientX; dx = 0; id = e.pointerId; el.setPointerCapture(id); el.classList.add('dragging');
  });
  el.addEventListener('pointermove', (e) => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    el.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
    y.style.opacity = Math.max(0, Math.min(1, dx / 90));
    n.style.opacity = Math.max(0, Math.min(1, -dx / 90));
  });
  const end = () => {
    if (x0 === null) return;
    x0 = null; el.classList.remove('dragging');
    if (dx > 110) flyCard('match');
    else if (dx < -110) flyCard('pass');
    else { el.classList.add('fly'); el.style.transform = ''; y.style.opacity = 0; n.style.opacity = 0; setTimeout(() => el.classList.remove('fly'), 350); }
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

/* ---- live (mentor simulado) ---- */
let live = null;
V.live = (arg) => {
  const ci = Math.max(0, Math.min(D.careers.length - 1, parseInt(arg, 10) || 0));
  const c = D.careers[ci];
  if (!live || live.ci !== ci) {
    live = { ci, t0: Date.now(), mic: true, cc: true, msgs: [], won: S.liveWon.includes(c.title), tries: 0 };
    live.msgs.push({ me: true, text: c.title.includes('dados') ? 'Mas precisa ser bom em mat pra isso?' : 'Como é o dia a dia de verdade?' });
    live.queue = [c.live.intro, c.live.challenge];
  }
  const L = level();
  return `<div class="dark"><div class="live">
    <header style="display:flex;align-items:center;justify-content:space-between;padding:20px 20px 0">
      <a href="#/carreiras" class="iconbtn" aria-label="Voltar pras carreiras">${I.back()}</a>
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;background:var(--char);border-radius:999px;padding:8px 12px"><span class="recdot"></span>Ao vivo · <span id="clock">00:00</span></span>
    </header>
    <section aria-label="Mentor" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:22px 20px 0;text-align:center">
      <span class="eyebrow" style="color:var(--muted-dark)">Mentor simulado · Gemini Live</span>
      <h1 class="d" style="font-size:28px;line-height:1.05">${esc(c.title)}</h1>
      <div class="wave ${live.mic ? '' : 'muted'}" id="wave" aria-hidden="true">${Array.from({ length: 12 }, () => '<span style="height:10px"></span>').join('')}</div>
    </section>
    <section aria-label="Legenda da conversa" class="bubbles" id="bubbles" aria-live="polite" ${live.cc ? '' : 'hidden'}></section>
    <div id="ccoff" style="flex:1;display:${live.cc ? 'none' : 'flex'};align-items:center;justify-content:center;color:var(--muted-dark);font-size:14px">Legendas desligadas</div>
    <form class="reply" id="reply" autocomplete="off">
      <label class="sr" for="say">Sua resposta</label>
      <input id="say" placeholder="${live.mic ? 'Fala ou digita sua resposta…' : 'Microfone mudo · digita aqui'}" ${live.won ? 'disabled' : ''}>
      <button type="submit" ${live.won ? 'disabled' : ''}>Enviar</button>
    </form>
    <div class="live-ctrl">
      <button type="button" class="c" data-cc aria-pressed="${live.cc}" aria-label="Ligar ou desligar legendas">${I.cc()}</button>
      <button type="button" class="mic" data-mic aria-pressed="${live.mic}" aria-label="${live.mic ? 'Microfone ligado' : 'Microfone desligado'}">${live.mic ? I.mic(30, 2.2) : I.micOff()}</button>
      <a href="#/carreiras" class="c end" aria-label="Encerrar conversa" data-end>${I.x(22, 2.6)}</a>
    </div>
    <footer class="disclaimer">${I.lock(22, 2)}<p>Isso é uma simulação por IA. ${L.n >= 4 ? 'Um mentor de verdade já está aberto pra você em <a href="#/perfil">Ficha e mentores</a>.' : `Um(a) profissional de verdade abre no <a href="#/missoes">nível 4</a>.`}</p></footer>
  </div></div>`;
};
let liveTimers = [];
function liveMount() {
  const c = D.careers[live.ci];
  const box = document.getElementById('bubbles');
  const draw = () => {
    box.innerHTML = live.msgs.map((m) => m.chip
      ? `<div class="challenge ${m.won ? 'won' : ''}"><span class="code sm">${c.code}</span>${esc(m.text)}</div>`
      : `<div class="bub ${m.me ? 'me' : ''} ${m.typing ? 'typing' : ''}">${m.me ? esc(m.text) : bold(m.text)}</div>`).join('');
    box.scrollTop = box.scrollHeight;
  };
  const say = (text, after) => {
    live.msgs.push({ text: '…', typing: true }); draw();
    liveTimers.push(setTimeout(() => { live.msgs.pop(); live.msgs.push({ text }); draw(); after && after(); }, 900 + text.length * 12));
  };
  const flush = () => {
    if (!live.queue.length) return;
    const t = live.queue.shift();
    say(t, () => {
      if (!live.queue.length && !live.won && !live.msgs.some((m) => m.chip)) { live.msgs.push({ chip: true, text: 'Mini-desafio: +20 pts se você explicar' }); draw(); }
      flush();
    });
  };
  draw(); flush();

  const clock = document.getElementById('clock');
  const wave = document.getElementById('wave');
  const tick = () => {
    const s = Math.floor((Date.now() - live.t0) / 1000);
    clock.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    [...wave.children].forEach((b, k) => { b.style.height = live.mic && k < 10 ? (10 + Math.random() * 58) + 'px' : '10px'; });
  };
  tick(); liveTimers.push(setInterval(tick, 300));

  document.getElementById('reply').addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = document.getElementById('say');
    const v = inp.value.trim(); if (!v || live.won) return;
    inp.value = '';
    live.msgs.push({ me: true, text: v }); draw();
    const ok = c.live.keys.some((k) => v.toLowerCase().includes(k));
    live.tries++;
    if (ok || live.tries >= 3) {
      say(ok ? c.live.good : 'Quase! ' + c.live.good, () => {
        live.won = true;
        const chip = live.msgs.find((m) => m.chip); if (chip) { chip.won = true; chip.text = ok ? 'Mini-desafio completo · +20 pts' : 'Desafio explicado · tenta outro mentor'; }
        draw();
        if (ok && !S.liveWon.includes(c.title)) { S.liveWon.push(c.title); S.skillBonus[c.code] = (S.skillBonus[c.code] || 0) + 5; save(); award(20, 'mini-desafio'); }
        render();
      });
    } else say(c.live.hint);
  });
}
function liveUnmount() { liveTimers.forEach((t) => { clearTimeout(t); clearInterval(t); }); liveTimers = []; }

/* ---- perfil (ficha BNCC) ---- */
const tiersHtml = () => {
  const L = level();
  return `<div class="tiers">${D.mentorTiers.map((t) => {
    const open = L.n >= t.level;
    const sub = open ? (t.open || `aberto no nível ${t.level}`) : `nível ${t.level} · faltam ${fmt(D.levels.find((l) => l.n === t.level).min - S.points)} pts`;
    return `<div class="tier ${open ? '' : 'locked'}"><span class="ic">${open ? I.check() : I.lock()}</span><span style="flex:1"><strong>${t.title}</strong><br><span class="sub">${sub}</span></span></div>`;
  }).join('')}</div>`;
};
const earnHtml = (desk) => `<div class="earn">${D.earn.map((e) => `<div><b>+${e.pts}</b><span>${desk ? e.desk : e.mobile}</span></div>`).join('')}</div>`;
V.perfil = () => {
  const L = level();
  const openMissions = (code) => D.missions.filter((m) => m.code === code && !S.missionsDone.includes(m.id)).length;
  const strong = D.skills.strong.map((s) => `<div class="skill card ${s.deskOnly ? 'desk-only' : ''}" style="padding:12px 14px;border-radius:16px"><div class="top"><span class="code light">${s.code}</span><span style="font-size:12px" class="muted">${s.area}</span></div><span class="txt">${s.text}</span></div>`).join('');
  const grow = D.skills.grow.map((s) => {
    const om = openMissions(s.code);
    const note = (S.skillBonus[s.code] ? 'subiu esta semana' : s.note);
    const hot = s.hot || S.skillBonus[s.code];
    return `<div class="skill card ${s.deskOnly ? 'desk-only' : ''}" style="padding:12px 14px;border-radius:16px;gap:8px"><div class="top"><span class="code">${s.code}</span><span style="font-size:12px" class="muted">${s.area}</span></div><span class="txt">${s.text}</span><div class="prog"><div class="bar"><i style="width:${skillPct(s)}%"></i></div><span class="note ${hot ? 'hot' : ''} mob-only">${note}</span></div><span class="note ${hot ? 'hot' : ''} desk-only">${note}${om ? ` · ${om} miss${om > 1 ? 'ões abertas' : 'ão aberta'}` : ''}</span></div>`;
  }).join('');
  return shell('perfil', `
    <header class="topbar" style="gap:14px;padding-bottom:12px"><span class="avatar d" style="width:56px;height:56px;font-size:24px">${D.student.initial}</span><div style="flex:1;display:flex;flex-direction:column;gap:2px"><h1 class="d" style="font-size:24px;line-height:1.1">${esc(D.student.name)}</h1><span style="font-size:14px" class="muted">${D.student.grade}</span></div><span class="pill dark" style="font-size:13px">Nível ${L.n}</span></header>
    <main class="content">
      <div class="page-head"><div><h2 class="d mob-only" style="font-size:26px;letter-spacing:-.01em">Sua ficha BNCC</h2><h1 class="desk-only">Sua ficha BNCC</h1>
        <p style="font-size:13px;line-height:1.4;margin-top:4px" class="muted">Montada a partir do boletim e das suas missões. Mostra de onde você parte, nunca limita pra onde você vai.<span class="desk-only"> Seu professor vê essa mesma ficha pra planejar as aulas.</span></p></div></div>
      <div class="two">
        <div class="a" style="display:flex;flex-direction:column;gap:14px">
          <section aria-label="Você já manda bem" class="stack"><h3 class="h-sec"><span class="dot lime">${I.check(12, 3.4)}</span>Você já manda bem</h3><div class="stack">${strong}</div></section>
          <section aria-label="Bora destravar" class="stack"><h3 class="h-sec"><span class="dot blue">${I.up()}</span>Bora destravar</h3><div class="stack">${grow}</div></section>
          <a href="#/missoes" class="mob-only btn" style="margin-top:4px;justify-content:space-between;min-height:52px;background:var(--lime);border:2px solid var(--ink);border-radius:16px;box-shadow:4px 4px 0 var(--ink);color:var(--ink)">Ver missões pra essas habilidades ${I.arrow(20)}</a>
        </div>
        <div class="b desk-only">
          <section aria-label="Seu nível" class="card-dark"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="d" style="font-size:24px">Nível ${L.n} · ${L.name}</span><span style="font-size:14px;color:var(--muted-dark)">${fmt(S.points)} / ${L.next ? fmt(L.next.min) : '—'}</span></div><div class="bar thick on-dark"><i style="width:${L.pct}%"></i></div>${earnHtml(true).replace('class="earn"', 'class="earn" style="color:var(--ink)"')}</section>
          <section aria-label="Mentores que você destrava" class="stack"><h2 class="d" style="font-size:22px">Mentores que você destrava</h2>${tiersHtml()}</section>
          <section aria-label="Missões abertas" class="stack"><h2 class="d" style="font-size:22px">Missões abertas</h2>${missionsHtml()}</section>
        </div>
      </div>
    </main>`);
};
const missionsHtml = () => D.missions.map((m, k) => {
  const done = S.missionsDone.includes(m.id);
  const featured = !done && D.missions.findIndex((x) => !S.missionsDone.includes(x.id)) === k;
  return `<a href="#/missao/${m.id}" class="mission ${featured ? 'featured' : ''} ${done ? 'done' : ''}"><span style="flex:1;display:flex;flex-direction:column;gap:4px"><span class="code sm">${m.code}</span><span class="t">${esc(m.title)}</span></span><span style="font-weight:800;font-size:15px">${done ? I.check(18) + ' feita' : '+' + m.pts}</span></a>`;
}).join('');

/* ---- missões ---- */
V.missoes = () => shell('missoes', `
  <header class="topbar"><h1 class="d" style="font-size:28px;letter-spacing:-.01em">Missões</h1>${ptsPill()}</header>
  <main class="content" style="gap:16px">
    <div class="page-head desk-only"><div><h1>Missões</h1><p>Pontos vêm de esforço, não só de nota.</p></div>${ptsPill()}</div>
    <section aria-label="Como você ganha pontos" class="stack"><h2 style="font-size:14px;font-weight:700">Pontos vêm de esforço, não só de nota</h2>${earnHtml(false)}</section>
    <section aria-label="Missões abertas" class="stack"><h2 style="font-size:14px;font-weight:700">Abertas pra você</h2>${missionsHtml()}</section>
    <section aria-label="Mentores por nível" class="stack"><h2 style="font-size:14px;font-weight:700">Mentores que você destrava</h2>${tiersHtml()}</section>
  </main>`);

/* ---- uma missão (exercício) ---- */
let mstate = null;
V.missao = (id) => {
  const m = D.missions.find((x) => x.id === id);
  if (!m) { location.hash = '#/missoes'; return ''; }
  if (!mstate || mstate.id !== id) mstate = { id, step: 0, chosen: null, right: 0 };
  const done = mstate.step >= m.steps.length;
  const already = S.missionsDone.includes(m.id);
  let body;
  if (done) {
    body = `<div class="card-lime"><span class="eyebrow">Missão completa</span><h2 class="d" style="font-size:28px;line-height:1.1">${mstate.right} de ${m.steps.length} de primeira.</h2><p style="font-size:15px;line-height:1.45">${already ? 'Os pontos dessa missão já foram pra sua conta.' : `+${m.pts} pts pela missão e sua ficha em ${m.code} subiu.`}</p></div>
      <a href="#/perfil" class="btn big blue">Ver minha ficha ${I.arrow(20)}</a><a href="#/missoes" class="btn" style="color:var(--muted);text-decoration:underline">Voltar pras missões</a>`;
  } else {
    const st = m.steps[mstate.step];
    const answered = mstate.chosen !== null;
    body = `<div class="segs" style="grid-template-columns:repeat(${m.steps.length},1fr)">${m.steps.map((_, k) => `<span style="background:${k < mstate.step ? 'var(--ink)' : k === mstate.step ? 'var(--blue)' : 'var(--track)'}"></span>`).join('')}</div>
      <h2 class="d slide-in" style="font-size:clamp(24px,2.6vw,34px);line-height:1.1">${esc(st.q)}</h2>
      <div class="mq-opts" role="radiogroup" aria-label="Escolha uma resposta">${st.opts.map((o, k) => {
        let cls = ''; if (answered) { if (k === st.ok) cls = 'right'; else if (k === mstate.chosen) cls = 'wrong'; }
        return `<button type="button" class="opt ${cls}" role="radio" aria-checked="${mstate.chosen === k}" data-ans="${k}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`;
      }).join('')}</div>
      ${answered ? `<div class="feedback" style="background:${mstate.chosen === st.ok ? 'var(--white)' : '#fde2df'};border:2px solid var(--ink)">${mstate.chosen === st.ok ? 'Isso! ' : 'Não foi dessa vez. '}${esc(st.why)}</div>
        <button type="button" class="btn big lime" data-mnext style="margin-top:auto">${mstate.step === m.steps.length - 1 ? 'Concluir missão' : 'Próxima'} ${I.arrow(20)}</button>` : ''}`;
  }
  return shell('missoes', `
    <header class="topbar"><a href="#/missoes" class="iconbtn" aria-label="Voltar pras missões">${I.back()}</a><span class="code">${m.code}</span></header>
    <main class="content center-col">
      <div><span class="eyebrow muted">Missão · +${m.pts} pts · ${m.min} min</span><h1 class="d" style="margin-top:6px;font-size:clamp(28px,3.4vw,44px);line-height:1.04;letter-spacing:-.02em">${esc(m.title)}</h1></div>
      ${body}
    </main>`);
};

/* ---------------- roteador ---------------- */
let current = '';
function render() {
  const [route, arg] = (location.hash.replace(/^#\/?/, '') || 'inicio').split('/');
  const view = V[route] || V.inicio;
  if (current === 'live' && route !== 'live') { liveUnmount(); live = null; }
  if (route !== 'missao') mstate = null;
  if (current === 'live' && route === 'live') liveUnmount();
  const html = view(arg);
  if (!html) return;
  const app = document.getElementById('app');
  const scrollKeep = route === current ? window.scrollY : 0;
  app.innerHTML = html;
  window.scrollTo(0, scrollKeep);
  document.body.style.background = route === 'teste' ? 'var(--blue)' : route === 'live' ? 'var(--ink)' : 'var(--paper)';
  current = route;
  document.title = `${({ inicio: 'Início', teste: 'Teste Da Galera', resultado: 'Resultado do Da Galera', carreiras: 'Carreiras', live: 'Mentor simulado', perfil: 'Ficha BNCC', missoes: 'Missões', missao: 'Missão' })[route] || 'Início'} — ${D.appName}`;
  if (route === 'carreiras') bindDrag();
  if (route === 'live') liveMount();
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-pick],[data-next],[data-swipe],[data-match],[data-redo],[data-cc],[data-mic],[data-ans],[data-mnext],[data-goto-career]');
  if (!t) return;
  if (t.dataset.pick !== undefined) { S.pick = +t.dataset.pick; save(); render(); document.querySelector(`[data-pick="${S.pick}"]`)?.focus(); }
  else if (t.dataset.next !== undefined) {
    const sc = D.scenarios[S.answers.length];
    S.answers.push(sc.a[S.pick][0]); S.pick = null;
    if (S.answers.length >= 10) { S.testDone = true; save(); award(50, 'terminou o Da Galera'); location.hash = '#/resultado'; }
    else { save(); render(); }
  }
  else if (t.dataset.redo !== undefined) { S.answers = []; S.pick = null; S.testDone = false; save(); location.hash = '#/teste'; }
  else if (t.dataset.swipe) flyCard(t.dataset.swipe);
  else if (t.dataset.match) { if (!S.matches.includes(t.dataset.match)) { S.matches.push(t.dataset.match); save(); } toast('Pedido de match enviado'); render(); }
  else if (t.dataset.goToCareer !== undefined || t.dataset.gotoCareer !== undefined) { S.careerIdx = +(t.dataset.gotoCareer); save(); }
  else if (t.dataset.cc !== undefined) { live.cc = !live.cc; const b = document.getElementById('bubbles'); b.hidden = !live.cc; document.getElementById('ccoff').style.display = live.cc ? 'none' : 'flex'; t.setAttribute('aria-pressed', live.cc); }
  else if (t.dataset.mic !== undefined) { live.mic = !live.mic; t.setAttribute('aria-pressed', live.mic); t.setAttribute('aria-label', live.mic ? 'Microfone ligado' : 'Microfone desligado'); t.innerHTML = live.mic ? I.mic(30, 2.2) : I.micOff(); document.getElementById('wave').classList.toggle('muted', !live.mic); document.getElementById('say').placeholder = live.mic ? 'Fala ou digita sua resposta…' : 'Microfone mudo · digita aqui'; }
  else if (t.dataset.ans !== undefined) {
    const m = D.missions.find((x) => x.id === mstate.id);
    mstate.chosen = +t.dataset.ans;
    if (mstate.chosen === m.steps[mstate.step].ok) mstate.right++;
    render();
  }
  else if (t.dataset.mnext !== undefined) {
    const m = D.missions.find((x) => x.id === mstate.id);
    mstate.step++; mstate.chosen = null;
    if (mstate.step >= m.steps.length && !S.missionsDone.includes(m.id)) {
      S.missionsDone.push(m.id);
      S.skillBonus[m.code] = (S.skillBonus[m.code] || 0) + 15;
      save(); award(m.pts, 'missão completa');
    }
    render();
  }
});
document.addEventListener('keydown', (e) => {
  if (current === 'carreiras' && !e.target.closest('input')) {
    if (e.key === 'ArrowLeft') flyCard('pass');
    if (e.key === 'ArrowRight') flyCard('match');
  }
  if (current === 'teste' && /^[a-dA-D]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
    S.pick = 'abcd'.indexOf(e.key.toLowerCase()); save(); render();
  }
});
window.addEventListener('hashchange', render);
window.resetAluno = () => { localStorage.removeItem(KEY); S = fresh(); render(); };
render();
})();
