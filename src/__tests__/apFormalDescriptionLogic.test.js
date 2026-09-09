import { describe, it, expect } from 'vitest';
import {
  canvasGammaFromTransitions,
  validateApFormalElements,
  validateApFormalTransitions,
  EMPTY_AP_FORMAL_STATE,
  buildApFormalStateSnapshot,
  normalizeApFormalInitialValues,
} from '../modules/ap/utils/apFormalDescriptionLogic.js';

// ─── Grafo base: q0(inicial) -a,Z;AZ-> q0 (empilha A sobre Z) ────────────────
const NODES = [{ id: 'q0', label: 'q0', isInitial: true }];
const TRANSITIONS = [{ from: 'q0', to: 'q0', read: 'a', pop: 'Z', push: 'AZ' }];
const ALPHABET = ['a'];

// ─── Suite 1: canvasGammaFromTransitions ──────────────────────────────────────
describe('canvasGammaFromTransitions', () => {

  it('sempre inclui Z (fundo da pilha), mesmo sem transições', () => {
    expect(canvasGammaFromTransitions([])).toEqual(['Z']);
  });

  it('coleta símbolos de pop e cada caractere de push, ordenado', () => {
    const transitions = [
      { from: 'q0', to: 'q0', read: 'a', pop: 'Z', push: 'AZ' },
      { from: 'q0', to: 'q1', read: 'b', pop: 'A', push: '' },
    ];
    expect(canvasGammaFromTransitions(transitions)).toEqual(['A', 'Z']);
  });

});

// ─── Suite 2: validateApFormalElements — formato de chaves ───────────────────
describe('validateApFormalElements — formato de chaves', () => {

  const base = { nodes: NODES, transitions: TRANSITIONS, alphabet: ALPHABET };

  it('múltiplos elementos sem {} em E → brace_format', () => {
    const result = validateApFormalElements({
      ...base, inE: 'q0, q1', inSigma: '{a}', inGamma: '{A, Z}', inInitial: 'q0', inBottom: 'Z',
    });
    expect(result).toMatchObject({ ok: false, reason: 'brace_format' });
    expect(result.fieldErrors.E).toBeTruthy();
  });

  it('estado inicial com chaves → brace_format em initial', () => {
    const result = validateApFormalElements({
      ...base, inE: 'q0', inSigma: 'a', inGamma: '{A, Z}', inInitial: '{q0}', inBottom: 'Z',
    });
    expect(result).toMatchObject({ ok: false, reason: 'brace_format' });
    expect(result.fieldErrors.initial).toBeTruthy();
  });

});

// ─── Suite 3: validateApFormalElements — validação contra o grafo ────────────
describe('validateApFormalElements — validação contra o grafo (nunca o gabarito, ver ADR 0010)', () => {

  const base = { nodes: NODES, transitions: TRANSITIONS, alphabet: ALPHABET };

  it('tudo correto → ok: true com as linhas da tabela δ derivadas das transições', () => {
    const result = validateApFormalElements({
      ...base, inE: 'q0', inSigma: 'a', inGamma: '{A, Z}', inInitial: 'q0', inBottom: 'Z',
    });
    expect(result.ok).toBe(true);
    expect(result.rows).toEqual([{ key: '0', from: 'q0', read: 'a', pop: 'Z' }]);
  });

  it('E não bate com os estados do grafo → erro em E', () => {
    const result = validateApFormalElements({
      ...base, inE: '{q0, q1}', inSigma: 'a', inGamma: '{A, Z}', inInitial: 'q0', inBottom: 'Z',
    });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.E).toBeTruthy();
  });

  it('Γ errado (falta símbolo empilhado no grafo) → erro em Gamma', () => {
    const result = validateApFormalElements({
      ...base, inE: 'q0', inSigma: 'a', inGamma: 'Z', inInitial: 'q0', inBottom: 'Z',
    });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.Gamma).toBeTruthy();
  });

  it('fundo da pilha diferente de Z → erro em bottom', () => {
    const result = validateApFormalElements({
      ...base, inE: 'q0', inSigma: 'a', inGamma: '{A, Z}', inInitial: 'q0', inBottom: 'A',
    });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.bottom).toBeTruthy();
  });

});

// ─── Suite 4: validateApFormalTransitions ─────────────────────────────────────
describe('validateApFormalTransitions', () => {

  it('destino e push corretos (λ representado como string vazia) → ok: true', () => {
    const cells = { 0: { dest: 'q0', push: 'AZ' } };
    expect(validateApFormalTransitions({ transitions: TRANSITIONS, nodes: NODES, cells }))
      .toMatchObject({ ok: true });
  });

  it('λ digitado como "λ" (glifo) é equivalente a string vazia', () => {
    const transitions = [{ from: 'q0', to: 'q0', read: 'a', pop: 'Z', push: '' }];
    const cells = { 0: { dest: 'q0', push: 'λ' } };
    expect(validateApFormalTransitions({ transitions, nodes: NODES, cells }))
      .toMatchObject({ ok: true });
  });

  it('destino errado → cellErrors com a chave da linha', () => {
    const cells = { 0: { dest: 'q1', push: 'AZ' } };
    const result = validateApFormalTransitions({ transitions: TRANSITIONS, nodes: NODES, cells });
    expect(result.ok).toBe(false);
    expect(result.cellErrors['0']).toBe(true);
  });

  it('célula não preenchida (aluno deixou em branco) → contada como erro', () => {
    const result = validateApFormalTransitions({ transitions: TRANSITIONS, nodes: NODES, cells: {} });
    expect(result.ok).toBe(false);
    expect(result.cellErrors['0']).toBe(true);
  });

});

// ─── Suite 5: snapshot do formulário (içar estado — ver item 4 do plano) ─────
describe('buildApFormalStateSnapshot / normalizeApFormalInitialValues', () => {

  it('monta o snapshot com as peças de estado do formulário do AP', () => {
    const snapshot = buildApFormalStateSnapshot({
      inE: 'q0', inSigma: 'a', inGamma: '{A, Z}', inInitial: 'q0', inBottom: 'Z',
      elementsValid: true, rows: [{ key: '0', from: 'q0', read: 'a', pop: 'Z' }],
      cells: { 0: { dest: 'q0', push: 'AZ' } },
    });
    expect(snapshot).toEqual({
      inE: 'q0', inSigma: 'a', inGamma: '{A, Z}', inInitial: 'q0', inBottom: 'Z',
      elementsValid: true, rows: [{ key: '0', from: 'q0', read: 'a', pop: 'Z' }],
      cells: { 0: { dest: 'q0', push: 'AZ' } },
    });
  });

  it('sem initialValues → EMPTY_AP_FORMAL_STATE', () => {
    expect(normalizeApFormalInitialValues(undefined)).toEqual(EMPTY_AP_FORMAL_STATE);
    expect(normalizeApFormalInitialValues(null)).toEqual(EMPTY_AP_FORMAL_STATE);
  });

  it('initialValues parcial → completa com defaults', () => {
    const partial = { inE: 'q0' };
    expect(normalizeApFormalInitialValues(partial)).toEqual({ ...EMPTY_AP_FORMAL_STATE, inE: 'q0' });
  });

});
