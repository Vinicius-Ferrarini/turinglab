import { describe, it, expect } from 'vitest';
import { findConflictingTransitionIndex } from '../modules/ap/hooks/usePDAGraph.js';

// ─── findConflictingTransitionIndex: acha o índice da transição JÁ EXISTENTE
// que bloquearia uma nova tripla (from, read, pop) — mesmo critério de
// determinismo já usado por addTriple/editTriple (usePDAGraph.js). Usado pra
// destacar a seta certa quando o AP bloqueia uma tentativa de criar uma
// transição conflitante (ver docs/PLAN_FEEDBACK_VALIDACAO_AFD_AP_MT.md e o
// pedido de estender esse destaque pro AP).
describe('findConflictingTransitionIndex', () => {

  const BASE_TRANS = [
    { from: 'q0', to: 'q1', read: 'a', pop: 'Z', push: 'AZ' },
    { from: 'q0', to: 'q0', read: 'b', pop: 'A', push: 'A' },
    { from: 'q1', to: 'q1', read: 'a', pop: 'Z', push: 'Z' },
  ];

  it('conflito real (mesmo from+read+pop) → índice da transição existente', () => {
    expect(findConflictingTransitionIndex(BASE_TRANS, 'q0', 'a', 'Z')).toBe(0);
  });

  it('sem conflito (from+read+pop nunca usado) → -1', () => {
    expect(findConflictingTransitionIndex(BASE_TRANS, 'q0', 'c', 'Z')).toBe(-1);
  });

  it('mesmo read+pop mas em outro estado (from diferente) → -1 (não conta)', () => {
    expect(findConflictingTransitionIndex(BASE_TRANS, 'q2', 'a', 'Z')).toBe(-1);
  });

  it('conflito na SEGUNDA transição do estado → índice certo (não sempre 0)', () => {
    expect(findConflictingTransitionIndex(BASE_TRANS, 'q0', 'b', 'A')).toBe(1);
  });

  it('mesmo read mas pop diferente → -1 (só conflita se from+read+pop baterem todos)', () => {
    expect(findConflictingTransitionIndex(BASE_TRANS, 'q0', 'a', 'A')).toBe(-1);
  });

  it('excludeIdx exclui a própria transição sendo editada (editTriple não conflita consigo mesma)', () => {
    // Editando a transição de índice 0 pra ficar idêntica a ela mesma (from=q0,
    // read=a, pop=Z) não pode "conflitar consigo própria".
    expect(findConflictingTransitionIndex(BASE_TRANS, 'q0', 'a', 'Z', 0)).toBe(-1);
    // Mas se outra transição (não a excluída) já tiver esse from+read+pop, o
    // conflito ainda é detectado normalmente.
    const withDup = [...BASE_TRANS, { from: 'q0', to: 'q2', read: 'a', pop: 'Z', push: 'Z' }];
    expect(findConflictingTransitionIndex(withDup, 'q0', 'a', 'Z', 3)).toBe(0);
  });

});
