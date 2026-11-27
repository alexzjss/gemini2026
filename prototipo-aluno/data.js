/* Conteúdo ilustrativo das telas do aluno (aluno, rotinas e mentores são fictícios). */
window.DATA = {
  appName: '[nome do app]',
  salary: '[FAIXA SALARIAL · fonte oficial a definir]',
  student: { name: 'Kauã', initial: 'K', grade: '2º ano · Ensino Médio', gradeShort: '2º ano · EM' },

  levels: [
    { n: 1, name: 'Chegando', min: 0 },
    { n: 2, name: 'Aquecendo', min: 500 },
    { n: 3, name: 'Embalado', min: 1000 },
    { n: 4, name: 'Voando', min: 1500 },
    { n: 5, name: 'Lenda', min: 2200 }
  ],

  earn: [
    { pts: 40, mobile: 'evoluir no que você ainda não domina', desk: 'evoluir no que ainda não domina' },
    { pts: 30, mobile: 'completar uma missão BNCC', desk: 'missão BNCC completa' },
    { pts: 15, mobile: 'semana com presença em dia', desk: 'semana com presença em dia' },
    { pts: 10, mobile: 'explorar carreiras e o Da Galera', desk: 'explorar carreiras' }
  ],

  mentorTiers: [
    { title: 'Profissionais da sua região', level: 1, open: 'aberto desde o nível 1' },
    { title: 'Universitários e técnicos', level: 2, open: 'aberto no nível 2' },
    { title: 'Alta demanda: Big Tech, medicina, executivos', level: 4 }
  ],

  skills: {
    strong: [
      { code: 'EM13LGG701', area: 'Linguagens', text: 'Usar tecnologia digital pra se expressar e produzir' },
      { code: 'EM13LGG303', area: 'Linguagens', text: 'Debater e defender um ponto de vista com argumento' },
      { code: 'EM13CHS101', area: 'Humanas', text: 'Comparar fontes e narrativas diferentes sobre um fato', deskOnly: true }
    ],
    grow: [
      { code: 'EM13MAT316', area: 'Matemática', text: 'Estatística: média, moda, mediana e desvio', base: 45, note: 'subiu esta semana', hot: true },
      { code: 'EM13MAT310', area: 'Matemática', text: 'Problemas de contagem e combinações', base: 20, note: 'começando' },
      { code: 'EM13CNT301', area: 'Natureza', text: 'Levantar hipóteses e testar com dados', base: 35, note: 'em desenvolvimento', deskOnly: true }
    ]
  },

  missions: [
    {
      id: 'artilheiro', code: 'EM13MAT316', pts: 30, min: 8,
      title: 'Quem é o artilheiro de verdade?',
      long: 'Quem é o artilheiro de verdade? Média, moda e mediana no interclasse',
      steps: [
        { q: 'No interclasse, o Léo fez 2, 0, 1, 3 e 0 gols em 5 jogos. Qual é a média de gols por jogo?', opts: ['1', '1,2', '1,5', '2'], ok: 1,
          why: 'Soma 2+0+1+3+0 = 6 gols, dividido por 5 jogos = 1,2.' },
        { q: 'E a mediana dos gols do Léo? (põe em ordem: 0, 0, 1, 2, 3)', opts: ['0', '1', '1,2', '2'], ok: 1,
          why: 'Em ordem, o valor do meio é 1. A mediana não liga pro jogo de 3 gols.' },
        { q: 'O Davi fez 1, 1, 1, 2 e 1. Média 1,2 igual ao Léo. Quem é mais regular?', opts: ['O Léo', 'O Davi', 'Os dois iguais', 'Não dá pra saber'], ok: 1,
          why: 'Mesma média, mas os gols do Davi variam bem menos: o desvio dele é menor.' }
      ]
    },
    {
      id: 'uniformes', code: 'EM13MAT310', pts: 30, min: 6,
      title: 'Quantos uniformes dá pra montar?',
      long: 'Quantos uniformes dá pra montar? Contagem no interclasse',
      steps: [
        { q: 'O time tem 3 camisas e 2 shorts. Quantos uniformes diferentes dá pra montar?', opts: ['5', '6', '8', '9'], ok: 1,
          why: 'Pra cada camisa tem 2 shorts: 3 × 2 = 6.' },
        { q: 'Entraram 2 tipos de meião. E agora?', opts: ['7', '8', '12', '24'], ok: 2,
          why: 'Princípio multiplicativo: 3 × 2 × 2 = 12.' },
        { q: 'O 1º e o 2º lugar de uma chave com 4 times. Quantos resultados possíveis?', opts: ['6', '8', '12', '16'], ok: 2,
          why: '4 opções pro 1º e sobram 3 pro 2º: 4 × 3 = 12.' }
      ]
    }
  ],

  /* Teste Da Galera: cada opção soma afinidade em uma dimensão. */
  dims: {
    org: { label: 'Organizar e analisar', paths: ['Analista de dados esportivos', 'Logística', 'Técnico em informática'] },
    esp: { label: 'Esportes e competição', paths: ['Analista de dados esportivos', 'Gestão de e-sports', 'Preparação física'] },
    neg: { label: 'Negócios', paths: ['Gestão de e-sports', 'Marketing esportivo', 'Empreendedorismo'] },
    cri: { label: 'Criar e comunicar', paths: ['Design gráfico', 'Social media', 'Produção audiovisual'] }
  },
  headline: {
    org: 'Você curte organizar o caos com números.',
    esp: 'Você vive no clima de jogo e competição.',
    neg: 'Você enxerga oportunidade onde ninguém olha.',
    cri: 'Você transforma ideia em coisa que a galera vê.'
  },
  growTip: {
    org: { code: 'EM13MAT316', word: 'estatística', rest: ': média, mediana e desvio pra comparar desempenho.' },
    esp: { code: 'EM13MAT316', word: 'estatística', rest: ': média, mediana e desvio pra comparar desempenho.' },
    neg: { code: 'EM13MAT310', word: 'contagem', rest: ' e combinações pra calcular cenários de custo e lucro.' },
    cri: { code: 'EM13MAT316', word: 'leitura de dados', rest: ' pra saber qual post funcionou de verdade.' }
  },
  scenarios: [
    { when: 'Segunda, 7h', q: 'Seu grupo tem um trabalho pra sexta e ninguém começou. Você…', a: [
      ['org', 'Divido as partes e monto um cronograma'], ['cri', 'Faço os slides ficarem bonitos'], ['neg', 'Negocio quem faz o quê'], ['esp', 'Transformo em desafio: quem termina antes']] },
    { when: 'Terça, recreio', q: 'Rolou uma briga no grupo da sala. Você…', a: [
      ['esp', 'Chamo os dois pra resolver no papo reto'], ['cri', 'Mando um meme pra quebrar o clima'], ['org', 'Junto os prints e vejo quem começou'], ['neg', 'Proponho um acordo que agrade os dois']] },
    { when: 'Quarta, 15h', q: 'A escola liberou uma sala pra um projeto dos alunos. Você quer…', a: [
      ['cri', 'Um estúdio de podcast'], ['esp', 'Um espaço de e-sports'], ['neg', 'Uma lojinha de lanches'], ['org', 'Um laboratório de robótica']] },
    { when: 'Quinta, 20h', q: 'Você ganhou R$ 200 de aniversário. Você…', a: [
      ['neg', 'Compro coisas pra revender'], ['org', 'Guardo e anoto tudo numa planilha'], ['cri', 'Compro material pra criar algo'], ['esp', 'Inscrevo o time num campeonato']] },
    { when: 'Sábado, 10h', q: 'O time do bairro perdeu de novo. Você…', a: [
      ['org', 'Analiso o que deu errado nos jogos'], ['esp', 'Puxo um treino extra'], ['cri', 'Gravo um vídeo pra levantar a moral'], ['neg', 'Arrumo um patrocínio pra uniforme novo']] },
    { when: 'Domingo, 16h', q: 'Seu primo pediu ajuda com o canal dele. Você…', a: [
      ['cri', 'Edito os vídeos e faço as thumbs'], ['org', 'Olho os números e vejo o que funciona'], ['neg', 'Penso em como ele ganha dinheiro'], ['esp', 'Sugiro conteúdo de futebol e games']] },
    { when: 'Sexta, 19h', q: 'O grêmio quer fazer o interclasse e ninguém se mexeu. Você…', a: [
      ['org', 'Monto a tabela de jogos e o chaveamento'], ['cri', 'Faço a arte e os posts pro Insta do grêmio'], ['neg', 'Vou atrás de patrocínio na lanchonete do bairro'], ['esp', 'Fico de juiz e resolvo as tretas']] },
    { when: 'Segunda, 9h', q: 'O professor deixou escolher o formato da apresentação. Você…', a: [
      ['cri', 'Faço um vídeo curto'], ['org', 'Monto gráficos com dados'], ['neg', 'Faço um pitch, tipo Shark Tank'], ['esp', 'Faço um quiz valendo ponto pra sala']] },
    { when: 'Quarta, 18h', q: 'Seu celular travou no meio de uma partida. Você…', a: [
      ['org', 'Fuço até descobrir o motivo'], ['esp', 'Pego outro e volto pro jogo'], ['neg', 'Vejo se compensa trocar de aparelho'], ['cri', 'Faço um post zoando a situação']] },
    { when: 'Sexta, 22h', q: 'Daqui a 10 anos, você quer ser conhecido(a) por…', a: [
      ['org', 'Resolver problemas que ninguém resolveu'], ['cri', 'Criar coisas que todo mundo usa'], ['neg', 'Ter o próprio negócio'], ['esp', 'Vencer e fazer parte de um time forte']] }
  ],
  /* Respostas já dadas antes (o aluno parou no cenário 7). */
  presetAnswers: ['org', 'esp', 'esp', 'org', 'org', 'neg'],

  careers: [
    {
      title: 'Analista de dados esportivos', why: 'futebol + números', theme: 'blue',
      day: [['9h', 'Puxa os números do jogo de ontem'], ['14h', 'Monta o relatório pro técnico'], ['17h', 'Mostra quem cansa mais no 2º tempo']],
      code: 'EM13MAT316', schoolShort: 'média e desvio padrão pra comparar jogadores.',
      school: 'Média e desvio padrão pra comparar jogadores e saber se um resultado foi sorte ou padrão.',
      status: 'Na sua ficha: em desenvolvimento, subiu esta semana.',
      path: 'Graduação ou tecnólogo em Ciência de Dados, Estatística ou Educação Física com foco em análise.',
      mentor: 'Analista de um clube da região', mentorInitial: 'R', bigTech: 'Cientista de dados · Big Tech',
      live: {
        intro: 'Precisa saber usar, não decorar. Bora testar? O camisa 9 fez **2, 0, 1, 3 e 0** gols nos últimos 5 jogos.',
        challenge: 'A média dele é 1,2. Isso conta a história toda?',
        keys: ['mediana', 'varia', 'irregular', 'desvio', 'não', 'nao', 'zero', 'dois jogos'],
        good: 'Boa! A média esconde que ele zerou em 2 jogos. A mediana é 1 e o desvio mostra que ele é irregular. É isso que eu mostro pro técnico.',
        hint: 'Pensa assim: ele fez 3 num jogo e zero em outros dois. Será que ele é constante? Olha a mediana ou o quanto varia.'
      }
    },
    {
      title: 'Gestor(a) de equipe de e-sports', why: 'games + negócios', theme: 'lime',
      day: [['10h', 'Fecha a agenda de treinos da semana'], ['15h', 'Negocia com um patrocinador'], ['20h', 'Revê replay com o time']],
      code: 'EM13LGG303', schoolShort: 'argumentar e defender uma proposta na negociação.',
      school: 'Argumentar e defender uma proposta quando você negocia com patrocinador ou com o próprio time.',
      status: 'Na sua ficha: você já manda bem nisso.',
      path: 'Graduação em Administração, Marketing ou Gestão Desportiva; muita gente começa organizando campeonato amador.',
      mentor: 'Coordenadora de um time amador', mentorInitial: 'A', bigTech: 'Head de e-sports · grande organização',
      live: {
        intro: 'Metade do trabalho é convencer gente. Bora testar? Uma marca de energético quer patrocinar, mas só paga **R$ 500**.',
        challenge: 'Que argumento você usa pra pedir mais?',
        keys: ['público', 'publico', 'audiência', 'audiencia', 'seguidores', 'views', 'visualiza', 'alcance', 'número', 'numero'],
        good: 'Isso! Mostrar o alcance do time com número é o que faz a marca subir a oferta. Argumento com dado ganha negociação.',
        hint: 'O que a marca ganha aparecendo no seu time? Pensa em quanta gente assiste.'
      }
    },
    {
      title: 'Técnico(a) em logística', why: 'organizar + resolver', theme: 'ink',
      day: [['7h', 'Planeja a rota das entregas'], ['11h', 'Confere o estoque'], ['16h', 'Resolve um atraso de caminhão']],
      code: 'EM13MAT310', schoolShort: 'contagem pra comparar combinações de rota.',
      school: 'Contagem e combinações pra comparar rotas e escolher a mais curta.',
      status: 'Na sua ficha: começando.',
      path: 'Curso técnico em Logística, inclusive integrado ao Ensino Médio ou em instituições públicas de ensino técnico.',
      mentor: 'Supervisor de um centro de distribuição', mentorInitial: 'M', bigTech: 'Gerente de operações · e-commerce',
      live: {
        intro: 'Todo dia é um quebra-cabeça. Bora testar? Tenho **3 entregas** pra fazer com um caminhão só.',
        challenge: 'De quantas ordens diferentes dá pra fazer essas 3 entregas?',
        keys: ['6', 'seis', '3x2', '3 x 2', 'fatorial'],
        good: 'Exato: 3 × 2 × 1 = 6 rotas. Com 10 entregas já são mais de 3 milhões, por isso a gente usa sistema.',
        hint: 'Quantas opções tem pra primeira entrega? E depois, quantas sobram?'
      }
    }
  ]
};
