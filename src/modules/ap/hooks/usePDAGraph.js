// ─── usePDAGraph: estado + lógica do grafo do AP (com Undo/Redo) ─────────────
// Transição = { from, to, read, pop, push } (qualquer campo λ), não-determinístico,
// aceitação por PILHA VAZIA. O estado (nós/transições) vive num reducer com
// past/present/future para dar Undo/Redo. Validação por bateria do gabarito.
import { useCallback, useMemo, useReducer, useRef } from 'react';
import { getBattery } from '../../../levels_data/ap/index.js';
import { validateStudentPda, pdaAcceptingRun, pdaRejectingTrace } from '../utils/pdaAlgorithms';

let _uid = 0;
const genUid = () => `_ap${++_uid}_${Math.random().toString(36).slice(2, 6)}`;

const EMPTY = { nodes: [], transitions: [] };
export const EMPTY_PDA_GRAPH = EMPTY;
const initial = { past: [], present: EMPTY, future: [], lastEmptyAdd: null };

// COMMIT = muda com histórico; SET = muda sem histórico (arraste/rascunho);
// SNAPSHOT = marca um ponto de histórico no estado atual (início do arraste);
// DISCARD_SNAPSHOT = desfaz um SNAPSHOT que não gerou mudança real (clique sem
// arrastar/renomear) — remove a última entrada de past sem tocar em present/future;
// SQUASH = funde no commit anterior (preencher a seta recém-criada não vira 2 passos).
// lastEmptyAdd = índice da seta recém-criada vazia (p/ a fusão); qualquer outra ação zera.
// RESET(next) hidrata `present` DIRETO (sem empurrar o present anterior pro
// past) — usado tanto pelo reset() de sempre (next=EMPTY) quanto pela
// hidratação de sessão salva (next=snapshot restaurado): um Ctrl+Z logo após
// restaurar não deve voltar pro grafo vazio, ver useLevelSessionPersistence.js.
// Exportado (não só usado internamente) para ser testável como reducer puro,
// mesmo padrão de createHistoryStack em useHistory.js.
export function pdaGraphReducer(state, action) {
  const { past, present, future } = state;
  switch (action.type) {
    case 'COMMIT':   return { past: [...past, present], present: action.next, future: [], lastEmptyAdd: action.emptyAdd ?? null };
    case 'SET':      return { ...state, present: action.next, lastEmptyAdd: null };
    case 'SQUASH':   return { ...state, present: action.next, future: [], lastEmptyAdd: null };
    case 'SNAPSHOT': return { past: [...past, present], present, future: [], lastEmptyAdd: null };
    // restoreFuture: o "future" de ANTES do SNAPSHOT que este descarta — sem
    // isso, um clique sem mudança depois de um "desfazer" apagaria o "refazer"
    // que estava disponível (SNAPSHOT sempre zera future).
    case 'DISCARD_SNAPSHOT': return past.length ? { ...state, past: past.slice(0, -1), future: action.restoreFuture ?? future } : state;
    case 'UNDO': {
      if (!past.length) return state;
      return { past: past.slice(0, -1), present: past[past.length - 1], future: [present, ...future], lastEmptyAdd: null };
    }
    case 'REDO': {
      if (!future.length) return state;
      return { past: [...past, present], present: future[0], future: future.slice(1), lastEmptyAdd: null };
    }
    case 'RESET':    return { past: [], present: action.next ?? EMPTY, future: [], lastEmptyAdd: null };
    default:         return state;
  }
}

export default function usePDAGraph({ showToast, selectedNodes = [], setSelectedNodes = () => {} } = {}) {
  const [hist, dispatch] = useReducer(pdaGraphReducer, initial);
  const { nodes, transitions } = hist.present;
  const canUndo = hist.past.length > 0;
  const canRedo = hist.future.length > 0;

  // reset() sem args (todo call-site atual) continua idêntico: volta pro
  // grafo vazio. reset({ nodes, transitions }) — usado pela hidratação de
  // sessão salva — carrega o snapshot direto em `present`, sem entrar em `past`.
  const reset    = useCallback((initialGraph = EMPTY) => { _uid = 0; dispatch({ type: 'RESET', next: initialGraph }); }, []);
  const undo     = useCallback(() => {
    if (!hist.past.length) return;
    dispatch({ type: 'UNDO' });
    showToast?.('↶ Desfeito', 'info');
  }, [hist.past.length, showToast]);
  const redo     = useCallback(() => {
    if (!hist.future.length) return;
    dispatch({ type: 'REDO' });
    showToast?.('↷ Refeito', 'info');
  }, [hist.future.length, showToast]);
  // Guarda o "future" (pilha de refazer) de ANTES do próximo SNAPSHOT, pra
  // poder restaurá-lo se o snapshot for descartado (ver discardSnapshot).
  const preDragFutureRef = useRef([]);
  const beginDrag = useCallback(() => {
    preDragFutureRef.current = hist.future;
    dispatch({ type: 'SNAPSHOT' });
  }, [hist.future]); // 1 entrada por arraste
  // Cancela o SNAPSHOT do beginDrag quando o clique não mudou nada de verdade
  // (nó não se moveu e o rótulo não foi renomeado) — sem isso, um clique simples
  // no nó (ex.: focar o campo de nome e sair sem editar) já empurraria uma
  // entrada vazia no histórico, fazendo o 1º "desfazer" parecer não fazer nada
  // E ainda apagaria o "refazer" que estava disponível (SNAPSHOT zera future).
  const discardSnapshot = useCallback(() => {
    dispatch({ type: 'DISCARD_SNAPSHOT', restoreFuture: preDragFutureRef.current });
  }, []);

  // ── Estados (nós) ───────────────────────────────────────────────────────────
  const addNode = useCallback((x, y) => {
    let n = nodes.length;
    const used = new Set(nodes.map(p => p.label));
    while (used.has(`q${n}`)) n++;
    const label = `q${n}`;
    // O estado inicial é escolhido pelo usuário (carta "▶ Estado Inicial"),
    // nunca automático — nem o primeiro estado nasce inicial.
    const node = { uid: genUid(), id: label, label, x, y, isInitial: false };
    dispatch({ type: 'COMMIT', next: { nodes: [...nodes, node], transitions } });
  }, [nodes, transitions]);

  // arraste (sem histórico — o beginDrag já registrou o ponto inicial): aplica
  // todas as posições (1 nó ou um grupo inteiro selecionado) em UM só dispatch —
  // chamar isso em loop perderia as mudanças anteriores, já que cada chamada
  // fecharia sobre o mesmo `nodes` "congelado" do render atual.
  const moveNodes = useCallback((updates) => {
    const byUid = new Map(updates.map(u => [u.uid, u]));
    dispatch({ type: 'SET', next: { nodes: nodes.map(n => byUid.has(n.uid) ? { ...n, x: byUid.get(n.uid).x, y: byUid.get(n.uid).y } : n), transitions } });
  }, [nodes, transitions]);

  const toggleInitial = useCallback((uid) => {
    const wasInitial = nodes.find(n => n.uid === uid)?.isInitial;
    dispatch({ type: 'COMMIT', next: { nodes: nodes.map(n => ({ ...n, isInitial: wasInitial ? false : n.uid === uid })), transitions } });
  }, [nodes, transitions]);

  // rascunho do rótulo enquanto digita (sem histórico, sem commitar id/arestas)
  const setNodeLabel = useCallback((uid, value) => {
    dispatch({ type: 'SET', next: { nodes: nodes.map(n => n.uid === uid ? { ...n, label: value } : n), transitions } });
  }, [nodes, transitions]);

  const renameNode = useCallback((uid, raw) => {
    const me = nodes.find(n => n.uid === uid);
    if (!me) return;
    const oldId = me.id;
    const trimmed = (raw || '').trim();
    // Sem mudança de verdade (ex.: blur sem editar nada, ou blur roubado pelo
    // autofoco do editor de tripla): não despacha nada — evita resetar
    // hist.lastEmptyAdd à toa e criar uma entrada vazia no histórico.
    if (trimmed === oldId) return;
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

  // ── Transições (triplas read,pop;push) ──────────────────────────────────────
  const addTriple = useCallback((from, to, triple = { read: '', pop: '', push: '' }) => {
    const exactDup = transitions.some(t =>
      t.from === from && t.to === to &&
      t.read === triple.read && t.pop === triple.pop && t.push === triple.push);
    if (exactDup) {
      showToast?.('Esta transição exata já existe!', 'info');
      return false;
    }
    // Seta criada vazia (modo "Criar Seta") é só um placeholder — checagem de determinismo
    // é adiada para o editTriple, quando o aluno preenche os campos.
    const isBlank = !triple.read && !triple.pop && !triple.push;
    if (!isBlank) {
      const conflict = transitions.some(t =>
        t.from === from && t.read === triple.read && t.pop === triple.pop);
      if (conflict) {
        showToast?.(`Ação bloqueada: O estado já possui uma transição que lê "${triple.read || 'λ'}" e desempilha "${triple.pop || 'λ'}". O AP deve ser determinístico.`, 'error');
        return false;
      }
    }
    dispatch({ type: 'COMMIT', next: { nodes, transitions: [...transitions, { from, to, ...triple }] },
      emptyAdd: isBlank ? transitions.length : null });
    return true;
  }, [nodes, transitions, showToast]);

  const editTriple = useCallback((tIdx, triple) => {
    const current = transitions[tIdx];
    if (!current) return false;
    const r = triple.read ?? current.read;
    const p = triple.pop  ?? current.pop;
    const s = triple.push ?? current.push;
    const exactDup = transitions.some((t, i) =>
      i !== tIdx && t.from === current.from && t.to === current.to &&
      t.read === r && t.pop === p && t.push === s);
    if (exactDup) {
      showToast?.('Esta transição exata já existe!', 'info');
      return false;
    }
    const conflict = transitions.some((t, i) =>
      i !== tIdx && t.from === current.from && t.read === r && t.pop === p);
    if (conflict) {
      showToast?.(`Ação bloqueada: O estado já possui uma transição que lê "${r || 'λ'}" e desempilha "${p || 'λ'}". O AP deve ser determinístico.`, 'error');
      return false;
    }
    const next = { nodes, transitions: transitions.map((t, i) => i === tIdx ? { ...t, ...triple } : t) };
    // Preencher pela 1ª vez a seta recém-criada (tripla vazia) funde com o "adicionar"
    // — senão a seta vira 2 entradas de histórico (bug do "desfazer 2 vezes").
    dispatch(hist.lastEmptyAdd === tIdx ? { type: 'SQUASH', next } : { type: 'COMMIT', next });
    return true;
  }, [nodes, transitions, hist.lastEmptyAdd, showToast]);

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

  // ── Modelo do AP do aluno (p/ o simulador) ──────────────────────────────────
  const studentPda = useMemo(() => ({
    states: nodes.map(n => ({ id: n.id, name: n.label, x: n.x, y: n.y, initial: n.isInitial })),
    transitions,
    initial: nodes.find(n => n.isInitial)?.id ?? null,
    stackBottom: 'Z',
  }), [nodes, transitions]);

  // ── Validação por bateria (com contraexemplo + run p/ animar) ───────────────
  const validatePDA = useCallback((level) => {
    const pda = studentPda;
    if (!pda.initial)
      return { ok: false, reason: 'no-initial', message: 'Defina um estado inicial (▶) antes de validar.' };
    if (pda.transitions.length === 0)
      return { ok: false, reason: 'empty', message: 'Desenhe ao menos uma transição.' };

    const battery = getBattery(level);
    const res = validateStudentPda(pda, battery);
    if (res.ok)
      return { ok: true, message: 'Perfeito! Seu AP reconhece a linguagem. 🎉', battery };

    const { word, expected } = res.counterexample;
    const show = word === '' ? 'λ' : word;
    let message, run, trace;
    if (expected) {
      // Aluno REJEITA quando deveria ACEITAR: não existe computação aceitadora no
      // AP do aluno pra mostrar — em vez disso, mostramos onde/por que ele trava
      // (mesma trilha do "Testar palavra", ver pdaRejectingTrace).
      trace = pdaRejectingTrace(pda, word);
      message = word === ''
        ? 'Seu AP REJEITA λ, mas ela deveria ser ACEITA. Dica: adicione a transição "λ, Z ; λ" no estado inicial para esvaziar a pilha sem ler nada.'
        : `Seu AP REJEITA "${show}", mas ela deveria ser ACEITA. Veja onde ele trava:`;
    } else {
      run = pdaAcceptingRun(pda, word);
      message = `Seu AP ACEITA "${show}", mas ela deveria ser REJEITADA. Veja o caminho indevido:`;
    }
    return {
      ok: false, reason: 'counterexample', counterexample: res.counterexample, message,
      run: expected ? trace?.run : run,
      rejectReason: expected ? trace?.reason : null,
    };
  }, [studentPda]);

  return {
    nodes, transitions, studentPda, canUndo, canRedo,
    reset, undo, redo, beginDrag, discardSnapshot,
    addNode, moveNodes, toggleInitial, setNodeLabel, renameNode, deleteNode,
    addTriple, editTriple, removeTriple, removeEdge,
    validatePDA, deleteSelected,
  };
}
