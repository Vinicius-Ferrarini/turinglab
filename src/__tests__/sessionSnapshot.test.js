import { describe, it, expect } from 'vitest';
import { buildSnapshot, isValidSnapshot, SCHEMA_VERSION } from '../modules/shared/persistence/sessionSnapshot.js';

// ─── Fixtures por módulo (nomes de campo = estado real dos orquestradores,
// ver §3 de docs/prompts/PROMPT_persistencia_sessao_e_exportacao.md) ──────────
const afdPayload = {
  nodes: [
    { id: 'q0', label: 'q0', x: 100, y: 100, isInitial: true, isFinal: false },
    { id: 'q1', label: 'q1', x: 300, y: 100, isInitial: false, isFinal: true },
  ],
  transitions: [{ from: 'q0', to: 'q1', symbol: 'a' }],
  testWords: [{ word: 'a', status: 'correct' }],
  isDrawingUnlocked: true,
  hintStage: 1,
  showVictoryScreen: false,
  showImpossibleScreen: false,
  formal: {
    inputQ: '{q0, q1}', inputSigma: '{a}', inputInitial: 'q0', inputFinal: 'q1',
    areElementsValid: false, parsedQ: [], parsedSigma: [], transitionTableData: {},
  },
};

const apPayload = {
  nodes: [{ id: 'q0', label: 'q0', x: 50, y: 50, isInitial: true }],
  transitions: [{ from: 'q0', to: 'q0', read: 'a', pop: 'Z', push: 'AZ' }],
  testedWords: [{ word: 'a', mode: 'LANGUAGE', status: 'wrong' }],
  isDrawingUnlocked: false,
  hintStage: 0,
  testMode: 'LANGUAGE',
  victory: false,
  formal: {
    inE: '', inSigma: '', inGamma: '', inInitial: '', inBottom: '',
    elementsValid: false, rows: [], cells: {},
  },
};

const mtReconPayload = {
  nodes: [{ id: 'q0', label: 'q0', x: 10, y: 10, isInitial: true, isFinal: false }],
  transitions: [{ from: 'q0', to: 'q0', read: 'a', write: 'a', move: 'R' }],
  testedWords: [{ word: 'aa', mode: 'DRAWING', accepted: true }],
  isDrawingUnlocked: true,
  hintStage: 2,
  testMode: 'DRAWING',
  victory: false,
  formal: {
    formalAnswers: { states: '', sigma: '', gamma: '', initial: '', blank: '', final: '', deltaCells: {} },
    formalElementsValid: false,
  },
};

const mtTransPayload = {
  nodes: [{ id: 'q0', label: 'q0', x: 10, y: 10, isInitial: true, isFinal: true }],
  transitions: [{ from: 'q0', to: 'q0', read: 'a', write: 'b', move: 'R' }],
  linguagemTests: [{ word: 'a', status: 'ACCEPTED', output: 'b' }],
  desenhoTests: [{ word: 'a', status: 'ACCEPTED', output: 'b' }],
  activeTab: 'desenho',
  victory: true,
  formal: {
    formalAnswers: { states: '', sigma: '', gamma: '', initial: '', blank: '', final: '', deltaCells: {} },
    formalElementsValid: false,
  },
};

// ─── Suite 1: buildSnapshot — envelope ────────────────────────────────────────
describe('buildSnapshot', () => {
  it('envolve o payload num envelope com schemaVersion/app/moduleKey/levelId/savedAt', () => {
    const snap = buildSnapshot('afd-p1', 12, afdPayload);
    expect(snap.schemaVersion).toBe(SCHEMA_VERSION);
    expect(snap.app).toBe('turinglab');
    expect(snap.moduleKey).toBe('afd-p1');
    expect(snap.levelId).toBe(12);
    expect(typeof snap.savedAt).toBe('string');
    expect(snap.payload).toEqual(afdPayload);
  });

  it('aceita levelLabel opcional (só informativo)', () => {
    const snap = buildSnapshot('afd-p1', 12, afdPayload, 'L12');
    expect(snap.levelLabel).toBe('L12');
  });
});

// ─── Suite 2: roundtrip válido para os 4 moduleKey ────────────────────────────
describe('isValidSnapshot — roundtrip (JSON.stringify/parse, como localStorage/arquivo)', () => {
  const cases = [
    ['afd-p1', afdPayload],
    ['ap', apPayload],
    ['mt-recon', mtReconPayload],
    ['mt-trans', mtTransPayload],
  ];

  for (const [moduleKey, payload] of cases) {
    it(`${moduleKey}: snapshot válido sobrevive a stringify/parse sem alteração`, () => {
      const snap = buildSnapshot(moduleKey, 7, payload);
      const roundtripped = JSON.parse(JSON.stringify(snap));
      const res = isValidSnapshot(roundtripped, moduleKey, 7);
      expect(res.ok).toBe(true);
      expect(roundtripped.payload).toEqual(payload);
    });
  }
});

// ─── Suite 3: grafo estruturalmente inválido é salvo/restaurado tal como está ─
describe('isValidSnapshot — grafo estruturalmente inválido não é rejeitado', () => {
  it('AFD não-determinístico (2 transições mesmo from/symbol) sobrevive intacto', () => {
    const nondeterministic = {
      ...afdPayload,
      transitions: [
        { from: 'q0', to: 'q1', symbol: 'a' },
        { from: 'q0', to: 'q0', symbol: 'a' }, // duplicata de símbolo — não-determinístico
      ],
    };
    const snap = buildSnapshot('afd-p1', 3, nondeterministic);
    const roundtripped = JSON.parse(JSON.stringify(snap));
    const res = isValidSnapshot(roundtripped, 'afd-p1', 3);
    expect(res.ok).toBe(true);
    expect(roundtripped.payload.transitions).toEqual(nondeterministic.transitions);
  });

  it('estado sem isInitial/isFinal definidos sobrevive intacto', () => {
    const noFlags = {
      ...afdPayload,
      nodes: [{ id: 'q0', label: 'q0', x: 0, y: 0, isInitial: false, isFinal: false }],
    };
    const snap = buildSnapshot('afd-p1', 3, noFlags);
    const res = isValidSnapshot(JSON.parse(JSON.stringify(snap)), 'afd-p1', 3);
    expect(res.ok).toBe(true);
  });

  it('transição em branco (symbol vazio) sobrevive intacta', () => {
    const blank = { ...afdPayload, transitions: [{ from: 'q0', to: 'q1', symbol: '' }] };
    const snap = buildSnapshot('afd-p1', 3, blank);
    const roundtripped = JSON.parse(JSON.stringify(snap));
    const res = isValidSnapshot(roundtripped, 'afd-p1', 3);
    expect(res.ok).toBe(true);
    expect(roundtripped.payload.transitions[0].symbol).toBe('');
  });
});

// ─── Suite 4: schemaVersion incompatível — rejeitado sem lançar ───────────────
describe('isValidSnapshot — schemaVersion incompatível', () => {
  it('schemaVersion futura/desconhecida → { ok: false }, nunca lança', () => {
    const snap = buildSnapshot('afd-p1', 1, afdPayload);
    snap.schemaVersion = SCHEMA_VERSION + 1;
    expect(() => isValidSnapshot(snap, 'afd-p1', 1)).not.toThrow();
    const res = isValidSnapshot(snap, 'afd-p1', 1);
    expect(res.ok).toBe(false);
    expect(res.reason).toBeTruthy();
  });

  it('JSON malformado/objeto solto (não-envelope) → { ok: false }, nunca lança', () => {
    expect(() => isValidSnapshot({ nodes: [] }, 'afd-p1', 1)).not.toThrow();
    expect(isValidSnapshot({ nodes: [] }, 'afd-p1', 1).ok).toBe(false);
    expect(() => isValidSnapshot(null, 'afd-p1', 1)).not.toThrow();
    expect(isValidSnapshot(null, 'afd-p1', 1).ok).toBe(false);
    expect(() => isValidSnapshot('não é um objeto', 'afd-p1', 1)).not.toThrow();
    expect(isValidSnapshot('não é um objeto', 'afd-p1', 1).ok).toBe(false);
    expect(() => isValidSnapshot(undefined, 'afd-p1', 1)).not.toThrow();
    expect(isValidSnapshot(undefined, 'afd-p1', 1).ok).toBe(false);
  });

  it('moduleKey do snapshot diferente do esperado → { ok: false }', () => {
    const snap = buildSnapshot('ap', 1, apPayload);
    const res = isValidSnapshot(snap, 'mt-recon', 1);
    expect(res.ok).toBe(false);
  });

  it('levelId do snapshot diferente do esperado → { ok: false }', () => {
    const snap = buildSnapshot('afd-p1', 5, afdPayload);
    const res = isValidSnapshot(snap, 'afd-p1', 6);
    expect(res.ok).toBe(false);
  });
});

// ─── Suite 5: payload de um módulo não vaza campo de outro ────────────────────
describe('isValidSnapshot — payload não vaza campos de outro módulo', () => {
  it('linguagemTests/desenhoTests (só mt-trans) não são aceitos em afd-p1', () => {
    const leaked = { ...afdPayload, linguagemTests: [], desenhoTests: [] };
    const snap = buildSnapshot('afd-p1', 1, leaked);
    const res = isValidSnapshot(snap, 'afd-p1', 1);
    expect(res.ok).toBe(false);
  });

  it('testMode (só ap/mt-recon) não é aceito em mt-trans', () => {
    const leaked = { ...mtTransPayload, testMode: 'LANGUAGE' };
    const snap = buildSnapshot('mt-trans', 1, leaked);
    const res = isValidSnapshot(snap, 'mt-trans', 1);
    expect(res.ok).toBe(false);
  });

  it('isDrawingUnlocked/hintStage (mt-trans não tem essa mecânica) não são aceitos em mt-trans', () => {
    const leaked = { ...mtTransPayload, isDrawingUnlocked: true, hintStage: 0 };
    const snap = buildSnapshot('mt-trans', 1, leaked);
    const res = isValidSnapshot(snap, 'mt-trans', 1);
    expect(res.ok).toBe(false);
  });
});

// ─── Suite 6: fixture grande de MT (L23/L24-like) — nada trunca ───────────────
// Não usa o guidedLesson real (pesado) — só o FORMATO de nodes/transitions/
// testes, com volume real (dezenas de estados, >100 testes em cada bateria).
describe('isValidSnapshot — fixture grande de MT Transdutora (histórico longo)', () => {
  it('grafo com muitas transições e 150+ entradas em linguagemTests/desenhoTests não trunca', () => {
    const bigNodes = Array.from({ length: 40 }, (_, i) => ({
      id: `q${i}`, label: `q${i}`, x: i * 20, y: 0,
      isInitial: i === 0, isFinal: i === 39,
    }));
    const bigTransitions = Array.from({ length: 120 }, (_, i) => ({
      from: `q${i % 40}`, to: `q${(i + 1) % 40}`, read: i % 2 === 0 ? '0' : '1', write: '1', move: 'R',
    }));
    const bigLinguagemTests = Array.from({ length: 150 }, (_, i) => ({
      word: `w${i}`, status: i % 3 === 0 ? 'REJECTED' : 'ACCEPTED', output: `o${i}`,
    }));
    const bigDesenhoTests = Array.from({ length: 130 }, (_, i) => ({
      word: `d${i}`, status: 'ACCEPTED', output: `x${i}`,
    }));
    const bigPayload = {
      ...mtTransPayload,
      nodes: bigNodes,
      transitions: bigTransitions,
      linguagemTests: bigLinguagemTests,
      desenhoTests: bigDesenhoTests,
    };
    const snap = buildSnapshot('mt-trans', 23, bigPayload, 'L23');
    const roundtripped = JSON.parse(JSON.stringify(snap));
    const res = isValidSnapshot(roundtripped, 'mt-trans', 23);
    expect(res.ok).toBe(true);
    expect(roundtripped.payload.nodes).toHaveLength(40);
    expect(roundtripped.payload.transitions).toHaveLength(120);
    expect(roundtripped.payload.linguagemTests).toHaveLength(150);
    expect(roundtripped.payload.desenhoTests).toHaveLength(130);
    expect(roundtripped.payload.linguagemTests[149]).toEqual(bigLinguagemTests[149]);
  });
});
