// ─── useAFDGraph: lógica de grafo do AFDPart1 ────────────────────────────────
// Mantém a lógica "teórica" e de mutação de nós/transições, isolada da camada de
// interação do canvas (pan/zoom/rabisco/laço, que vivem no CanvasArea):
//   • validateAFDSilent — validação determinística + fuzzer de equivalência completa
//   • mutações: deleteSelected, renomear nó, handlers de símbolos das setas
//   • dados de exibição memoizados (displayNodes/Transitions/transitionRenders)
// O estado base nodes/transitions vive no orquestrador (AFDPart1) para quebrar a
// dependência circular com useHistory; aqui ele entra via props.
import { useState, useRef, useCallback, useMemo } from 'react';
import { fuzzDFA } from '../utils/dfaFuzzer';

// ─── Validação pura (sem React, testável) ─────────────────────────────────────
// Retorna { ok: true } ou { ok: false, reason: string }
// reason: 'no_initial' | 'no_final' | 'empty_symbol' | 'invalid_symbol' |
//         'nondeterministic' | 'word_mismatch' | 'language_mismatch'
export function validateAFDPure({ nodes, transitions, testWords = [], currentLevel = null }) {
  if (!nodes.some(n => n.isInitial))
    return { ok: false, reason: 'no_initial' };

  if (!nodes.some(n => n.isFinal))
    return { ok: false, reason: 'no_final' };

  if (transitions.some(t => t.symbol === ''))
    return { ok: false, reason: 'empty_symbol' };

  for (const node of nodes) {
    const allSyms = transitions
      .filter(t => t.from === node.id)
      .flatMap(t => t.symbol.split(',').map(s => s.trim()).filter(Boolean));
    if (allSyms.length !== new Set(allSyms).size)
      return { ok: false, reason: 'nondeterministic', nodeId: node.id, symbol: findDuplicateSymbol(node.id, transitions) };
  }

  const alphabetSet = new Set(currentLevel?.alphabet || []);
  if (alphabetSet.size > 0) {
    for (const t of transitions) {
      for (const sym of t.symbol.split(',').map(s => s.trim()).filter(Boolean)) {
        if (!alphabetSet.has(sym))
          return { ok: false, reason: 'invalid_symbol' };
      }
    }
  }

  const simulateDFA = (word) => {
    let cur = nodes.find(n => n.isInitial)?.id;
    if (!cur) return false;
    // testWords guarda 'λ' como display da palavra vazia (ver handleTestWord
    // em AFDPart1.jsx) — nunca o literal "null"/"vazio" (esses só existiam
    // aqui como resquício redundante; a conversão real já acontece antes,
    // no momento em que a tentativa é registrada).
    const w = word === 'λ' ? '' : word;
    for (const ch of w) {
      const tr = transitions.find(t => t.from === cur && t.symbol.split(',').map(s => s.trim()).includes(ch));
      if (!tr) return false;
      cur = tr.to;
    }
    return !!nodes.find(n => n.id === cur)?.isFinal;
  };

  for (const tw of testWords) {
    const accepted     = simulateDFA(tw.word);
    const shouldAccept = tw.status === 'shortest' || tw.status === 'correct';
    if (accepted !== shouldAccept)
      return {
        ok: false, reason: 'word_mismatch', word: tw.word, shouldAccept,
        // deadEnd só é calculado quando a rejeição foi indevida (accepted===false) —
        // se o grafo ACEITOU quando não devia, não há "buraco" de transição a
        // apontar, o percurso terminou normalmente num estado errado.
        deadEnd: !accepted ? traceDeadEnd(nodes, transitions, tw.word) : null,
      };
  }

  if (currentLevel?.regex || typeof currentLevel?.validate === 'function') {
    const lvlFn = (w) => {
      if (typeof currentLevel.validate === 'function') return currentLevel.validate(w);
      return currentLevel.regex?.test(w) ?? false;
    };
    const ce = fuzzDFA(currentLevel.alphabet, lvlFn, simulateDFA);
    if (ce !== null)
      // ce.shouldAccept: true → a linguagem aceita mas o grafo do aluno rejeitou
      // (accepted===false do lado do aluno) → pode ser δ incompleta. false → o
      // grafo aceitou quando não devia → não há buraco a apontar.
      return {
        ok: false, reason: 'language_mismatch',
        counterexample: { ...ce, deadEnd: ce.shouldAccept ? traceDeadEnd(nodes, transitions, ce.word) : null },
      };
  }

  return { ok: true };
}

// ─── findDuplicateSymbol: 1º símbolo repetido nas transições de saída de um nó
// (puro, testável). Usado tanto por validateAFDPure quanto validateAFDSilent
// pra citar o símbolo exato na mensagem de não-determinismo, em vez de só
// apontar o nó.
export function findDuplicateSymbol(nodeId, transitions) {
  const seen = new Set();
  for (const t of transitions) {
    if (t.from !== nodeId) continue;
    for (const sym of t.symbol.split(',').map(s => s.trim()).filter(Boolean)) {
      if (seen.has(sym)) return sym;
      seen.add(sym);
    }
  }
  return null;
}

// ─── traceDeadEnd: percorre `word` a partir do estado inicial e devolve o
// (estado, símbolo) exatos onde a δ não tem transição definida — δ incompleta
// (puro, testável). Devolve null quando o percurso completa (mesmo terminando
// num estado não-final — isso é rejeição normal, não buraco de transição).
// Implementação isolada de propósito: NÃO reaproveita/altera o simulateDFA
// interno de validateAFDPure/validateAFDSilent, que precisa continuar
// devolvendo um booleano puro (contrato de predicado do fuzzDFA).
export function traceDeadEnd(nodes, transitions, word) {
  let cur = nodes.find(n => n.isInitial)?.id;
  if (!cur) return null;
  const w = word === 'λ' ? '' : word;
  for (const ch of w) {
    const tr = transitions.find(t => t.from === cur && t.symbol.split(',').map(s => s.trim()).includes(ch));
    if (!tr) return { nodeId: cur, symbol: ch };
    cur = tr.to;
  }
  return null;
}

// ─── mergeSymbols: merge de símbolos numa transição (puro, testável) ──────────
// Recebe a string atual da transição e uma string de entrada (pode conter vírgulas).
// Retorna a nova string com símbolos únicos, ou null se não houve alteração.
export function mergeSymbols(currentSymbol, incoming) {
  const existing = (currentSymbol || '').split(',').map(s => s.trim()).filter(Boolean);
  const toAdd = incoming.split(',').map(s => s.trim()).filter(s => s && !existing.includes(s));
  if (toAdd.length === 0) return null;
  return [...existing, ...toAdd].join(',');
}

// Aceita palavra contra regex ou função validate do nível.
export function lvlAccepts(level, word) {
  if (typeof level.validate === 'function') return level.validate(word);
  return level.regex?.test(word) ?? false;
}

export default function useAFDGraph({
  nodes, setNodes,
  transitions, setTransitions,
  recordHistory, squashNextHistoryRef,
  selectedNodes, setSelectedNodes,
  isDrawingUnlocked,
  interactionMode,
  selectedSymbolCard, setSelectedSymbolCard,
  currentLevel,
  testWords,
  showToast,
  setHighlightedError,
  guidedLessonStep,
  lessonCurStepData,
}) {
  // ── Validação do grafo ─────────────────────────────────────────────────────
  const validateAFDSilent = useCallback((showErrors = true) => {
    if (!nodes.some(n => n.isInitial)) {
      if (showErrors) {
        setHighlightedError('toggleInitial');
        setTimeout(() => setHighlightedError(null), 3000);
        showToast('Erro Crítico: Defina um Estado Inicial (▶)!', 'error');
      }
      return false;
    }
    if (!nodes.some(n => n.isFinal)) {
      if (showErrors) {
        setHighlightedError('toggleFinal');
        setTimeout(() => setHighlightedError(null), 3000);
        showToast('Erro: Precisa de pelo menos um Estado Final (◎)!', 'error');
      }
      return false;
    }
    const emptyIdx = transitions.findIndex(t => t.symbol === '');
    if (emptyIdx !== -1) {
      if (showErrors) {
        setHighlightedError(`transition-${emptyIdx}`);
        setTimeout(() => setHighlightedError(null), 3000);
        showToast('Setas em branco! Preencha todas as transições.', 'error');
      }
      return false;
    }
    for (const node of nodes) {
      const allSyms = transitions
        .filter(t => t.from === node.id)
        .flatMap(t => t.symbol.split(',').map(s => s.trim()).filter(Boolean));
      if (allSyms.length !== new Set(allSyms).size) {
        if (showErrors) {
          setHighlightedError(node.id);
          setTimeout(() => setHighlightedError(null), 3000);
          const dupSymbol = findDuplicateSymbol(node.id, transitions);
          showToast(`Não determinístico! "${node.label || node.id}" tem duas setas para o símbolo '${dupSymbol}'.`, 'error');
        }
        return false;
      }
    }

    const alphabetSet = new Set(currentLevel?.alphabet || []);
    if (alphabetSet.size > 0) {
      for (const t of transitions) {
        for (const sym of t.symbol.split(',').map(s => s.trim()).filter(Boolean)) {
          if (!alphabetSet.has(sym)) {
            if (showErrors) {
              setHighlightedError(`transition-${transitions.indexOf(t)}`);
              setTimeout(() => setHighlightedError(null), 3000);
              showToast(`Símbolo "${sym}" não pertence ao alfabeto { ${[...alphabetSet].join(', ')} }!`, 'error');
            }
            return false;
          }
        }
      }
    }

    const simulateDFA = (word) => {
      let cur = nodes.find(n => n.isInitial)?.id;
      if (!cur) return false;
      // testWords guarda 'λ' como display da palavra vazia (ver handleTestWord
    // em AFDPart1.jsx) — nunca o literal "null"/"vazio" (esses só existiam
    // aqui como resquício redundante; a conversão real já acontece antes,
    // no momento em que a tentativa é registrada).
    const w = word === 'λ' ? '' : word;
      for (const ch of w) {
        const tr = transitions.find(t => t.from === cur && t.symbol.split(',').map(s => s.trim()).includes(ch));
        if (!tr) return false;
        cur = tr.to;
      }
      return !!nodes.find(n => n.id === cur)?.isFinal;
    };

    for (const tw of testWords) {
      const accepted     = simulateDFA(tw.word);
      const shouldAccept = tw.status === 'shortest' || tw.status === 'correct';
      if (accepted !== shouldAccept) {
        if (showErrors)
          showToast(`Grafo falhou na palavra '${tw.word}'. Deveria ser ${shouldAccept ? 'aceita' : 'rejeitada'}.`, 'error');
        return false;
      }
    }

    // Verifica equivalência completa por força-bruta: todas as palavras até tamanho 7
    // (|Σ|≤2 → 255 palavras, |Σ|=3 → 1093, |Σ|=4 → 1364 — todas em <3ms em V8).
    // Substitui o BFS-por-estado anterior, que não cobria caminhos que voltavam a
    // estados já visitados (ex.: auto-loops inválidos como q0→b→q0 em L07).
    if (currentLevel?.regex || typeof currentLevel?.validate === 'function') {
      const ce = fuzzDFA(
        currentLevel.alphabet,
        (w) => lvlAccepts(currentLevel, w),
        simulateDFA
      );
      if (ce !== null) {
        if (showErrors) {
          const d = ce.word === '' ? 'λ (palavra vazia)' : `"${ce.word}"`;
          showToast(`Autômato incorreto! ${d} deveria ser ${ce.shouldAccept ? 'aceita' : 'rejeitada'}.`, 'error');
        }
        return false;
      }
    }

    return true;
  }, [nodes, transitions, testWords, showToast, currentLevel, setHighlightedError]);

  // ── Apagar nós selecionados (Delete) ───────────────────────────────────────
  const deleteSelected = useCallback(() => {
    if (!isDrawingUnlocked || selectedNodes.length === 0) return;
    const selectedIds = new Set(
      nodes.filter(n => selectedNodes.includes(n.uid)).map(n => n.label ?? n.id)
    );
    const newNodes = nodes.filter(n => !selectedNodes.includes(n.uid));
    const newTrans = transitions.filter(t => !selectedIds.has(t.from) && !selectedIds.has(t.to));
    setNodes(newNodes);
    setTransitions(newTrans);
    setSelectedNodes([]);
    recordHistory(newNodes, newTrans);
  }, [isDrawingUnlocked, selectedNodes, nodes, transitions, recordHistory, setNodes, setTransitions, setSelectedNodes]);

  // ── Renomear nó — previne duplicatas ──────────────────────────────────────
  const [editingNodeLabel, setEditingNodeLabel] = useState(null);

  const handleNodeLabelFocus = useCallback((uid, currentLabel) => {
    setEditingNodeLabel({ uid, oldLabel: currentLabel });
  }, []);

  const handleNodeLabelChange = useCallback((uid, value) => {
    // Only update the display label; keep id unchanged until blur so edges stay visible
    setNodes(prev => prev.map(n => n.uid === uid ? { ...n, label: value } : n));
  }, [setNodes]);

  const handleNodeLabelBlur = useCallback((uid, currentLabel) => {
    const trimmed = currentLabel.trim();
    const oldId = editingNodeLabel?.oldLabel;

    // Se vazio, reverte
    if (!trimmed) {
      const old = oldId ?? `q${uid}`;
      setNodes(prev => prev.map(n => n.uid === uid ? { ...n, label: old, id: old } : n));
      setEditingNodeLabel(null);
      return;
    }

    // Verifica duplicata COM OUTRO NÓ (não consigo mesmo)
    const isDuplicate = nodes.some(n => n.uid !== uid && (n.label === trimmed || n.id === trimmed));
    if (isDuplicate) {
      const old = oldId ?? `q${uid}`;
      showToast(`⚠️ Já existe um estado chamado "${trimmed}". Revertendo para "${old}".`, 'error');
      setNodes(prev => prev.map(n => n.uid === uid ? { ...n, label: old, id: old } : n));
      setEditingNodeLabel(null);
      return;
    }

    // Salva renomeação (só se o label realmente mudou)
    if (trimmed === oldId) {
      setEditingNodeLabel(null);
      return;
    }

    const newNodes = nodes.map(n => n.uid === uid ? { ...n, label: trimmed, id: trimmed } : n);

    // Atualiza transições que apontam para/de este nó
    const newTrans = transitions.map(t => ({
      ...t,
      from: t.from === oldId ? trimmed : t.from,
      to: t.to === oldId ? trimmed : t.to,
    }));

    setNodes(newNodes);
    setTransitions(newTrans);
    recordHistory(newNodes, newTrans);
    setEditingNodeLabel(null);
  }, [nodes, editingNodeLabel, showToast, transitions, recordHistory, setNodes, setTransitions]);

  // ── Handlers de transição (chips inline) ─────────────────────────────────
  const handleAddSymbol = useCallback((idx, sym) => {
    const newTrans = [...transitions];
    const merged = mergeSymbols(newTrans[idx].symbol, sym);
    if (merged !== null) {
      newTrans[idx] = { ...newTrans[idx], symbol: merged };
      setTransitions(newTrans);
      const squash = squashNextHistoryRef.current;
      squashNextHistoryRef.current = false;
      recordHistory(nodes, newTrans, squash);
    }
  }, [transitions, nodes, recordHistory, setTransitions, squashNextHistoryRef]);

  const handleEditSymbol = useCallback((idx, chipIdx, newSym) => {
    const newTrans = [...transitions];
    const existing = newTrans[idx].symbol.split(',').map(s => s.trim()).filter(Boolean);
    existing[chipIdx] = newSym;
    newTrans[idx] = { ...newTrans[idx], symbol: existing.join(',') };
    setTransitions(newTrans);
    recordHistory(nodes, newTrans);
  }, [transitions, nodes, recordHistory, setTransitions]);

  const handleEraseTransition = useCallback((idx) => {
    const newTrans = transitions.filter((_, i) => i !== idx);
    setTransitions(newTrans);
    recordHistory(nodes, newTrans);
  }, [transitions, nodes, recordHistory, setTransitions]);

  // Apaga UM símbolo (chip) de uma transição multi-símbolo (ex.: q0 --a,b--> q1
  // → apagar só "a"). Se era o último símbolo, remove a seta inteira — mesmo
  // efeito de handleEraseTransition.
  const handleEraseSymbol = useCallback((idx, chipIdx) => {
    const tr = transitions[idx];
    if (!tr) return;
    const syms = tr.symbol.split(',').map(s => s.trim()).filter(Boolean);
    if (syms.length <= 1 || chipIdx < 0 || chipIdx >= syms.length) {
      const newTrans = transitions.filter((_, i) => i !== idx);
      setTransitions(newTrans);
      recordHistory(nodes, newTrans);
      return;
    }
    syms.splice(chipIdx, 1);
    const newTrans = transitions.map((t, i) => i === idx ? { ...t, symbol: syms.join(',') } : t);
    setTransitions(newTrans);
    recordHistory(nodes, newTrans);
  }, [transitions, nodes, recordHistory, setTransitions]);

  const handleAppendCardToTransition = useCallback((idx) => {
    if (!selectedSymbolCard) return;
    const newTrans = [...transitions];
    const merged = mergeSymbols(newTrans[idx].symbol, selectedSymbolCard);
    if (merged !== null) {
      newTrans[idx] = { ...newTrans[idx], symbol: merged };
      setTransitions(newTrans);
      const squash = squashNextHistoryRef.current;
      squashNextHistoryRef.current = false;
      recordHistory(nodes, newTrans, squash);
    }
    setSelectedSymbolCard(null);
  }, [selectedSymbolCard, transitions, nodes, recordHistory, setTransitions, setSelectedSymbolCard, squashNextHistoryRef]);

  const transitionLabelRefs = useRef({});

  const handleTransitionLineClick = useCallback((e, idx) => {
    e.stopPropagation();
    if (!isDrawingUnlocked) return;
    if (interactionMode === 'ERASE') { handleEraseTransition(idx); return; }
    if (selectedSymbolCard) { handleAppendCardToTransition(idx); return; }
    transitionLabelRefs.current[idx]?.triggerAdd();
  }, [isDrawingUnlocked, interactionMode, selectedSymbolCard, handleEraseTransition, handleAppendCardToTransition]);

  // ── Dados de exibição (aula guiada substitui estado real) ─────────────────
  const displayNodes = useMemo(() => {
    if (guidedLessonStep === null) return nodes;
    // Hook novo provê stateUpdate direto (funciona em GRAPH e FORMAL)
    if (lessonCurStepData?.nodes?.length > 0)
      return lessonCurStepData.nodes.map(n => ({ ...n, uid: n.id }));
    const ld = currentLevel?.guidedLesson?.[guidedLessonStep]?.stateUpdate;
    return ld ? ld.nodes.map(n => ({ ...n, uid: n.id })) : nodes;
  }, [guidedLessonStep, lessonCurStepData, currentLevel, nodes]);

  const displayTransitions = useMemo(() => {
    if (guidedLessonStep === null) return transitions;
    if (lessonCurStepData?.nodes?.length > 0)
      return lessonCurStepData.transitions ?? transitions;
    const ld = currentLevel?.guidedLesson?.[guidedLessonStep]?.stateUpdate;
    return ld ? ld.transitions : transitions;
  }, [guidedLessonStep, lessonCurStepData, currentLevel, transitions]);

  // ── Renderização de transições (memoizada) ────────────────────────────────
  // Nós armazenam x/y em px absolutos (canvas-inner 2000×2000).
  const transitionRenders = useMemo(() => {
    return displayTransitions.map((t, idx) => {
      const src = displayNodes.find(n => n.id === t.from);
      const tgt = displayNodes.find(n => n.id === t.to);
      if (!src || !tgt) return null;

      const sx = src.x, sy = src.y;
      const tx = tgt.x, ty = tgt.y;
      const bidir = src.uid !== tgt.uid && displayTransitions.some(o => o.from === tgt.id && o.to === src.id);

      let pathD, lx, ly, labelSide = null;
      if (src.uid === tgt.uid) {
        pathD = `M ${sx - 16} ${sy - 29} C ${sx - 58} ${sy - 96} ${sx + 58} ${sy - 96} ${sx + 16} ${sy - 29}`;
        lx = sx; ly = sy - 82;
        labelSide = 'top';
      } else if (t.curve != null && t.curve !== false) {
        // Bypass com curvatura explícita: arco por cima do caminho linear.
        // t.curve = deslocamento (px) ao longo da normal.
        const dx = tx - sx, dy = ty - sy, dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const nx = -dy/dist, ny = dx/dist;
        const off = typeof t.curve === 'number' ? t.curve : -60;
        const qcx = (sx+tx)/2 + nx*off, qcy = (sy+ty)/2 + ny*off;
        pathD = `M ${sx} ${sy} Q ${qcx} ${qcy} ${tx} ${ty}`;
        lx = (sx+tx)/2 + nx*off*0.55;
        ly = (sy+ty)/2 + ny*off*0.55;
      } else if (bidir) {
        const dx = tx - sx, dy = ty - sy, dist = Math.sqrt(dx*dx + dy*dy);
        const nx = dist ? -dy/dist : 0, ny = dist ? dx/dist : 0;
        const off = 40;
        const qcx = (sx+tx)/2 + nx*off, qcy = (sy+ty)/2 + ny*off;
        // Recua o ponto final ao longo da TANGENTE da curva em t=1 (direção
        // ponto-de-controle→destino), não ao longo da reta sp→tp — a seta usa
        // orient="auto" (rotaciona conforme a tangente real do path), então
        // terminar o path na reta faz a ponta parecer torta em relação à
        // curva visível. NR aproxima o raio do nó (65px de diâmetro / 2).
        const NR = 32;
        const tanX = tx - qcx, tanY = ty - qcy;
        const tanDist = Math.sqrt(tanX*tanX + tanY*tanY) || 1;
        const endX = tx - (tanX/tanDist) * NR;
        const endY = ty - (tanY/tanDist) * NR;
        pathD = `M ${sx} ${sy} Q ${qcx} ${qcy} ${endX} ${endY}`;
        // Ponto da curva Bézier quadrática em t=0.5 é exatamente o midpoint
        // entre o ponto médio reto e o ponto de controle — usar esse valor
        // exato (sem offset extra) mantém o rótulo sempre em cima da curva,
        // em vez de flutuando além dela.
        lx = ((sx+tx)/2 + qcx)/2;
        ly = ((sy+ty)/2 + qcy)/2;
        // Lado da curva (sinal de ny, a componente vertical da normal usada no
        // offset): ny<0 a curva sobe (bow para cima), ny>0 desce. O chip de
        // símbolos (que cresce verticalmente com várias triplas) precisa
        // crescer PARA FORA da curva — nunca em direção à aresta oposta do par
        // bidirecional — senão o chip de uma seta cobre a outra seta.
        labelSide = ny < 0 ? 'top' : 'bottom';
      } else {
        pathD = `M ${sx} ${sy} L ${tx} ${ty}`;
        lx = (sx+tx)/2; ly = (sy+ty)/2;
      }
      return { ...t, idx, src, tgt, pathD, labelPxX: lx, labelPxY: ly, bidir, labelSide };
    }).filter(Boolean);
  }, [displayTransitions, displayNodes]);

  return {
    validateAFDSilent,
    deleteSelected,
    handleNodeLabelFocus, handleNodeLabelChange, handleNodeLabelBlur,
    handleAddSymbol, handleEditSymbol, handleEraseTransition, handleEraseSymbol, handleAppendCardToTransition,
    transitionLabelRefs, handleTransitionLineClick,
    displayNodes, displayTransitions, transitionRenders,
  };
}
