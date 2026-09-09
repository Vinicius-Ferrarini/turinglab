import { describe, it, expect } from 'vitest';
import { pdaGraphReducer, EMPTY_PDA_GRAPH } from '../modules/ap/hooks/usePDAGraph.js';
import { tmGraphReducer, EMPTY_TM_GRAPH } from '../modules/mt/hooks/useTMGraph.js';

// Reducers puros (sem React) — mesmo padrão de estilo de
// src/__tests__/useHistory.test.js (createHistoryStack). Cobre o novo
// suporte a `reset(initial)` (item 3 do plano): hidratar o grafo de um
// snapshot salvo direto em `present`, sem passar por `past` (senão um Ctrl+Z
// logo após restaurar voltaria pro grafo vazio, o que não faz sentido pro
// aluno que acabou de recarregar a página).

const restoredPda = {
  nodes: [{ uid: '_n1', id: 'q0', label: 'q0', x: 10, y: 10, isInitial: true }],
  transitions: [{ from: 'q0', to: 'q0', read: 'a', pop: 'Z', push: 'AZ' }],
};
const restoredTm = {
  nodes: [{ uid: '_n1', id: 'q0', label: 'q0', x: 10, y: 10, isInitial: true, isFinal: true }],
  transitions: [{ from: 'q0', to: 'q0', read: 'a', write: 'b', move: 'R' }],
};

describe('usePDAGraph — pdaGraphReducer RESET(initial)', () => {
  it('RESET sem `next` continua idêntico a hoje (volta ao grafo vazio)', () => {
    let state = { past: [], present: EMPTY_PDA_GRAPH, future: [], lastEmptyAdd: null };
    state = pdaGraphReducer(state, { type: 'COMMIT', next: restoredPda });
    state = pdaGraphReducer(state, { type: 'RESET' });
    expect(state.present).toEqual(EMPTY_PDA_GRAPH);
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
  });

  it('RESET com `next` hidrata `present` diretamente, sem entrar em `past`', () => {
    let state = { past: [], present: EMPTY_PDA_GRAPH, future: [], lastEmptyAdd: null };
    state = pdaGraphReducer(state, { type: 'RESET', next: restoredPda });
    expect(state.present).toEqual(restoredPda);
    expect(state.past).toEqual([]); // o EMPTY anterior não foi empurrado pro histórico
    expect(state.future).toEqual([]);
  });

  it('RESET(next) limpa histórico anterior — UNDO logo depois não volta a nada', () => {
    let state = { past: [], present: EMPTY_PDA_GRAPH, future: [], lastEmptyAdd: null };
    state = pdaGraphReducer(state, { type: 'COMMIT', next: { nodes: [{ id: 'qX' }], transitions: [] } });
    state = pdaGraphReducer(state, { type: 'RESET', next: restoredPda });
    const afterUndo = pdaGraphReducer(state, { type: 'UNDO' });
    expect(afterUndo).toBe(state); // UNDO com past=[] é no-op (retorna o mesmo state)
    expect(afterUndo.present).toEqual(restoredPda);
  });

  it('outros call-sites (RESET sem args nenhum, nem type) continuam funcionando — reset() padrão', () => {
    // Simula o call-site atual: reset() → dispatch({ type: 'RESET', next: EMPTY })
    let state = { past: [{ nodes: [], transitions: [] }], present: restoredPda, future: [], lastEmptyAdd: null };
    state = pdaGraphReducer(state, { type: 'RESET', next: EMPTY_PDA_GRAPH });
    expect(state.present).toEqual(EMPTY_PDA_GRAPH);
    expect(state.past).toEqual([]);
  });
});

describe('useTMGraph — tmGraphReducer RESET(initial)', () => {
  it('RESET sem `next` continua idêntico a hoje (volta ao grafo vazio)', () => {
    let state = { past: [], present: EMPTY_TM_GRAPH, future: [] };
    state = tmGraphReducer(state, { type: 'COMMIT', next: restoredTm });
    state = tmGraphReducer(state, { type: 'RESET' });
    expect(state.present).toEqual(EMPTY_TM_GRAPH);
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
  });

  it('RESET com `next` hidrata `present` diretamente, sem entrar em `past`', () => {
    let state = { past: [], present: EMPTY_TM_GRAPH, future: [] };
    state = tmGraphReducer(state, { type: 'RESET', next: restoredTm });
    expect(state.present).toEqual(restoredTm);
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
  });

  it('RESET(next) limpa histórico anterior — UNDO logo depois não volta a nada', () => {
    let state = { past: [], present: EMPTY_TM_GRAPH, future: [] };
    state = tmGraphReducer(state, { type: 'COMMIT', next: { nodes: [{ id: 'qX' }], transitions: [] } });
    state = tmGraphReducer(state, { type: 'RESET', next: restoredTm });
    const afterUndo = tmGraphReducer(state, { type: 'UNDO' });
    expect(afterUndo).toBe(state);
    expect(afterUndo.present).toEqual(restoredTm);
  });
});
