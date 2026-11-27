# 09 — Design System

Extraído dos protótipos em `/design` (Claude Design). É a referência visual de **todas** as telas, inclusive as que ainda não têm protótipo (login, consentimento, quiz, Match Day, mentor simulado em texto, professor). Implementado como **tema MUI** em `lib/theme.ts`.

## Personalidade

Neo-brutalista, jovem e confiante: blocos chapados de cor, **bordas pretas de 2px**, **sombra sólida deslocada** (sem blur), tipografia display pesada, cantos bem arredondados. Parece app de jovem, não sistema escolar. Frases curtas e diretas ("E aí, Kauã.", "Bora destravar").

## Tokens de cor

| Token | Hex | Uso |
|---|---|---|
| `paper` | `#F4F1EA` | Fundo padrão das telas (creme) |
| `ink` | `#16150F` | Texto principal, bordas, cards escuros, botão primário escuro |
| `surface` | `#FFFFFF` | Cards claros, barra de navegação, opções |
| `blue` | `#3045F0` | Cor de marca: fundo do Da Galera, avatar, CTA principal, barras fortes |
| `blueSoft` | `#8F9BF5` | Barras de afinidade "médio" |
| `blueTint` | `#DCE1FF` | Texto secundário sobre azul |
| `lime` | `#CFF24A` | Destaque: missão do dia, chips de código BNCC, progresso, item ativo da navegação |
| `muted` | `#59564C` | Texto secundário sobre creme/branco |
| `mutedOnInk` | `#C9C5B8` | Texto secundário sobre tinta |
| `track` | `#E7E3D8` | Trilho de barras em fundo claro |
| `trackOnInk` | `#3A3830` | Trilho de barras em fundo escuro |
| `inkRaised` | `#2A2922` | Superfícies elevadas dentro de cards escuros |
| `inkBorder` | `#4A483F` | Bordas dentro de cards escuros |
| `danger` | `#E2483D` | Indicador "ao vivo"; alertas do professor (uso mínimo) |
| `mutedDim` | `#8A8670` | Texto desabilitado |

Contraste: `ink` sobre `lime`, `paper` e `surface` passa AA; `white` sobre `blue` passa AA (texto ≥ 16px/bold). **Nunca** usar `lime` como texto sobre `paper`.

### Níveis de habilidade (ficha, heatmap)
- `dominada` → `blue` (texto branco)
- `em_desenvolvimento` → `blueSoft` (texto `ink`)
- `defasagem` → `lime` com borda `ink` (texto `ink`) — **amarelo de "bora destravar", nunca vermelho** (não estigmatizar)
- sem dado → `track`

### Sinais de evasão (só professor)
- `atencao` → ponto `#E2483D` + texto `ink` "Vale uma conversa"
- `acompanhando` → ponto `blue`
- Sem fundos vermelhos, sem ícones de alerta grandes.

## Tipografia

| Papel | Fonte | Peso | Tamanho mobile / desktop | Extra |
|---|---|---|---|---|
| Display (h1 de tela) | Bricolage Grotesque | 800 | 40 / 56px | `line-height: 1`, `letter-spacing: -0.02em` |
| Título de cenário | Bricolage Grotesque | 800 | 30 / 40px | `line-height: 1.08` |
| h2 de card | Bricolage Grotesque | 800 | 20–24 / 24–32px | `line-height: 1.1` |
| Corpo | Inter | 400–600 | 15–16px | `line-height: 1.45` |
| Rótulo/overline | Inter | 700 | 12px | caixa alta, `letter-spacing: 0.08em` |
| Chip de código BNCC | Inter | 700 | 12px | fundo `lime` ou `ink`, `border-radius: 6px`, `padding: 4px 8px` |

Carregar com `next/font/google`: `Bricolage_Grotesque({ weight: ["600","800"] })`, `Inter({ weight: ["400","500","600","700"] })`.

## Forma, espaço e elevação

- **Raios:** cards 20px (mobile) / 24px (desktop); opções 18px; ícones-quadrado 12–14px; botões e chips `999px`; chip BNCC 6px.
- **Bordas:** `2px solid ink` em cards claros, botões, opções, avatar. Contorno tracejado `2px dashed ink` só no logotipo placeholder.
- **Sombra:** `4px 4px 0 ink` em elementos de destaque (missão do dia, CTA principal, opção selecionada). Selecionado também ganha `transform: translate(-2px,-2px)`.
- **Espaçamento:** padding de tela 20px (mobile) / 40–48px (desktop); gap entre cards 14px (mobile) / 20–28px (desktop); padding interno de card 16–18px / 24px.
- **Largura máx. de conteúdo desktop:** 1120px.
- **Alvos de toque:** mínimo 44px (ícones) e 48–56px (botões principais).

## Componentes (mapear no tema MUI)

| Componente | Especificação | MUI |
|---|---|---|
| **Botão primário** | `blue` ou `ink`, texto branco, borda 2px `ink`, pill, `min-height: 56px`, bold 17px, sombra sólida, ícone de seta → | `Button variant="contained"` com overrides |
| **Botão destaque** | `lime`, texto `ink`, borda + sombra | `Button color="secondary"` |
| **Botão desabilitado** | borda tracejada 2px, sem fundo, texto `blueTint`/`muted` ("Escolha uma opção") | `Button disabled` override |
| **Botão ícone** | círculo 44px, borda 2px ou fundo `rgba(255,255,255,.14)` sobre azul | `IconButton` |
| **Card claro** | `surface`, borda 2px, raio 20px | `Card`/`Paper` variant `outlined` |
| **Card escuro** | `ink`, texto `paper`, sem borda, raio 20px | `Paper` variant `ink` (custom) |
| **Card destaque** | `lime`, borda 2px, sombra sólida | `Paper` variant `highlight` (custom) |
| **Opção de cenário** | branco, borda 2px, raio 18px, `min-height: 72px`; quadrado-letra 40px (`paper`, borda) + texto 16px/600; selecionada = `lime` + sombra + translate | `ToggleButton` ou `Radio` customizado, `role="radio"` |
| **Barra de progresso segmentada** | N segmentos 6px, gap 4px; feito `lime`, atual branco, futuro `rgba(255,255,255,.25)` | componente próprio `SegmentedProgress` |
| **Barra de nível** | trilho 14px `trackOnInk`, preenchimento `lime` | `LinearProgress` override |
| **Barra de afinidade** | trilho 10px `track`, preenchimento `blue` (forte) / `blueSoft` (médio/leve) + rótulo à direita | `LinearProgress` override |
| **Pill de pontos** | `ink` + texto `lime`, ícone estrela de 4 pontas, bold 14px | `Chip` custom |
| **Chip de carreira** | branco, borda 2px, pill, 14px/600 | `Chip variant="outlined"` |
| **Chip BNCC** | ver tipografia | `Chip size="small"` custom |
| **Bottom nav (mobile)** | branco, borda superior 2px, 4 itens; ativo = ícone dentro de pill `lime` com borda | `BottomNavigation` override |
| **Sidebar (desktop)** | 232px, branco, borda direita 2px; item ativo = `lime` + borda, raio 14px | `Drawer variant="permanent"` |
| **Avatar** | círculo 44px `blue`, inicial branca, borda 2px | `Avatar` |

Ícones: `@mui/icons-material` (Rounded) ou SVG inline dos designs. A estrela de 4 pontas dos pontos é um SVG próprio (`components/ui/SparkIcon.tsx`).

## Layout responsivo

- **Mobile (< 900px):** coluna única, header com logo + pill de pontos + avatar, bottom nav fixa.
- **Desktop (≥ 900px):** sidebar fixa à esquerda (logo, navegação, usuário embaixo) + conteúdo fluido até 1120px, grids `repeat(auto-fit, minmax(300px, 1fr))`.
- Telas de fluxo (Da Galera, quiz, mentor simulado, Match Day) ocupam a tela inteira e escondem a navegação; no desktop, conteúdo centralizado com painel lateral de contexto.

## Movimento (framer-motion)

- Transição entre cenários/questões: slide horizontal 24px + fade, 200ms, `easeOut`.
- Seleção de opção: translate(-2px,-2px) + sombra em 120ms.
- Swipe de carreiras: arrastar com `drag="x"`; soltar além de ±120px = passar/salvar; card de trás visível com leve rotação.
- Pontos ganhos: toast "+30 pts" sobe 16px e some (600ms); pill de pontos faz "pop" (scale 1→1.12→1).
- Match Day: contagem 3‑2‑1 (700ms cada), card gira em Y (600ms), confete `canvas-confetti` com as cores `blue`, `lime`, `ink`.
- Respeitar `prefers-reduced-motion`: troca tudo por fade simples e sem confete.

## Voz e microcopy

- Aluno: "E aí, {nome}.", "Bora destravar", "Você já manda bem", "Não tem resposta certa e ninguém vai te dar nota aqui.", "Seu boletim mostra de onde você parte, não até onde você vai."
- Pontos: "Seus pontos vêm de esforço: missões, frequência e evolução no que você ainda não domina. Nota alta sozinha não conta mais."
- Mentor simulado: sempre identificado como "Mentor simulado por IA".
- Professor: frases objetivas, códigos BNCC sempre visíveis, sem jargão de gamificação.

## Professor (variação sóbria)

Mesmos tokens. Diferenças: fundo `paper`, cards brancos com borda 2px **sem sombra sólida** (exceto CTA "Gerar plano"); tipografia display só nos títulos de página (40px); tabelas e heatmap com células 28–32px; densidade maior (padding 12–16px); sidebar idêntica à do aluno com itens Turma · Planos.
