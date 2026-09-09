// ─── useTMGraph: estado + lógica do grafo da MT (com Undo/Redo) ──────────────
// Transição = { from, to, read, write, move } — determinística:
//   não podem existir duas transições saindo do mesmo estado com o mesmo read.
// Estado aceitor: isFinal (aceite por estado final, diferente do AP por pilha vazia).
import { useCallback, useReducer } from 'react';

let _uid = 0;
const genUid = () => `_mt${++_uid}_${Math.random().toString(36).slice(2, 6)}`;

const EMPTY = { nodes: [], transitions: [] };
export const EMPTY_TM_GRAPH = EMPTY;
const initial = { past: [], present: EMPTY, future: [] };

// RESET(next) hidrata `present` DIRETO (sem empurrar o present anterior pro
// past) — usado tanto pelo reset() de sempre (next=EMPTY) quanto pela
// hidratação de sessão salva (next=snapshot restaurado), ver
// useLevelSessionPersistence.js. Exportado para ser testável como reducer
// puro, mesmo padrão de createHistoryStack em useHistory.js.
export function tmGraphReducer(state, action) {
  const { past, present, future } = state;
  switch (action.type) {
    case 'COMMIT':   return { past: [...past, present], present: action.next, future: [] };
    case 'SET':      return { ...state, present: action.next };
    case 'SNAPSHOT': return { past: [...past, present], present, future: [] };
    case 'UNDO': {
      if (!past.length) return state;
      return { past: past.slice(0, -1), present: past[past.length - 1], future: [present, ...future] };
    }
    case 'REDO': {
      if (!future.length) return state;
      return { past: [...past, present], present: future[0], future: future.slice(1) };
    }
    case 'RESET': return { past: [], present: action.next ?? EMPTY, future: [] };
    default:      return state;
  }
}

export default function useTMGraph({ showToast, selectedNodes = [], setSelectedNodes = () => {} } = {}) {
  const [hist, dispatch] = useReducer(tmGraphReducer, initial);
  const { nodes, transitions } = hist.present;
  const canUndo = hist.past.length > 0;
  const canRedo = hist.future.length > 0;

  // reset() sem args (todo call-site atual) continua idêntico: volta pro
  // grafo vazio. reset({ nodes, transitions }) — usado pela hidratação de
  // sessão salva — carrega o snapshot direto em `present`, sem entrar em `past`.
  const reset     = useCallback((initialGraph = EMPTY) => { _uid = 0; dispatch({ type: 'RESET', next: initialGraph }); }, []);
  const undo      = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo      = useCallback(() => dispatch({ type: 'REDO' }), []);
  const beginDrag = useCallback(() => dispatch({ type: 'SNAPSHOT' }), []);

  // ── Estados ──────────────────────────────────────────────────────────────────
  const addNode = useCallback((x, y) => {
    let n = nodes.length;
    const used = new Set(nodes.map(p => p.label));
    while (used.has(`q${n}`)) n++;
    const label = `q${n}`;
    const node = { uid: genUid(), id: label, label, x, y, isInitial: false, isFinal: false };
    dispatch({ type: 'COMMIT', next: { nodes: [...nodes, node], transitions } });
  }, [nodes, transitions]);

  // arraste (sem histórico): aplica todas as posições (1 nó ou um grupo inteiro
  // selecionado) em UM só dispatch — chamar isso em loop perderia as mudanças
  // anteriores, já que cada chamada fecharia sobre o mesmo `nodes` do render atual.
  const moveNodes = useCallback((updates) => {
    const byUid = new Map(updates.map(u => [u.uid, u]));
    dispatch({ type: 'SET', next: { nodes: nodes.map(n => byUid.has(n.uid) ? { ...n, x: byUid.get(n.uid).x, y: byUid.get(n.uid).y } : n), transitions } });
  }, [nodes, transitions]);

  const toggleInitial = useCallback((uid) => {
    const wasInitial = nodes.find(n => n.uid === uid)?.isInitial;
    dispatch({ type: 'COMMIT', next: { nodes: nodes.map(n => ({ ...n, isInitial: wasInitial ? false : n.uid === uid })), transitions } });
  }, [nodes, transitions]);

  const toggleFinal = useCallback((uid) => {
    dispatch({ type: 'COMMIT', next: { nodes: nodes.map(n => n.uid === uid ? { ...n, isFinal: !n.isFinal } : n), transitions } });
  }, [nodes, transitions]);

  const setNodeLabel = useCallback((uid, value) => {
    dispatch({ type: 'SET', next: { nodes: nodes.map(n => n.uid === uid ? { ...n, label: value } : n), transitions } });
  }, [nodes, transitions]);

  const renameNode = useCallback((uid, raw) => {
    const me = nodes.find(n => n.uid === uid);
    if (!me) return;
    const oldId = me.id;
    const trimmed = (raw || '').trim();
    if (!trimmed || nodes.some(n => n.uid !== uid && n.id === trimmed)) {
      dispatch({ type: 'SET', next: { nodes: nodes.map(n => n.uid === uid ? { ...n, label: oldId, id: oldId } : n), transitions } });
      return;
    }
    const nextNodes = nodes.map(n => n.uid === uid ? { ...n, label: trimmed, id: trimmed } : n);
    const nextTrans = transitions.map(t => ({
      ...t,
      from: t.from === oldId ? trimmed : t.from,
      to:   t.to   === oldId ? trimmed : t.to,
    }));
    dispatch({ type: 'COMMIT', next: { nodes: nextNodes, transitions: nextTrans } });
  }, [nodes, transitions]);

  const deleteNode = useCallback((uid) => {
    const target = nodes.find(n => n.uid === uid);
    const nextNodes = nodes.filter(n => n.uid !== uid);
    const nextTrans = target ? transitions.filter(t => t.from !== target.id && t.to !== target.id) : transitions;
    dispatch({ type: 'COMMIT', next: { nodes: nextNodes, transitions: nextTrans } });
  }, [nodes, transitions]);

  // ── Transições { read, write, move } ─────────────────────────────────────────
  // MT determinística: bloqueia se já existe transição com mesmo from + mesmo read.
  const addTriple = useCallback((from, to, triple = { read: '', write: '', move: 'R' }) => {
    const conflict = transitions.some(t => t.from === from && t.read === triple.read);
    if (conflict) {
      showToast?.(`Bloqueado: já existe transição de "${from}" que lê "${triple.read || '□'}". MT deve ser determinística.`, 'error');
      return false;
    }
    dispatch({ type: 'COMMIT', next: { nodes, transitions: [...transitions, { from, to, ...triple }] } });
    return true;
  }, [nodes, transitions, showToast]);

  const editTriple = useCallback((tIdx, triple) => {
    const current = transitions[tIdx];
    if (!current) return false;
    const r = triple.read  ?? current.read;
    const w = triple.write ?? current.write;
    const m = triple.move  ?? current.move;
    const conflict = transitions.some((t, i) => i !== tIdx && t.from === current.from && t.read === r);
    if (conflict) {
      showToast?.(`Bloqueado: já existe transição de "${current.from}" que lê "${r || '□'}". MT deve ser determinística.`, 'error');
      return false;
    }
    dispatch({ type: 'COMMIT', next: { nodes, transitions: transitions.map((t, i) => i === tIdx ? { ...t, read: r, write: w, move: m } : t) } });
    return true;
  }, [nodes, transitions, showToast]);

  const removeTriple = useCallback((tIdx) => {
    dispatch({ type: 'COMMIT', next: { nodes, transitions: transitions.filter((_, i) => i !== tIdx) } });
  }, [nodes, transitions]);

  const removeEdge = useCallback((from, to) => {
    dispatch({ type: 'COMMIT', next: { nodes, transitions: transitions.filter(t => !(t.from === from && t.to === to)) } });
  }, [nodes, transitions]);

  const deleteSelected = useCallback(() => {
    if (!selectedNodes.length) return;
    const selectedIds = new Set(nodes.filter(n => selectedNodes.includes(n.uid)).map(n => n.id));
    const nextNodes = nodes.filter(n => !selectedNodes.includes(n.uid));
    const nextTrans = transitions.filter(t => !selectedIds.has(t.from) && !selectedIds.has(t.to));
    dispatch({ type: 'COMMIT', next: { nodes: nextNodes, transitions: nextTrans } });
    setSelectedNodes([]);
  }, [nodes, transitions, selectedNodes, setSelectedNodes]);

  return {
    nodes, transitions, canUndo, canRedo,
    reset, undo, redo, beginDrag,
    addNode, moveNodes, toggleInitial, toggleFinal, setNodeLabel, renameNode, deleteNode,
    addTriple, editTriple, removeTriple, removeEdge, deleteSelected,
  };
}
