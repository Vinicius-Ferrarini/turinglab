import { describe, it, expect } from 'vitest';
import { validateAFDPure, findDuplicateSymbol } from '../modules/afd/hooks/useAFDGraph.js';

// ─── Grafo base: q0 -a-> q1(final), q0 -b-> q0 ──────────────────────────────
// Reconhece b*a  (pelo menos um 'a' no final, precedido de qualquer qtd de 'b')
const BASE_NODES = [
  { id: 'q0', isInitial: true,  isFinal: false },
  { id: 'q1', isInitial: false, isFinal: true  },
];
const BASE_TRANS = [
  { from: 'q0', to: 'q1', symbol: 'a' },
  { from: 'q0', to: 'q0', symbol: 'b' },
];
const LEVEL_BA = {
  alphabet: ['a', 'b'],
  regex: /^b*a$/,
};

// ─── Suite 1: falhas estruturais ─────────────────────────────────────────────
describe('validateAFDPure — falhas estruturais', () => {

  it('sem estado inicial → ok: false, reason: no_initial', () => {
    const nodes = BASE_NODES.map(n => ({ ...n, isInitial: false }));
    expect(validateAFDPure({ nodes, transitions: BASE_TRANS }))
      .toMatchObject({ ok: false, reason: 'no_initial' });
  });

  it('sem estado final → ok: false, reason: no_final', () => {
    const nodes = BASE_NODES.map(n => ({ ...n, isFinal: false }));
    expect(validateAFDPure({ nodes, transitions: BASE_TRANS }))
      .toMatchObject({ ok: false, reason: 'no_final' });
  });

  it('transição com símbolo em branco → ok: false, reason: empty_symbol', () => {
    const trans = [...BASE_TRANS, { from: 'q1', to: 'q0', symbol: '' }];
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: trans }))
      .toMatchObject({ ok: false, reason: 'empty_symbol' });
  });

  it('não-determinismo (símbolo duplicado em um nó) → ok: false, reason: nondeterministic, cita nó e símbolo', () => {
    const trans = [
      { from: 'q0', to: 'q1', symbol: 'a' },
      { from: 'q0', to: 'q0', symbol: 'a' }, // 'a' duplicado em q0
    ];
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: trans }))
      .toMatchObject({ ok: false, reason: 'nondeterministic', nodeId: 'q0', symbol: 'a' });
  });

  it('símbolo fora do alfabeto → ok: false, reason: invalid_symbol', () => {
    const trans = [
      { from: 'q0', to: 'q1', symbol: 'a' },
      { from: 'q0', to: 'q0', symbol: 'c' }, // 'c' não está em {a,b}
    ];
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: trans, currentLevel: LEVEL_BA }))
      .toMatchObject({ ok: false, reason: 'invalid_symbol' });
  });

  it('símbolo múltiplo com um inválido → ok: false, reason: invalid_symbol', () => {
    const trans = [
      { from: 'q0', to: 'q1', symbol: 'a,c' }, // 'c' inválido
    ];
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: trans, currentLevel: LEVEL_BA }))
      .toMatchObject({ ok: false, reason: 'invalid_symbol' });
  });

});

// ─── Suite 2: testWords ───────────────────────────────────────────────────────
describe('validateAFDPure — testWords', () => {

  it('palavra que deveria ser aceita mas é rejeitada → ok: false, reason: word_mismatch', () => {
    // grafo aceita b*a; pedimos que 'b' seja aceita (errado)
    const testWords = [{ word: 'b', status: 'correct' }];
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: BASE_TRANS, testWords }))
      .toMatchObject({ ok: false, reason: 'word_mismatch', word: 'b', shouldAccept: true });
  });

  it('palavra que deveria ser rejeitada mas é aceita → ok: false, reason: word_mismatch', () => {
    // grafo aceita b*a; pedimos que 'a' seja rejeitada (errado)
    const testWords = [{ word: 'a', status: 'wrong' }]; // status != 'shortest'|'correct' → shouldAccept=false
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: BASE_TRANS, testWords }))
      .toMatchObject({ ok: false, reason: 'word_mismatch' });
  });

  it('testWords corretas (aceitas e rejeitadas alinhadas) → ok: true', () => {
    const testWords = [
      { word: 'a',  status: 'correct' },
      { word: 'ba', status: 'shortest' },
      { word: 'b',  status: 'wrong'   },
    ];
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: BASE_TRANS, testWords }))
      .toMatchObject({ ok: true });
  });

  it('λ (palavra vazia) com status correct em grafo que não aceita λ → word_mismatch', () => {
    const testWords = [{ word: 'λ', status: 'correct' }];
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: BASE_TRANS, testWords }))
      .toMatchObject({ ok: false, reason: 'word_mismatch' });
  });

});

// ─── Suite 3: equivalência de linguagem (fuzzer) ─────────────────────────────
describe('validateAFDPure — equivalência de linguagem', () => {

  it('grafo correto vs regex → ok: true', () => {
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: BASE_TRANS, currentLevel: LEVEL_BA }))
      .toMatchObject({ ok: true });
  });

  it('grafo incorreto vs regex → ok: false, reason: language_mismatch', () => {
    // Grafo que aceita tudo (q0 é inicial e final, sem transições)
    const nodes = [{ id: 'q0', isInitial: true, isFinal: true }];
    expect(validateAFDPure({ nodes, transitions: [], currentLevel: LEVEL_BA }))
      .toMatchObject({ ok: false, reason: 'language_mismatch' });
  });

  it('grafo não-minimizado (estado redundante) mas equivalente → ok: true', () => {
    // Reconhece b*a com 3 estados: q0 -b-> q0, q0 -a-> q1, q1 -a-> q2(final), q1 -b-> q2(final)
    // q1 e q2 são equivalentes (ambos finais, sem saídas — estados mortos para fins do teste)
    // Na prática: q0 -a-> q1 e q0 -b-> q0, q1(final)  +  copia q1 como q2(final) ligado de q1
    const nodes = [
      { id: 'q0', isInitial: true,  isFinal: false },
      { id: 'q1', isInitial: false, isFinal: true  },
      { id: 'q2', isInitial: false, isFinal: true  }, // redundante: cópia de q1
    ];
    const trans = [
      { from: 'q0', to: 'q2', symbol: 'a' }, // vai para o estado redundante
      { from: 'q0', to: 'q0', symbol: 'b' },
    ];
    expect(validateAFDPure({ nodes, transitions: trans, currentLevel: LEVEL_BA }))
      .toMatchObject({ ok: true });
  });

  it('grafo correto vs função validate → ok: true', () => {
    const levelWithValidate = {
      alphabet: ['a', 'b'],
      validate: (w) => /^b*a$/.test(w),
    };
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: BASE_TRANS, currentLevel: levelWithValidate }))
      .toMatchObject({ ok: true });
  });

  it('contraexemplo retornado quando linguagem diverge', () => {
    // Grafo que aceita apenas 'a' (sem o loop b*), testado contra b*a
    const nodes = [
      { id: 'q0', isInitial: true,  isFinal: false },
      { id: 'q1', isInitial: false, isFinal: true  },
    ];
    const trans = [{ from: 'q0', to: 'q1', symbol: 'a' }];
    // 'ba' pertence à linguagem mas o grafo rejeita (q0 não tem transição 'b')
    const result = validateAFDPure({ nodes, transitions: trans, currentLevel: LEVEL_BA });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('language_mismatch');
    expect(result.counterexample).toBeDefined();
  });

});

// ─── Suite 4: sem nível definido ──────────────────────────────────────────────
describe('validateAFDPure — sem currentLevel', () => {

  it('grafo estruturalmente válido sem nível → ok: true (sem fuzzer)', () => {
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: BASE_TRANS }))
      .toMatchObject({ ok: true });
  });

  it('sem alfabeto definido → símbolos não são validados contra alfabeto', () => {
    const trans = [{ from: 'q0', to: 'q1', symbol: 'z' }]; // símbolo qualquer
    expect(validateAFDPure({ nodes: BASE_NODES, transitions: trans }))
      .toMatchObject({ ok: true });
  });

});

// ─── Suite 5: findDuplicateSymbol (função pura) ──────────────────────────────
describe('findDuplicateSymbol', () => {

  it('sem duplicata → null', () => {
    const trans = [
      { from: 'q0', to: 'q1', symbol: 'a' },
      { from: 'q0', to: 'q0', symbol: 'b' },
    ];
    expect(findDuplicateSymbol('q0', trans)).toBeNull();
  });

  it('duplicata simples em duas transições distintas → símbolo duplicado', () => {
    const trans = [
      { from: 'q0', to: 'q1', symbol: 'a' },
      { from: 'q0', to: 'q0', symbol: 'a' },
    ];
    expect(findDuplicateSymbol('q0', trans)).toBe('a');
  });

  it('duplicata dentro de um chip multi-símbolo ("a,b" repetindo "a" em outra seta) → símbolo duplicado', () => {
    const trans = [
      { from: 'q0', to: 'q1', symbol: 'a,b' },
      { from: 'q0', to: 'q0', symbol: 'a' },
    ];
    expect(findDuplicateSymbol('q0', trans)).toBe('a');
  });

  it('duplicata só em outro nó → null (não conta duplicatas de outros estados)', () => {
    const trans = [
      { from: 'q0', to: 'q1', symbol: 'a' },
      { from: 'q1', to: 'q1', symbol: 'a' },
      { from: 'q1', to: 'q0', symbol: 'a' }, // duplicado em q1, não em q0
    ];
    expect(findDuplicateSymbol('q0', trans)).toBeNull();
  });

});
