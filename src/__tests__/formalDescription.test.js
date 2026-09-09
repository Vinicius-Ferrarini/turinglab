import { describe, it, expect } from 'vitest';
import {
  parseFormalInput,
  checkFormalBraceFormat,
  validateFormalElements,
  validateFormalTransitions,
  EMPTY_FORMAL_STATE,
  buildFormalStateSnapshot,
  normalizeFormalInitialValues,
} from '../modules/afd/utils/formalDescriptionLogic.js';

// ─── Canvas base: q0(inicial) -a-> q1(final), q0 -b-> q0 ────────────────────
const NODES = [
  { id: 'q0', label: 'q0', isInitial: true,  isFinal: false },
  { id: 'q1', label: 'q1', isInitial: false, isFinal: true  },
];
const TRANSITIONS = [
  { from: 'q0', to: 'q1', symbol: 'a' },
  { from: 'q0', to: 'q0', symbol: 'b' },
];
const ALPHABET = ['a', 'b'];

// ─── Suite 1: parseFormalInput ────────────────────────────────────────────────
describe('parseFormalInput', () => {

  it('elemento único sem chaves → array com 1 item', () => {
    expect(parseFormalInput('q0')).toEqual(['q0']);
  });

  it('múltiplos elementos com chaves → array correto', () => {
    expect(parseFormalInput('{q0, q1}')).toEqual(['q0', 'q1']);
  });

  it('múltiplos elementos sem chaves → array correto (parsing não bloqueia aqui)', () => {
    expect(parseFormalInput('q0, q1')).toEqual(['q0', 'q1']);
  });

  it('string vazia → array vazio', () => {
    expect(parseFormalInput('')).toEqual([]);
  });

  it('string nula → array vazio', () => {
    expect(parseFormalInput(null)).toEqual([]);
  });

  it('"{}" → array vazio (conjunto vazio)', () => {
    expect(parseFormalInput('{}')).toEqual([]);
  });

  it('espaços extras são normalizados', () => {
    expect(parseFormalInput('{ q0 , q1 }')).toEqual(['q0', 'q1']);
  });

});

// ─── Suite 2: checkFormalBraceFormat ─────────────────────────────────────────
describe('checkFormalBraceFormat', () => {

  it('1 elemento sem chaves → null (correto)', () => {
    expect(checkFormalBraceFormat('q0')).toBeNull();
  });

  it('múltiplos elementos com chaves → null (correto)', () => {
    expect(checkFormalBraceFormat('{q0, q1}')).toBeNull();
  });

  it('múltiplos elementos SEM chaves → multi_needs_braces', () => {
    expect(checkFormalBraceFormat('q0, q1')).toBe('multi_needs_braces');
  });

  it('1 elemento COM chaves → single_no_braces', () => {
    expect(checkFormalBraceFormat('{q0}')).toBe('single_no_braces');
  });

  it('string vazia → null', () => {
    expect(checkFormalBraceFormat('')).toBeNull();
  });

  it('"{}" → null (conjunto vazio aceito)', () => {
    expect(checkFormalBraceFormat('{}')).toBeNull();
  });

  // isSingle=true (campo q₀ — nunca pode ter chaves)
  it('isSingle: "q0" sem chaves → null (correto)', () => {
    expect(checkFormalBraceFormat('q0', true)).toBeNull();
  });

  it('isSingle: "{q0}" com chaves → single_no_braces', () => {
    expect(checkFormalBraceFormat('{q0}', true)).toBe('single_no_braces');
  });

  it('isSingle: só abre chave "{q0" → single_no_braces', () => {
    expect(checkFormalBraceFormat('{q0', true)).toBe('single_no_braces');
  });

});

// ─── Suite 3: validateFormalElements — formato de chaves ─────────────────────
describe('validateFormalElements — formato de chaves', () => {

  const base = { nodes: NODES, alphabet: ALPHABET };

  it('múltiplos elementos sem {} em Q → brace_format, erro em Q', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: 'q0, q1', inputSigma: '{a, b}', inputInitial: 'q0', inputFinal: 'q1',
    });
    expect(result).toMatchObject({ ok: false, reason: 'brace_format' });
    expect(result.fieldErrors.Q).toBeTruthy();
    expect(result.fieldErrors.Sigma).toBeNull();
  });

  it('1 elemento com {} em Σ → brace_format, erro em Sigma', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: '{q0, q1}', inputSigma: '{a}', inputInitial: 'q0', inputFinal: 'q1',
    });
    expect(result).toMatchObject({ ok: false, reason: 'brace_format' });
    expect(result.fieldErrors.Sigma).toBeTruthy();
  });

  it('q₀ com chaves → brace_format, erro em initial', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: '{q0, q1}', inputSigma: '{a, b}', inputInitial: '{q0}', inputFinal: 'q1',
    });
    expect(result).toMatchObject({ ok: false, reason: 'brace_format' });
    expect(result.fieldErrors.initial).toBeTruthy();
  });

  it('1 estado final com {} em F → brace_format, erro em final', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: '{q0, q1}', inputSigma: '{a, b}', inputInitial: 'q0', inputFinal: '{q1}',
    });
    expect(result).toMatchObject({ ok: false, reason: 'brace_format' });
    expect(result.fieldErrors.final).toBeTruthy();
  });

});

// ─── Suite 4: validateFormalElements — validação contra canvas ───────────────
describe('validateFormalElements — validação contra canvas', () => {

  const base = { nodes: NODES, alphabet: ALPHABET };

  it('tudo correto → ok: true com parsed', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: '{q0, q1}', inputSigma: '{a, b}', inputInitial: 'q0', inputFinal: 'q1',
    });
    expect(result).toMatchObject({
      ok: true,
      parsed: { Q: ['q0', 'q1'], Sigma: ['a', 'b'], initial: 'q0', final: ['q1'] },
    });
  });

  it('estado inexistente em Q → field_mismatch em Q', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: '{q0, q2}', inputSigma: '{a, b}', inputInitial: 'q0', inputFinal: 'q1',
    });
    expect(result).toMatchObject({ ok: false, reason: 'field_mismatch' });
    expect(result.fieldErrors.Q).toBeTruthy();
  });

  it('faltando estado em Q → field_mismatch em Q', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: 'q0', inputSigma: '{a, b}', inputInitial: 'q0', inputFinal: 'q1',
    });
    expect(result).toMatchObject({ ok: false, reason: 'field_mismatch' });
    expect(result.fieldErrors.Q).toBeTruthy();
  });

  it('símbolo errado em Σ → field_mismatch em Sigma', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: '{q0, q1}', inputSigma: '{a, c}', inputInitial: 'q0', inputFinal: 'q1',
    });
    expect(result.fieldErrors.Sigma).toBeTruthy();
  });

  it('estado inicial errado → field_mismatch em initial', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: '{q0, q1}', inputSigma: '{a, b}', inputInitial: 'q1', inputFinal: 'q1',
    });
    expect(result.fieldErrors.initial).toBeTruthy();
  });

  it('estado final errado → field_mismatch em final', () => {
    const result = validateFormalElements({
      ...base,
      inputQ: '{q0, q1}', inputSigma: '{a, b}', inputInitial: 'q0', inputFinal: 'q0',
    });
    expect(result.fieldErrors.final).toBeTruthy();
  });

  it('canvas com 1 estado e 1 símbolo → sem chaves em Q e Σ → ok', () => {
    const singleNode = [{ id: 'q0', label: 'q0', isInitial: true, isFinal: true }];
    const result = validateFormalElements({
      nodes: singleNode, alphabet: ['a'],
      inputQ: 'q0', inputSigma: 'a', inputInitial: 'q0', inputFinal: 'q0',
    });
    expect(result.ok).toBe(true);
  });

  it('canvas com 2 estados finais → F deve ter chaves', () => {
    const multiNodes = [
      { id: 'q0', label: 'q0', isInitial: true,  isFinal: true },
      { id: 'q1', label: 'q1', isInitial: false, isFinal: true },
    ];
    // sem chaves em F → brace_format
    const result = validateFormalElements({
      nodes: multiNodes, alphabet: ['a'],
      inputQ: '{q0, q1}', inputSigma: 'a', inputInitial: 'q0', inputFinal: 'q0, q1',
    });
    expect(result).toMatchObject({ ok: false, reason: 'brace_format' });
    expect(result.fieldErrors.final).toBeTruthy();
  });

});

// ─── Suite 5: validateFormalTransitions ──────────────────────────────────────
describe('validateFormalTransitions', () => {

  const base = { nodes: NODES, transitions: TRANSITIONS, parsedQ: ['q0', 'q1'], parsedSigma: ['a', 'b'] };

  it('tabela correta → ok: true', () => {
    const transitionTableData = { q0: { a: 'q1', b: 'q0' }, q1: { a: '', b: '' } };
    expect(validateFormalTransitions({ ...base, transitionTableData }))
      .toMatchObject({ ok: true });
  });

  it('célula errada → ok: false com cellErrors', () => {
    const transitionTableData = { q0: { a: 'q0', b: 'q0' }, q1: { a: '', b: '' } }; // q0_a errado
    const result = validateFormalTransitions({ ...base, transitionTableData });
    expect(result.ok).toBe(false);
    expect(result.cellErrors['q0_a']).toBe(true);
  });

  it('múltiplas células erradas → todas listadas em cellErrors', () => {
    const transitionTableData = { q0: { a: 'q0', b: 'q1' }, q1: { a: '', b: '' } }; // q0_a e q0_b errados
    const result = validateFormalTransitions({ ...base, transitionTableData });
    expect(result.ok).toBe(false);
    expect(result.cellErrors['q0_a']).toBe(true);
    expect(result.cellErrors['q0_b']).toBe(true);
  });

  it('célula com estado sem transição definida → deve ser vazio → ok quando aluno deixa vazio', () => {
    const transitionTableData = { q0: { a: 'q1', b: 'q0' }, q1: { a: '', b: '' } };
    expect(validateFormalTransitions({ ...base, transitionTableData }).ok).toBe(true);
  });

  it('transição com símbolo múltiplo "a,b" → encontrada corretamente', () => {
    const nodesMulti = [
      { id: 'q0', label: 'q0', isInitial: true,  isFinal: false },
      { id: 'q1', label: 'q1', isInitial: false, isFinal: true  },
    ];
    const transMulti = [{ from: 'q0', to: 'q1', symbol: 'a,b' }];
    const transitionTableData = { q0: { a: 'q1', b: 'q1' } };
    expect(validateFormalTransitions({
      nodes: nodesMulti, transitions: transMulti,
      parsedQ: ['q0'], parsedSigma: ['a', 'b'],
      transitionTableData,
    })).toMatchObject({ ok: true });
  });

});

// ─── Suite 6: buildFormalStateSnapshot / normalizeFormalInitialValues ────────
// Extraídas para içar o estado do FormalDescriptionModal.jsx pro orquestrador
// (persistência de sessão — ver §3.1 do prompt original / item 4 do plano).
// "Qual snapshot representa o estado atual do formulário" precisa ser puro e
// testável ANTES de tornar o componente controlado (initialValues/onStateChange).
describe('buildFormalStateSnapshot', () => {

  it('monta o snapshot com as 8 peças de estado do formulário', () => {
    const snapshot = buildFormalStateSnapshot({
      inputQ: '{q0, q1}', inputSigma: '{a}', inputInitial: 'q0', inputFinal: 'q1',
      areElementsValid: true, parsedQ: ['q0', 'q1'], parsedSigma: ['a'],
      transitionTableData: { q0: { a: 'q1' } },
    });
    expect(snapshot).toEqual({
      inputQ: '{q0, q1}', inputSigma: '{a}', inputInitial: 'q0', inputFinal: 'q1',
      areElementsValid: true, parsedQ: ['q0', 'q1'], parsedSigma: ['a'],
      transitionTableData: { q0: { a: 'q1' } },
    });
  });

  it('não inclui campos extras que não fazem parte do shape (fieldErrors/tableErrors ficam de fora)', () => {
    const snapshot = buildFormalStateSnapshot({
      inputQ: 'q0', inputSigma: 'a', inputInitial: 'q0', inputFinal: 'q0',
      areElementsValid: false, parsedQ: [], parsedSigma: [], transitionTableData: {},
      fieldErrors: { Q: 'ignorado' }, tableErrors: { x: true },
    });
    expect(Object.keys(snapshot)).toEqual([
      'inputQ', 'inputSigma', 'inputInitial', 'inputFinal',
      'areElementsValid', 'parsedQ', 'parsedSigma', 'transitionTableData',
    ]);
  });

});

describe('normalizeFormalInitialValues', () => {

  it('sem initialValues (fase nova) → EMPTY_FORMAL_STATE', () => {
    expect(normalizeFormalInitialValues(undefined)).toEqual(EMPTY_FORMAL_STATE);
    expect(normalizeFormalInitialValues(null)).toEqual(EMPTY_FORMAL_STATE);
  });

  it('initialValues completo → devolvido como está', () => {
    const full = {
      inputQ: '{q0}', inputSigma: 'a', inputInitial: 'q0', inputFinal: 'q0',
      areElementsValid: true, parsedQ: ['q0'], parsedSigma: ['a'],
      transitionTableData: { q0: { a: 'q0' } },
    };
    expect(normalizeFormalInitialValues(full)).toEqual(full);
  });

  it('initialValues parcial (snapshot salvo no meio do preenchimento) → completa com defaults', () => {
    const partial = { inputQ: '{q0, q1}', inputInitial: 'q0' };
    expect(normalizeFormalInitialValues(partial)).toEqual({
      ...EMPTY_FORMAL_STATE, inputQ: '{q0, q1}', inputInitial: 'q0',
    });
  });

});
