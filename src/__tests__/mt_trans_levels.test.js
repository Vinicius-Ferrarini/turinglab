// ─── Testes de MT Transdutora ─────────────────────────────────────────────────
// Espelha mt_recon_levels.test.js: bateria de testWords bate com o gabarito
// real (aceita E produz a saída esperada por level.validate), e cada passo da
// aula guiada é consistente (sem transição órfã / sem LOOP).
// Níveis carregam via loadMTLevel (import() dinâmico, mesma via do app real —
// ver comentário em levels_data/mt/index.js). Top-level await resolve todos
// UMA VEZ antes da coleta dos describe/it (em vez de um import() por it(),
// que reimporta/retransforma o módulo a cada teste). Sequencial (não
// Promise.all) — os maiores arquivos (L20-L24, 5-15MB de source) disparados
// em paralelo sob a suíte completa (10 arquivos rodando junto) estouravam o
// timeout interno de RPC do worker do Vitest com o servidor de transform.
import { describe, it, expect } from 'vitest';
import { MT_LEVEL_ORDER, loadMTLevel } from '../levels_data/mt/index.js';
import { simulateTM, fuzzTMTransducer, extractTapeOutput } from '../modules/mt/utils/tmAlgorithms.js';

const MT_LEVELS = [];
for (const id of MT_LEVEL_ORDER) MT_LEVELS.push(await loadMTLevel(id));

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
  const startMarker = level.startMarker ?? null;
  function findTransition(state, sym) {
    return trans.find(t => t.from === state && (t.read === sym || (t.read === '' && sym === '□')));
  }
  const words = new Set(steps.filter(s => s.simulateWord !== undefined).map(s => s.simulateWord));
  const covered = new Set();
  for (const word of words) {
    let tape = ['□', '□', ...(startMarker != null ? [startMarker] : []), ...word.split(''), '□', '□'];
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
  'L24|q17|q17|1|1|L',
  'L24|q6|q6|+|+|L',
]);

// Pendências REAIS conhecidas (não são código morto — a transição É
// alcançável, só falta a aula demonstrá-la) que ainda não foram corrigidas.
// Diferente de KNOWN_DEAD_TRANSITIONS: aqui a correção é "adicionar uma
// simulação que passe por essa transição", não "aceitar que é inalcançável".
// Remover cada entrada da lista assim que o nível correspondente for corrigido.
const KNOWN_PENDING_UNDEMONSTRATED = new Set([
  // L10 (DESAFIO): a aula foi reescrita (out/2026) para simular 'aba' transição
  // por transição via buildTransducerSim — passou de 5 para ~122 passos. 'aba'
  // sozinha cobre 67/76 transições; as 9 abaixo só disparam com outra ordem de
  // decodificação (q8/q9 varrendo à direita por cima de S/1/A/B, ou q13/q15
  // varrendo à esquerda). 'aba'+'abab' cobriria 5 delas, mas 'abab' são ~185
  // micro-passos — não vale inflar a aula. Em aberto: simular +1 palavra
  // escolhida, ou provar inalcançabilidade e mover para KNOWN_DEAD_TRANSITIONS.
  'L10|q8|q8|A|A|R', 'L10|q8|q8|B|B|R',
  'L10|q9|q9|S|S|R', 'L10|q9|q9|A|A|R', 'L10|q9|q9|B|B|R', 'L10|q9|q9|1|1|R',
  'L10|q13|q13|S|S|L', 'L10|q13|q13|1|1|L',
  'L10|q15|q15|B|B|L',
]);

function pickSabotageSymbol(original, tapeAlphabet) {
  const pool = (tapeAlphabet ?? []).filter(s => s !== original && s !== '');
  return pool[0] ?? (original === 'X' ? 'Y' : 'X');
}

// ─── Regressão: nenhuma célula de write é trocável sem que a validação note ──
// Mutation testing: troca só o WRITE de uma transição por vez (mantém
// read/move/from/to — controle da MT intacto) e roda fuzzTMTransducer de
// novo. Se ainda passar (ok:true), aquela célula pode estar errada sem que
// "✓ Validar MT" jamais avise — a classe de bug corrigida em §3.2.
//
// RATCHET, não allowlist de "confirmado inalcançável": diferente de
// KNOWN_DEAD_TRANSITIONS/KNOWN_PENDING_UNDEMONSTRATED acima (que enumeram
// transições específicas já investigadas), aqui os números abaixo são uma
// FOTOGRAFIA HONESTA do estado atual, tirada logo após ligar a checagem de
// saída (docs/PLAN_BATERIA_VALIDACAO_MT.md §3.2/§4): 7 dos 21 níveis já
// ficam 100% blindados (todo write é detectável); os outros 14 — sobretudo
// as MTs de tabela de multiplicação/carry (L16-L23) e a cifra de
// substituição (L11) — ainda têm células cujo valor errado não muda a saída
// das palavras testadas hoje (ex.: combinação de dígito+carry que não
// aparece em nenhum testWord atual). Fechar isso de vez exige expandir
// testWords por nível (trabalho de conteúdo, não só código) — rastreado
// como item em aberto, não escondido: o teto abaixo BLOQUEIA regressão (não
// pode aumentar) mas não finge que já está tudo coberto. Ao adicionar
// testWords que fechem gaps de um nível, DIMINUA o número correspondente.
const KNOWN_WRITE_GAP_CEILING = {
  // Diferente dos outros: 86 das 90 células do L11 leem um caractere FORA do
  // alfabeto oficialmente declarado (level.alphabet só tem A,B,C/a,b,c/0,1,2/
  // espaço/vírgula/ponto — mas o gabarito tem regras pra D-Z, dígitos 3-9,
  // pontuação etc., herdadas de uma versão mais ampla da cifra). Nenhum
  // testWord válido (restrito ao alfabeto declarado) jamais alcança essas
  // células — não é "faltou testWord", é estrutural dado o alfabeto atual.
  // As 4 alcançáveis (read='0'/'.') já foram fechadas com "0"/"." em
  // testWords. Ver também o aviso "[GABARITO NÃO-OFICIAL... validar com o
  // professor]" no cabeçalho de L11.js — não expandi o alfabeto declarado
  // pra não tomar essa decisão de conteúdo sem confirmação.
  L11: 86,
  L10: 4, L12: 22, L14: 36, L16: 17, L17: 27, L18: 38,
  L19: 48, L20: 59, L21: 70, L22: 81, L23: 91, L24: 1,
};

describe('MT Transdutora — nenhuma célula de write é trocável sem que a validação note (além do teto conhecido)', () => {
  for (const level of MT_LEVELS) {
    it(`${level.label}: write(s) trocável(is) sem detecção não passa do teto conhecido`, () => {
      const graph = lastGraphStep(level).stateUpdate;
      const transitions = graph.transitions;
      const undetected = [];
      for (let i = 0; i < transitions.length; i++) {
        const t = transitions[i];
        if (t.write === '') continue; // preservar branco é quase sempre estrutural
        const sabotagedWrite = pickSabotageSymbol(t.write, level.tapeAlphabet);
        const mutated = { states: graph.nodes, transitions: transitions.map((tt, idx) => idx === i ? { ...tt, write: sabotagedWrite } : tt) };
        const res = fuzzTMTransducer(mutated, level);
        if (res.ok) undetected.push(t);
      }
      const ceiling = KNOWN_WRITE_GAP_CEILING[level.label] ?? 0;
      expect(
        undetected.length,
        undetected.length > ceiling
          ? `${level.label}: ${undetected.length} write(s) trocável(is) sem a validação notar (teto conhecido: ` +
            `${ceiling}) — NOVA regressão: ` +
            undetected.map(t => `${t.from}->${t.to} (${t.read || '□'};${t.write || '□'},${t.move})`).join(', ') +
            `. Adicione um testWord que force a(s) célula(s) nova(s) a aparecer na saída final.`
          : undefined
      ).toBeLessThanOrEqual(ceiling);
    });
  }
});

describe('MT Transdutora — sanidade básica de cada nível', () => {
  for (const level of MT_LEVELS) {
    it(`${level.label}: tem estado inicial, ao menos um final, e alfabeto`, () => {
      const nodes = lastGraphStep(level).stateUpdate.nodes;
      expect(nodes.some(n => n.isInitial), `${level.label}: sem estado inicial`).toBe(true);
      expect(nodes.some(n => n.isFinal), `${level.label}: sem estado final`).toBe(true);
      expect(level.alphabet?.length, `${level.label}: alfabeto vazio`).toBeGreaterThan(0);
    });

    it(`${level.label}: testWords não está vazia e validate é uma função`, () => {
      expect(level.testWords?.length, `${level.label}: sem testWords`).toBeGreaterThan(0);
      expect(typeof level.validate, `${level.label}: sem validate()`).toBe('function');
    });
  }
});

describe('MT Transdutora — gabarito aceita todas as testWords (fuzzTMTransducer)', () => {
  for (const level of MT_LEVELS) {
    it(`${level.label}: grafo do gabarito (último passo da aula) aceita toda a bateria`, () => {
      const graph = lastGraphStep(level).stateUpdate;
      const pdaLikeGraph = { states: graph.nodes, transitions: graph.transitions };
      const res = fuzzTMTransducer(pdaLikeGraph, level);
      expect(res.ok, `${level.label}: ${JSON.stringify(res)}`).toBe(true);
    });
  }
});

describe('MT Transdutora — gabarito produz a SAÍDA esperada (validate) para cada testWord', () => {
  for (const level of MT_LEVELS) {
    it(`${level.label}: fita final (sem marcadores/brancos) bate com level.validate(w)`, () => {
      const graph = lastGraphStep(level).stateUpdate;
      const pdaLikeGraph = { states: graph.nodes, transitions: graph.transitions };
      const words = level.skipEmptyWord ? level.testWords.filter(w => w !== '') : level.testWords;
      for (const w of words) {
        const { status, tape } = simulateTM(pdaLikeGraph, w, 2000, level.startMarker ?? null);
        expect(status, `${level.label}: "${w}" não foi ACCEPTED (${status})`).toBe('ACCEPTED');
        const got = extractTapeOutput(tape, level.startMarker ?? level.outputMarker ?? null);
        const expected = level.validate(w);
        expect(got, `${level.label}: "${w}" → esperado "${expected}", obteve "${got}"`).toBe(expected);
      }
    });
  }
});

// ─── Regressão: aceitar em estado final não basta, a fita tem que bater ────
// Hoje (antes do fix), fuzzTMTransducer só checa se a MT chega num estado
// final — NUNCA compara o conteúdo escrito com level.validate(word). Ver
// docs/PLAN_BATERIA_VALIDACAO_MT.md §3.2. Fixture mínima: MT de 2 estados que
// aceita "a" mas escreve um símbolo fixo ERRADO (nunca relido por nenhuma
// transição, pra isolar exatamente esse buraco, sem depender de nenhum nível
// real).
const WRONG_OUTPUT_FIXTURE_LEVEL = {
  alphabet: ['a'],
  testWords: ['a'],
  validate: (w) => (w === 'a' ? 'X' : null),
};
function wrongOutputGraph(write) {
  return {
    states: [
      { id: 'q0', isInitial: true, isFinal: false },
      { id: 'q1', isInitial: false, isFinal: true },
    ],
    transitions: [
      { from: 'q0', to: 'q1', read: 'a', write, move: 'R' },
    ],
  };
}

describe('MT Transdutora — aceitar em estado final não basta, a fita tem que bater', () => {
  it('MT que aceita mas escreve símbolo errado numa célula não afetada pelo controle deve falhar na validação', () => {
    const res = fuzzTMTransducer(wrongOutputGraph('Z'), WRONG_OUTPUT_FIXTURE_LEVEL);
    expect(res.ok, `esperado ok:false (escreveu "Z", validate() espera "X") — obteve ${JSON.stringify(res)}`).toBe(false);
  });

  it('MT com fita correta continua passando (sem falso-positivo do endurecimento)', () => {
    const res = fuzzTMTransducer(wrongOutputGraph('X'), WRONG_OUTPUT_FIXTURE_LEVEL);
    expect(res.ok, `esperado ok:true (escreveu "X", igual a validate()) — obteve ${JSON.stringify(res)}`).toBe(true);
  });
});

describe('MT Transdutora — checkpoints por passo (aula guiada reflete o grafo parcial)', () => {
  for (const level of MT_LEVELS) {
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

    it(`${level.label}: simulações da aula (simulateWord presente) nunca entram em LOOP`, () => {
      for (const [idx, step] of graphSteps.entries()) {
        if (step.simulateWord === undefined) continue;
        const graph = { states: step.stateUpdate.nodes, transitions: step.stateUpdate.transitions };
        const { status } = simulateTM(graph, step.simulateWord, 3000, level.startMarker ?? null);
        expect(status, `${level.label} step[${idx}]: simulação de "${step.simulateWord || 'λ'}" entrou em LOOP`).not.toBe('LOOP');
      }
    });
  }
});

describe('MT Transdutora — passos com status ACCEPTED/REJECTED batem com simulateTM real', () => {
  for (const level of MT_LEVELS) {
    it(`${level.label}: veredito de cada passo terminal da aula bate com o motor real`, () => {
      const steps = level.guidedLesson.steps.filter(s => s.status && s.stateUpdate);
      expect(steps.length, `${level.label}: aula sem nenhum passo com veredito`).toBeGreaterThan(0);
      for (const step of steps) {
        const graph = { states: step.stateUpdate.nodes, transitions: step.stateUpdate.transitions };
        const { status } = simulateTM(graph, step.simulateWord, 2000, level.startMarker ?? null);
        expect(status, `${level.label} step com status "${step.status}" para "${step.simulateWord}": simulateTM real deu "${status}"`).toBe(step.status);
      }
    });
  }
});

// ─── Toda transição é demonstrada por alguma simulação (regressão) ──────────
describe('MT Transdutora — toda transição do grafo final aparece em alguma simulação real', () => {
  for (const level of MT_LEVELS) {
    it(`${level.label}: nenhuma transição fica "só revelada", todas aparecem numa palavra simulada`, () => {
      const finalGraph = lastGraphStep(level).stateUpdate;
      const covered = transitionsCoveredBySimulations(level);
      const undemonstrated = finalGraph.transitions.filter(t => {
        if (covered.has(transKey(t))) return false;
        const key = `${level.label}|${transKey(t)}`;
        return !KNOWN_DEAD_TRANSITIONS.has(key) && !KNOWN_PENDING_UNDEMONSTRATED.has(key);
      });
      expect(
        undemonstrated,
        undemonstrated.length
          ? `${level.label}: ${undemonstrated.length} transição(ões) nunca aparecem numa simulação — ` +
            undemonstrated.map(t => `${t.from}->${t.to} (${t.read || '□'};${t.write || '□'},${t.move})`).join(', ') +
            `. Se forem estruturalmente inalcançáveis (confirmar por busca exaustiva), adicione a chave ` +
            `"${level.label}|from|to|read|write|move" em KNOWN_DEAD_TRANSITIONS. Se forem alcançáveis mas ` +
            `ainda não corrigidas, adicione em KNOWN_PENDING_UNDEMONSTRATED — não silencie sem categorizar.`
          : undefined
      ).toHaveLength(0);
    });
  }
});
