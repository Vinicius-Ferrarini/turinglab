// ─── Testes de MT Reconhecedora ───────────────────────────────────────────────
// Espelha o padrão de afd_levels.test.js / ap_levels.test.js: bateria de
// aceitas/rejeitadas bate com o gabarito real, e o grafo final da aula guiada
// (fase GRAPH) reproduz a mesma bateria — provando que buildRecon/gerador de
// aula não diverge do gabarito importado do JFLAP.
// Níveis carregam via loadMTReconLevel (import() dinâmico, mesma via do app
// real — ver comentário em levels_data/mt-recon/index.js). Usa top-level
// await pra resolver todos ANTES da fase de coleta dos describe/it — a seção
// de layout decide QUAIS it() registrar (`if (nodes.length < 2) continue`)
// com base no grafo, então precisa do dado síncrono nesse ponto. Sequencial
// (não Promise.all) — ver mt_trans_levels.test.js: disparar todos os imports
// em paralelo sob a suíte completa estourava o timeout de RPC do worker.
import { describe, it, expect } from 'vitest';
import { MT_RECON_LEVEL_ORDER, loadMTReconLevel } from '../levels_data/mt-recon/index.js';
import { simulateTM, fuzzTMRecognizer } from '../modules/mt/utils/tmAlgorithms.js';
import { INNER_W, INNER_H } from '../modules/afd/hooks/useCanvasState.js';

const MT_RECON_LEVELS = [];
for (const id of MT_RECON_LEVEL_ORDER) MT_RECON_LEVELS.push(await loadMTReconLevel(id));

function lastGraphStep(level) {
  const steps = level.guidedLesson.steps;
  const introIdx = steps.findIndex(s => s.formalIntro);
  return introIdx > 0 ? steps[introIdx - 1] : steps[steps.length - 1];
}

// ─── Toda transição do grafo final aparece em alguma simulação real ─────────
// Regressão do padrão "Para cobrir todos os casos da linguagem, completamos a
// máquina com as regras restantes" (e variantes) — transições reveladas em
// bloco no storyboard sem NUNCA serem demonstradas por uma palavra simulada.
// Roda todas as simulateWord distintas do storyboard contra o grafo FINAL
// (não o parcial de cada passo) e verifica que a união cobre 100% das
// transições — mesma lógica usada manualmente para corrigir os níveis.
const transKey = (t) => `${t.from}|${t.to}|${t.read}|${t.write}|${t.move}`;

function transitionsCoveredBySimulations(level) {
  const steps = level.guidedLesson.steps;
  const finalGraph = lastGraphStep(level).stateUpdate;
  const trans = finalGraph.transitions;
  const initId = finalGraph.nodes.find(n => n.isInitial)?.id;
  const finalId = finalGraph.nodes.find(n => n.isFinal)?.id;
  function findTransition(state, sym) {
    return trans.find(t => t.from === state && (t.read === sym || (t.read === '' && sym === '□')));
  }
  const words = new Set(steps.filter(s => s.simulateWord !== undefined).map(s => s.simulateWord));
  const covered = new Set();
  for (const word of words) {
    let tape = ['□', '□', ...word.split(''), '□', '□'];
    let head = 2, state = initId;
    for (let i = 0; i < 3000; i++) {
      if (state === finalId) break;
      const sym = tape[head] ?? '□';
      const t = findTransition(state, sym);
      if (!t) break; // rejeição por travamento — caminho didático válido
      covered.add(transKey(t));
      if (t.write !== '') tape[head] = t.write;
      if (t.move === 'R') head++; else if (t.move === 'L') head--;
      state = t.to;
      if (head < 0) { tape.unshift('□'); head = 0; }
      if (head >= tape.length) tape.push('□');
    }
  }
  return covered;
}

// Transições comprovadamente inalcançáveis por qualquer palavra da linguagem
// (resíduo morto no gabarito, não falha de busca — confirmado por busca
// exaustiva antes de entrar aqui). Chave: `${label}|${from}|${to}|${read}|${write}|${move}`.
const KNOWN_DEAD_TRANSITIONS = new Set([
  'L08|q4|q4|C|C|L',
  'L09|q1|q9|B|B|L',
  'L09|q8|q10|A|A|L',
]);

// Transições onde uma célula da bateria (acceptedWords/rejectedWords) foi
// confirmada, à mão, como estruturalmente inalcançável por qualquer palavra
// curta — não é o mesmo conceito de KNOWN_DEAD_TRANSITIONS acima (que é sobre
// a AULA nunca demonstrar a transição); aqui é sobre a BATERIA DE VALIDAÇÃO
// nunca precisar dela pra aprovar/reprovar um autômato. Ver
// docs/PLAN_BATERIA_VALIDACAO_MT.md §2/§3.1. Chave:
// `${label}|${from}|${to}|${read}|${write}|${move}`.
const KNOWN_BATTERY_COVERAGE_GAPS = new Set([
  // L09 p1->p3 (□;□,L): fase de pré-validação de formato (a*b*c*). Só é
  // alcançada por uma palavra a*b+ sem nenhum "c" (i≥0, j≥1, k=0) — e pela
  // linguagem (k=i+j) essa forma NUNCA é aceita (k=0 < i+j já que j≥1). Ou
  // seja: COM a transição, a palavra segue até p3→q1 e é rejeitada lá; SEM
  // ela, a MT trava em p1 e já é rejeitada ali — mesmo veredito nos dois
  // casos, pra QUALQUER palavra possível (não só as testadas), verificado
  // computacionalmente (b, ab, aab, abb, aaabbb — REJECTED nos dois grafos).
  // Diferente de KNOWN_DEAD_TRANSITIONS (que é sobre inalcançável na
  // EXECUÇÃO): esta transição é alcançável, só não é NUNCA discriminante
  // pra bateria, por construção da linguagem — nenhuma palavra jamais vai
  // fechar esse "gap".
  'L09|p1|p3|||L',
]);

// ─── Regressão do bug relatado: MT_RECON L06 sem q5→q5 (b/B) passava "✓ Validar MT" ──
// Mutation testing: para cada transição do gabarito, remove e roda
// fuzzTMRecognizer de novo. Se ainda passar (ok:true), a bateria não notaria
// um aluno que "esqueceu" aquela transição — exatamente a classe de bug
// relatada (autômato incompleto validado como correto).
describe('MT Reconhecedora — nenhuma transição do gabarito é removível sem que a bateria note', () => {
  for (const level of MT_RECON_LEVELS) {
    it(`${level.label}: remover qualquer transição do gabarito faz a bateria falhar`, () => {
      const graph = lastGraphStep(level).stateUpdate;
      const transitions = graph.transitions;
      const undetected = [];
      for (let i = 0; i < transitions.length; i++) {
        const mutated = { states: graph.nodes, transitions: transitions.filter((_, idx) => idx !== i) };
        const res = fuzzTMRecognizer(mutated, level);
        if (res.ok) {
          const t = transitions[i];
          const key = `${level.label}|${t.from}|${t.to}|${t.read}|${t.write}|${t.move}`;
          if (!KNOWN_BATTERY_COVERAGE_GAPS.has(key)) undetected.push(t);
        }
      }
      expect(
        undetected,
        undetected.length
          ? `${level.label}: ${undetected.length} transição(ões) removível(is) sem a bateria notar — ` +
            undetected.map(t => `${t.from}->${t.to} (${t.read || '□'};${t.write || '□'},${t.move})`).join(', ') +
            `. Adicione uma palavra a acceptedWords/rejectedWords que force essa transição a existir, ou, ` +
            `se comprovadamente inalcançável, documente em KNOWN_BATTERY_COVERAGE_GAPS.`
          : undefined
      ).toHaveLength(0);
    });
  }
});

// ─── Regressão: MT que aceita mas não recua o cabeçote ao 1º caractere ──────
// Bug relatado pelo usuário com 2 exports reais de sessão do L06 (ver
// docs/PLAN_CABECOTE_RETORNO_INICIO_MT.md) — grafos copiados literalmente
// dos .json exportados, só removendo campos irrelevantes pra validação
// (uid/x/y/label). fuzzTMRecognizer só checava estado final; um autômato
// que aceita "ab" mas termina com o cabeçote fora do 1º caractere passava
// indevidamente.
const L06_HEAD_NOT_REWOUND_GRAPH = {
  states: [
    { id: 'q0', isInitial: true, isFinal: false },
    { id: 'q1', isInitial: false, isFinal: false },
    { id: 'q2', isInitial: false, isFinal: false },
    { id: 'q3', isInitial: false, isFinal: false },
    { id: 'q4', isInitial: false, isFinal: true },
  ],
  transitions: [
    { from: 'q0', to: 'q1', read: 'a', write: 'A', move: 'R' },
    { from: 'q0', to: 'q3', read: 'b', write: 'B', move: 'R' },
    { from: 'q1', to: 'q2', read: 'b', write: 'B', move: 'L' },
    { from: 'q2', to: 'q0', read: '', write: '', move: 'R' },
    { from: 'q2', to: 'q2', read: 'a', write: 'a', move: 'L' },
    { from: 'q2', to: 'q2', read: 'b', write: 'b', move: 'L' },
    { from: 'q2', to: 'q2', read: 'A', write: 'A', move: 'L' },
    { from: 'q2', to: 'q2', read: 'B', write: 'B', move: 'L' },
    { from: 'q3', to: 'q2', read: 'a', write: 'A', move: 'L' },
    { from: 'q0', to: 'q4', read: '', write: '', move: 'L' },
    { from: 'q0', to: 'q0', read: 'A', write: 'A', move: 'R' },
    { from: 'q0', to: 'q0', read: 'B', write: 'B', move: 'R' },
    { from: 'q1', to: 'q1', read: 'a', write: 'a', move: 'R' },
    { from: 'q1', to: 'q1', read: 'B', write: 'B', move: 'R' },
    { from: 'q3', to: 'q3', read: 'b', write: 'b', move: 'R' },
    { from: 'q3', to: 'q3', read: 'A', write: 'A', move: 'R' },
  ],
};
// Mesmo grafo + q4 deixa de ser final, ganha os 2 self-loops de varredura
// (A/B, move L) e um novo q5 (final) alcançado só depois de recuar até o
// branco antes do 1º caractere — exatamente a correção que o usuário fez.
const L06_HEAD_REWOUND_GRAPH = {
  states: [
    { id: 'q0', isInitial: true, isFinal: false },
    { id: 'q1', isInitial: false, isFinal: false },
    { id: 'q2', isInitial: false, isFinal: false },
    { id: 'q3', isInitial: false, isFinal: false },
    { id: 'q4', isInitial: false, isFinal: false },
    { id: 'q5', isInitial: false, isFinal: true },
  ],
  transitions: [
    ...L06_HEAD_NOT_REWOUND_GRAPH.transitions,
    { from: 'q4', to: 'q5', read: '', write: '', move: 'R' },
    { from: 'q4', to: 'q4', read: 'A', write: 'A', move: 'L' },
    { from: 'q4', to: 'q4', read: 'B', write: 'B', move: 'L' },
  ],
};
const L06_HEAD_REWIND_LEVEL = { acceptedWords: ['ab'], rejectedWords: [] };

describe('MT Reconhecedora — cabeçote tem que voltar ao 1º caractere ao aceitar (palavra não-vazia)', () => {
  it('L06 (grafo real do usuário): aceita "ab" mas NÃO recua o cabeçote — deve ser rejeitado', () => {
    const res = fuzzTMRecognizer(L06_HEAD_NOT_REWOUND_GRAPH, L06_HEAD_REWIND_LEVEL);
    expect(res.ok, `esperado ok:false — ${JSON.stringify(res)}`).toBe(false);
  });

  it('L06 (grafo corrigido pelo usuário): aceita "ab" E recua o cabeçote — deve passar', () => {
    const res = fuzzTMRecognizer(L06_HEAD_REWOUND_GRAPH, L06_HEAD_REWIND_LEVEL);
    expect(res.ok, `esperado ok:true — ${JSON.stringify(res)}`).toBe(true);
  });
});

describe('MT Reconhecedora — sanidade básica de cada nível', () => {
  for (const level of MT_RECON_LEVELS) {
    it(`${level.label}: tem estado inicial, ao menos um final, e alfabeto`, () => {
      const nodes = lastGraphStep(level).stateUpdate.nodes;
      expect(nodes.some(n => n.isInitial), `${level.label}: sem estado inicial`).toBe(true);
      expect(nodes.some(n => n.isFinal), `${level.label}: sem estado final`).toBe(true);
      expect(level.alphabet?.length, `${level.label}: alfabeto vazio`).toBeGreaterThan(0);
    });

    it(`${level.label}: acceptedWords/rejectedWords não estão vazias`, () => {
      expect(level.acceptedWords?.length, `${level.label}: sem acceptedWords`).toBeGreaterThan(0);
      expect(level.rejectedWords?.length, `${level.label}: sem rejectedWords`).toBeGreaterThan(0);
    });
  }
});

describe('MT Reconhecedora — gabarito bate com acceptedWords/rejectedWords', () => {
  for (const level of MT_RECON_LEVELS) {
    it(`${level.label}: grafo do gabarito (último passo da aula) aceita/rejeita conforme a bateria`, () => {
      const graph = lastGraphStep(level).stateUpdate;
      const pdaLikeGraph = { states: graph.nodes, transitions: graph.transitions };
      const res = fuzzTMRecognizer(pdaLikeGraph, level);
      expect(res.ok, `${level.label}: ${JSON.stringify(res)}`).toBe(true);
    });
  }
});

describe('MT Reconhecedora — checkpoints por passo (aula guiada reflete o grafo parcial)', () => {
  for (const level of MT_RECON_LEVELS) {
    const steps = level.guidedLesson.steps;
    const graphSteps = steps.filter(s => s.stateUpdate && !s.phase);
    it(`${level.label}: cada passo da fase GRAPH tem grafo consistente (sem transição órfã)`, () => {
      for (const [idx, step] of graphSteps.entries()) {
        const ids = new Set(step.stateUpdate.nodes.map(n => n.id));
        for (const t of step.stateUpdate.transitions) {
          expect(ids.has(t.from), `${level.label} step[${idx}]: transição de estado não revelado "${t.from}"`).toBe(true);
          expect(ids.has(t.to), `${level.label} step[${idx}]: transição para estado não revelado "${t.to}"`).toBe(true);
        }
      }
    });

    it(`${level.label}: o grafo de cada passo simulado (simulateWord presente) nunca entra em LOOP`, () => {
      for (const [idx, step] of graphSteps.entries()) {
        if (step.simulateWord === undefined) continue;
        const graph = { states: step.stateUpdate.nodes, transitions: step.stateUpdate.transitions };
        const { status } = simulateTM(graph, step.simulateWord, 200);
        expect(status, `${level.label} step[${idx}]: simulação de "${step.simulateWord || 'λ'}" entrou em LOOP`).not.toBe('LOOP');
      }
    });
  }
});

describe('MT Reconhecedora — grafo final da aula ≡ estado final coerente com status do último passo', () => {
  for (const level of MT_RECON_LEVELS) {
    it(`${level.label}: passos com status ACCEPTED/REJECTED batem com simulateTM no grafo daquele passo`, () => {
      const steps = level.guidedLesson.steps.filter(s => s.status && s.stateUpdate);
      expect(steps.length, `${level.label}: aula não tem nenhum passo com veredito ACCEPTED/REJECTED`).toBeGreaterThan(0);
      for (const step of steps) {
        const graph = { states: step.stateUpdate.nodes, transitions: step.stateUpdate.transitions };
        const { status } = simulateTM(graph, step.simulateWord);
        expect(status, `${level.label} step com status "${step.status}" para "${step.simulateWord}": simulateTM real deu "${status}"`).toBe(step.status);
      }
    });
  }
});

// ─── Layout do grafo (posição dos nós) ────────────────────────────────────────
// Não trava coordenadas exatas (qualquer ajuste fino de layout legítimo quebraria
// à toa) — trava as PROPRIEDADES que garantem legibilidade: nós dentro do canvas,
// sem dois nós exatamente sobrepostos, sem 3+ arestas saindo do mesmo nó em linha
// reta (o bug reportado: "não dá pra saber se a transição é de q0→q1 ou q2 ou
// q3" quando as arestas ficam colineares), e densidade compatível com os níveis
// desenhados à mão (evita regressão a um layout em grade rígida, muito espalhado
// ou muito espremido).
function angleBetween(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

describe('MT Reconhecedora — layout do grafo é legível (regressão do bug de arestas coincidentes)', () => {
  for (const level of MT_RECON_LEVELS) {
    const nodes = lastGraphStep(level).stateUpdate.nodes;
    const transitions = lastGraphStep(level).stateUpdate.transitions;
    if (nodes.length < 2) continue;

    it(`${level.label}: todos os nós têm coordenadas dentro do canvas (0..${INNER_W}x${INNER_H})`, () => {
      for (const n of nodes) {
        expect(n.x, `${level.label} nó ${n.id}: x=${n.x} fora do canvas`).toBeGreaterThanOrEqual(0);
        expect(n.x, `${level.label} nó ${n.id}: x=${n.x} fora do canvas`).toBeLessThanOrEqual(INNER_W);
        expect(n.y, `${level.label} nó ${n.id}: y=${n.y} fora do canvas`).toBeGreaterThanOrEqual(0);
        expect(n.y, `${level.label} nó ${n.id}: y=${n.y} fora do canvas`).toBeLessThanOrEqual(INNER_H);
      }
    });

    it(`${level.label}: nenhum par de nós ocupa exatamente a mesma posição`, () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const same = nodes[i].x === nodes[j].x && nodes[i].y === nodes[j].y;
          expect(same, `${level.label}: ${nodes[i].id} e ${nodes[j].id} sobrepostos em (${nodes[i].x},${nodes[i].y})`).toBe(false);
        }
      }
    });

    it(`${level.label}: nenhum nó tem 2+ arestas de saída colineares (ambíguas visualmente)`, () => {
      const byId = new Map(nodes.map(n => [n.id, n]));
      const outEdgesByFrom = new Map();
      for (const t of transitions) {
        if (t.from === t.to) continue; // self-loop não tem "direção" a comparar
        if (!outEdgesByFrom.has(t.from)) outEdgesByFrom.set(t.from, new Set());
        outEdgesByFrom.get(t.from).add(t.to);
      }
      const ANGLE_TOLERANCE = 0.02; // ~1.1°: mesma reta para fins de legibilidade
      for (const [from, tos] of outEdgesByFrom) {
        const fromNode = byId.get(from);
        const targets = [...tos].filter(id => byId.has(id));
        const angles = targets.map(id => ({ id, angle: angleBetween(fromNode, byId.get(id)) }));
        for (let i = 0; i < angles.length; i++) {
          for (let j = i + 1; j < angles.length; j++) {
            const diff = Math.abs(angles[i].angle - angles[j].angle);
            const collinear = diff < ANGLE_TOLERANCE || Math.abs(diff - Math.PI) < ANGLE_TOLERANCE || Math.abs(diff - 2 * Math.PI) < ANGLE_TOLERANCE;
            expect(collinear, `${level.label}: arestas ${from}→${angles[i].id} e ${from}→${angles[j].id} saem coincidentes (mesmo ângulo)`).toBe(false);
          }
        }
      }
    });

    it(`${level.label}: densidade do layout é compatível com níveis desenhados à mão (não é grade espalhada nem espremida)`, () => {
      const xs = nodes.map(n => n.x);
      const ys = nodes.map(n => n.y);
      const xSpan = Math.max(...xs) - Math.min(...xs);
      const ySpan = Math.max(...ys) - Math.min(...ys);
      // Referência: níveis desenhados à mão (ex. L4, 7 estados) giram em torno de
      // ~160px de x-span por estado. Damos uma folga generosa (3x) pra não travar
      // em variações legítimas de layout, só pra pegar uma regressão grosseira
      // (ex.: volta pro layout em grade 6x mais espalhado que gerou o problema).
      const spanPerState = xSpan / nodes.length;
      expect(spanPerState, `${level.label}: x-span/estado=${spanPerState.toFixed(0)}px — layout espalhado demais`).toBeLessThan(500);
      expect(xSpan, `${level.label}: grafo sem nenhuma variação horizontal`).toBeGreaterThan(0);
      expect(ySpan, `${level.label}: grafo sem nenhuma variação vertical`).toBeGreaterThan(0);
    });
  }
});

// ─── Toda transição é demonstrada por alguma simulação (regressão) ──────────
describe('MT Reconhecedora — toda transição do grafo final aparece em alguma simulação real', () => {
  for (const level of MT_RECON_LEVELS) {
    it(`${level.label}: nenhuma transição fica "só revelada", todas aparecem numa palavra simulada`, () => {
      const finalGraph = lastGraphStep(level).stateUpdate;
      const covered = transitionsCoveredBySimulations(level);
      const undemonstrated = finalGraph.transitions.filter(t => {
        if (covered.has(transKey(t))) return false;
        return !KNOWN_DEAD_TRANSITIONS.has(`${level.label}|${transKey(t)}`);
      });
      expect(
        undemonstrated,
        undemonstrated.length
          ? `${level.label}: ${undemonstrated.length} transição(ões) nunca aparecem numa simulação — ` +
            undemonstrated.map(t => `${t.from}->${t.to} (${t.read || '□'};${t.write || '□'},${t.move})`).join(', ') +
            `. Se forem estruturalmente inalcançáveis (confirmar por busca exaustiva), adicione a chave ` +
            `"${level.label}|from|to|read|write|move" em KNOWN_DEAD_TRANSITIONS — não silencie sem confirmar.`
          : undefined
      ).toHaveLength(0);
    });
  }
});
