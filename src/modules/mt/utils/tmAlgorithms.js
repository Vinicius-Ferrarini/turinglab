// ─── Motor da Máquina de Turing ──────────────────────────────────────────────
// Segue a convenção JFLAP: read/write '' (string vazia) = símbolo branco (□).
// graph = {
//   states:      [{ id, name, x, y, isInitial, isFinal }],
//   transitions: [{ from, to, read, write, move: 'R'|'L'|'S' }],
// }

export const BLANK = '□';
export const MOVE_DELTA = { R: 1, L: -1, S: 0 };

// Extrai a saída "visível" de uma fita final: remove os brancos de borda e,
// se a MT usa um marcador de controle na 1ª célula — seja porque foi inserido
// de fora (level.startMarker) ou porque a própria MT o escreve sozinha ao
// iniciar (level.outputMarker, ex.: '@') — remove essa célula também. O aluno
// vê só o resultado da transformação, não o marcador de controle interno.
export function extractTapeOutput(tape, marker = null) {
  let lo = 0, hi = tape.length - 1;
  while (lo <= hi && tape[lo] === BLANK) lo++;
  while (hi >= lo && tape[hi] === BLANK) hi--;
  if (marker != null && tape[lo] === marker) lo++;
  return tape.slice(lo, hi + 1).join('');
}

// ── Simulador principal ───────────────────────────────────────────────────────
// startMarker: símbolo opcional escrito ANTES da palavra (ex.: '<'), para MTs
// que dependem de um marcador explícito de início-de-fita (convenção usada em
// parte dos gabaritos importados do professor) — o cabeçote começa sobre ele,
// não sobre a palavra.
export function simulateTM(graph, inputWord, maxSteps = 2000, startMarker = null) {
  const stateMap = new Map((graph.states ?? []).map(s => [s.id, s]));
  const initial  = (graph.states ?? []).find(s => s.isInitial);
  if (!initial) return { status: 'REJECTED', tape: [BLANK], finalState: null, steps: 0 };

  // Fita: dois brancos de padding + [marcador opcional] + palavra + dois brancos
  const tape = [BLANK, BLANK, ...(startMarker != null ? [startMarker] : []),
    ...(inputWord === '' ? [] : inputWord.split('')), BLANK, BLANK];
  let head    = 2;           // índice do marcador (se houver) ou 1º caractere da palavra
  let stateId = initial.id;
  let steps   = 0;

  while (steps < maxSteps) {
    const symbol = tape[head] ?? BLANK;

    // Busca transição determinística (primeira que bate)
    const tr = (graph.transitions ?? []).find(t => {
      const r = t.read === '' ? BLANK : t.read;
      return t.from === stateId && r === symbol;
    });

    if (!tr) break; // halted — nenhuma transição disponível

    tape[head] = tr.write === '' ? BLANK : tr.write;
    stateId    = tr.to;
    head      += MOVE_DELTA[tr.move] ?? 0;

    // Extensão infinita da fita
    if (head < 0)              { tape.unshift(BLANK); head = 0; }
    if (head >= tape.length)   tape.push(BLANK);

    steps++;
  }

  const finalState = stateMap.get(stateId) ?? null;
  const status = steps >= maxSteps
    ? 'LOOP'
    : finalState?.isFinal
    ? 'ACCEPTED'
    : 'REJECTED';

  return { status, tape: [...tape], finalState, steps };
}

// ── Validador de MT Transdutora ───────────────────────────────────────────────
// Recebe a MT do aluno e o objeto de nível. Pra cada testWord: (1) a MT tem
// que terminar em estado final, E (2) a fita final (sem □ de borda/marcador)
// tem que bater com level.validate(word) — as duas condições, não só a
// primeira (ver docs/PLAN_BATERIA_VALIDACAO_MT.md §3.2: antes desta função só
// checava (1), então uma MT que aceitava certo mas escrevia qualquer coisa
// passava "✓ Validar MT" sem nenhum aviso).
export function fuzzTMTransducer(graph, level) {
  // Remove a palavra vazia da bateria quando o nível pede (skipEmptyWord)
  let words = level.testWords ?? [];
  if (level.skipEmptyWord) words = words.filter(w => w !== '');

  for (const word of words) {
    const { status, tape } = simulateTM(graph, word, 2000, level.startMarker ?? null);
    if (status === 'LOOP')     return { ok: false, counterexample: word, reason: 'loop' };
    if (status !== 'ACCEPTED') return { ok: false, counterexample: word, reason: 'rejected' };
    const expected = level.validate?.(word);
    const got = extractTapeOutput(tape, level.startMarker ?? level.outputMarker ?? null);
    if (expected != null && got !== expected) {
      return { ok: false, counterexample: word, reason: 'wrong-output', expected, got };
    }
  }
  return { ok: true };
}

// ── Validador de MT Reconhecedora ─────────────────────────────────────────────
// Recebe a MT do aluno e o objeto de nível. Aceita se para em estado final —
// o conteúdo da fita ao final NÃO importa (diferente da transdutora). Compara
// contra level.acceptedWords/rejectedWords (mesmo padrão de bateria do AFD/AP).
export function fuzzTMRecognizer(graph, level) {
  for (const word of level.acceptedWords ?? []) {
    const { status } = simulateTM(graph, word);
    if (status === 'LOOP')     return { ok: false, counterexample: word, reason: 'loop', expectedAccept: true };
    if (status !== 'ACCEPTED') return { ok: false, counterexample: word, reason: 'rejected', expectedAccept: true };
  }
  for (const word of level.rejectedWords ?? []) {
    const { status } = simulateTM(graph, word);
    if (status === 'ACCEPTED') return { ok: false, counterexample: word, reason: 'wrongly-accepted', expectedAccept: false };
  }
  return { ok: true };
}

// ── Simulador passo a passo (para animação da aula guiada e o "🔬 Simular") ──
// Retorna um array de configs { tape, head, stateId, step, tIdx, status? }.
// tIdx é o ÍNDICE (em graph.transitions) da transição aplicada PARA CHEGAR
// nesse config — null no config[0] (configuração inicial, nenhuma transição
// ainda) — usado por MTCanvas.jsx (t.tIdx === activeTIdx) pra destacar o
// chip/aresta percorrida no canvas, mesma convenção do pdaAcceptingRun (AP).
// status só existe na última config: 'ACCEPTED' | 'REJECTED' | 'LOOP'.
export function simulateTMSteps(graph, inputWord, maxSteps = 80, startMarker = null) {
  const stateMap = new Map((graph.states ?? []).map(s => [s.id, s]));
  const initial  = (graph.states ?? []).find(s => s.isInitial);
  if (!initial) return [{ tape: [BLANK], head: 0, stateId: null, step: 0, tIdx: null, status: 'REJECTED' }];

  const tape = [BLANK, BLANK, ...(startMarker != null ? [startMarker] : []),
    ...(inputWord === '' ? [] : inputWord.split('')), BLANK, BLANK];
  let head    = 2;
  let stateId = initial.id;
  const configs = [{ tape: [...tape], head, stateId, step: 0, tIdx: null }];

  for (let s = 0; s < maxSteps; s++) {
    const symbol = tape[head] ?? BLANK;
    const trIdx = (graph.transitions ?? []).findIndex(t => {
      const r = t.read === '' ? BLANK : t.read;
      return t.from === stateId && r === symbol;
    });
    if (trIdx === -1) break;
    const tr = graph.transitions[trIdx];
    tape[head] = tr.write === '' ? BLANK : tr.write;
    stateId    = tr.to;
    head      += MOVE_DELTA[tr.move] ?? 0;
    if (head < 0)              { tape.unshift(BLANK); head = 0; }
    if (head >= tape.length)   tape.push(BLANK);
    configs.push({ tape: [...tape], head, stateId, step: s + 1, tIdx: trIdx });
  }

  const finalState = stateMap.get(stateId) ?? null;
  const status = configs.length - 1 >= maxSteps
    ? 'LOOP'
    : finalState?.isFinal ? 'ACCEPTED' : 'REJECTED';
  configs[configs.length - 1] = { ...configs[configs.length - 1], status };
  return configs;
}

// ── Parser JFLAP (MT single-fita) — importação de gabaritos (.jff/.xml) ──────
// Converte XML JFLAP (tipo "turing" ou "turingbb") no mesmo formato de graph
// acima. JFLAP usa <state> para MT normal e <block> para "Building Blocks"
// (type turingbb) — na prática ambos são a mesma estrutura plana de
// estados+transições (sem submáquinas aninhadas de verdade); <block> só
// acrescenta um <tag>MachineN</tag> decorativo que é ignorado aqui.
// Coordenadas: JFLAP salva x/y em pixels absolutos do canvas de edição; o
// jogo usa um canvas fixo de 8000×8000px (mesmo motor do AP/AFD). Escala FIXA
// e proporcional (não estica cada eixo até preencher o canvas — ver mesmo
// raciocínio/calibração em buildApLesson.js `layout()`): um grafo pequeno no
// JFLAP (poucas centenas de px de span) deve continuar com estados PRÓXIMOS
// no canvas do jogo, do mesmo jeito que AP/AFD ficam. Só encolhe (nunca
// estica além de FIXED_SCALE) se o grafo for grande demais pra caber.
export function parseJffTM(xml) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  const stateEls = [...doc.querySelectorAll('state'), ...doc.querySelectorAll('block')];
  const rawStates = stateEls.map(b => ({
    id:        b.getAttribute('id') ?? '',
    name:      b.getAttribute('name') ?? '',
    x:         parseFloat(b.querySelector('x')?.textContent ?? '0'),
    y:         parseFloat(b.querySelector('y')?.textContent ?? '0'),
    isInitial: !!b.querySelector('initial'),
    isFinal:   !!b.querySelector('final'),
  }));

  const INNER_W = 8000, INNER_H = 8000;
  const FIXED_SCALE = 1.8;
  const xs = rawStates.map(s => s.x), ys = rawStates.map(s => s.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = maxX - minX, spanY = maxY - minY;
  const PADX = INNER_W * 0.14, PADY = INNER_H * 0.20;
  const usableW = INNER_W - 2 * PADX, usableH = INNER_H - 2 * PADY;
  const kx = spanX > 0 ? usableW / spanX : Infinity;
  const ky = spanY > 0 ? usableH / spanY : Infinity;
  let k = Math.min(FIXED_SCALE, kx, ky);
  if (!Number.isFinite(k)) k = FIXED_SCALE;
  const offX = (INNER_W - spanX * k) / 2, offY = (INNER_H - spanY * k) / 2;
  const normX = (v) => Math.round(spanX > 0 ? offX + (v - minX) * k : INNER_W / 2);
  const normY = (v) => Math.round(spanY > 0 ? offY + (v - minY) * k : INNER_H / 2);

  const states = rawStates.map(s => ({
    ...s,
    x: normX(s.x),
    y: normY(s.y),
  }));

  // Transições: read/write vazios mantidos como '' (blank) — simulateTM já trata '' → □
  // IMPORTANTE: read/write NÃO usam .trim() — o JFLAP nunca insere espaço/
  // indentação dentro da própria tag (<read>a</read>, sem espaço ao redor de
  // "a"), então um espaço literal ali É o símbolo de fita ' ' (usado por
  // MTs que processam texto com espaços, ex.: cifra que preserva espaços
  // entre palavras). from/to/move continuam com .trim() — são sempre IDs/
  // direção, nunca precisam preservar espaço.
  const transitions = [...doc.querySelectorAll('transition')].map(t => ({
    from:  t.querySelector('from')?.textContent.trim() ?? '',
    to:    t.querySelector('to')?.textContent.trim()   ?? '',
    read:  t.querySelector('read')?.textContent  ?? '',
    write: t.querySelector('write')?.textContent ?? '',
    move:  t.querySelector('move')?.textContent.trim() ?? 'S',
  }));

  return { states, transitions };
}
