import { describe, it, expect } from 'vitest';
import { findConflictingTransitionIndices } from '../modules/mt/utils/tmAlgorithms.js';

// ─── findConflictingTransitionIndices: índices (no array `transitions`) de
// TODAS as regras de saída de `nodeId` que compartilham (from, read) com
// destino/escrita/movimento diferentes — mesmo critério de não-determinismo
// já usado inline em MTPart1.jsx/MTReconPart1.jsx (puro, testável). Usado pra
// destacar o(s) chip(s) das regras conflitantes no canvas.
describe('findConflictingTransitionIndices', () => {

  it('duas regras conflitantes (mesmo from+read, sig diferente) → os 2 índices', () => {
    const trans = [
      { from: 'q0', to: 'q1', read: '0', write: '0', move: 'R' },
      { from: 'q0', to: 'q0', read: '0', write: '1', move: 'R' },
    ];
    expect(findConflictingTransitionIndices('q0', trans)).toEqual([0, 1]);
  });

  it('sem conflito (sigs idênticas, ou reads diferentes) → array vazio', () => {
    const semConflito = [
      { from: 'q0', to: 'q1', read: '0', write: '0', move: 'R' },
      { from: 'q0', to: 'q0', read: '1', write: '1', move: 'R' },
    ];
    expect(findConflictingTransitionIndices('q0', semConflito)).toEqual([]);
  });

  it('regra repetida IDÊNTICA (mesmo to+write+move) não é conflito — não-determinismo exige sig diferente', () => {
    const trans = [
      { from: 'q0', to: 'q1', read: '0', write: '0', move: 'R' },
      { from: 'q0', to: 'q1', read: '0', write: '0', move: 'R' }, // idêntica, não conflita
    ];
    expect(findConflictingTransitionIndices('q0', trans)).toEqual([]);
  });

  it('branco (read === "") tratado como símbolo □, igual à detecção inline', () => {
    const trans = [
      { from: 'q0', to: 'q1', read: '', write: '0', move: 'R' },
      { from: 'q0', to: 'q0', read: '', write: '1', move: 'S' },
    ];
    expect(findConflictingTransitionIndices('q0', trans)).toEqual([0, 1]);
  });

  it('3 regras conflitantes do mesmo nó → os 3 índices', () => {
    const trans = [
      { from: 'q0', to: 'q1', read: '0', write: '0', move: 'R' },
      { from: 'q0', to: 'q0', read: '0', write: '1', move: 'R' },
      { from: 'q0', to: 'q2', read: '0', write: '2', move: 'L' },
    ];
    expect(findConflictingTransitionIndices('q0', trans)).toEqual([0, 1, 2]);
  });

  it('conflito só em outro nó → array vazio pro nó consultado', () => {
    const trans = [
      { from: 'q0', to: 'q1', read: '0', write: '0', move: 'R' },
      { from: 'q1', to: 'q1', read: '0', write: '0', move: 'R' },
      { from: 'q1', to: 'q2', read: '0', write: '1', move: 'R' }, // conflito em q1, não em q0
    ];
    expect(findConflictingTransitionIndices('q0', trans)).toEqual([]);
  });

});
