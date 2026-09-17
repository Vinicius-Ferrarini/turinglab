// ─── CanvasArea: o "quadro verde" — montagem visual do AFD ───────────────────
// Canvas 2000×2000px com viewport scrollável e zoom via CSS transform.
// Nós posicionados em px absolutos (left/top). Coordenadas de evento calculadas
// via getBoundingClientRect() do canvas-inner, respeitando o zoom.
import { useCallback, useRef, useState, useEffect } from 'react';
import TransitionLabel from './TransitionLabel';
import StrokeEl from './StrokeEl';
import GuidedLessonOverlay from '../GuidedLessonOverlay';
import NodeContextMenu from './NodeContextMenu';
import { DRAW_COLORS } from '../hooks/useDrawing';
import imgMaurilioApontando from '../../../assets/maurilio2_apontando_pro_lado.webp';
import imgBalaoFala         from '../../../assets/balao_fala_redondo.webp';
import WordleBoard from './WordleBoard';

const INNER_W = 8000;
const INNER_H = 8000;

// ─── MaurilioBalloon: balão de fala PADRÃO do Maurílio (imgBalaoFala) ─────────
// Dimensões e posicionamento fixos (mesmos do balão original "1ª Coisa:
// Descubra a Menor Palavra!") — reaproveitado tal qual em qualquer fala do
// Maurílio no canvas, nunca redimensionado por texto específico.
function MaurilioBalloon({ children, fontSize = 16 }) {
  return (
    <div style={{ position:'relative', width:210, height:140, marginLeft:-80, alignSelf:'flex-start', marginTop:-80 }}>
      <img src={imgBalaoFala} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1 }} />
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        padding:'14px 25px 34px 25px', boxSizing:'border-box', color:'#000', fontWeight:'bold', fontSize, textAlign:'center', zIndex:2 }}>
        {children}
      </div>
    </div>
  );
}

function pxFromEvent(e, innerRef) {
  const el = innerRef.current;
  if (!el) return { x: 0, y: 0 };
  const r = el.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width)  * INNER_W,
    y: ((e.clientY - r.top)  / r.height) * INNER_H,
  };
}

// Estilo JFLAP: um estado nunca pode ser arrastado para fora da área visível
// do quadro — trava na borda do que está sendo mostrado na tela (viewport com
// o scroll/zoom atuais), não apenas nos limites do canvas gigante de 8000px
// (que na prática nunca são atingidos pelo ponteiro, já que o canvas inteiro
// normalmente excede a tela). NODE_R é a margem (metade do nó) para o círculo
// não ficar meio cortado na borda.
const NODE_R = 33;
function clampToViewport(x, y, viewportRef, actualScale) {
  const vp = viewportRef?.current;
  if (!vp) return { x, y };
  const minX = vp.scrollLeft / actualScale + NODE_R;
  const maxX = (vp.scrollLeft + vp.clientWidth) / actualScale - NODE_R;
  const minY = vp.scrollTop / actualScale + NODE_R;
  const maxY = (vp.scrollTop + vp.clientHeight) / actualScale - NODE_R;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

export default function CanvasArea({
  canvasRef, innerCanvasRef, viewportRef, genUid,
  isDrawingUnlocked, interactionMode, setInteractionMode,
  isErasing, setIsErasing, drawTool, setDrawTool, drawColor, setDrawColor, drawSize, setDrawSize,
  zoom, setZoom,
  nodes, setNodes, transitions, setTransitions, recordHistory, squashNextHistoryRef,
  selectedNodes, setSelectedNodes, connectingSource, setConnectingSource,
  selectionBox, setSelectionBox, dragInfo, setDragInfo,
  drawings, setDrawings, setDrawingStack, currentStroke, setCurrentStroke,
  drawingsRef, isDrawingRef, currentStrokeRef,
  selectedSymbolCard,
  transitionRenders, highlightedError,
  handleTransitionLineClick, transitionLabelRefs,
  handleAddSymbol, handleEditSymbol, handleEraseTransition, handleEraseSymbol, handleAppendCardToTransition,
  displayNodes, simHighlight,
  handleNodeLabelFocus, handleNodeLabelChange, handleNodeLabelBlur,
  setDrawMode, showToast,
  guidedLessonStep, setGuidedLessonStep, currentLevel,
  userNodesSnapshot, userTransitionsSnapshot, resetHistory,
  lessonActive = false,
  errorNodeIds = null,
  errorTransitionIndices = null,
  enableContextMenu = true,
  // WordleBoard: histórico de tentativas da fase "descubra a menor palavra"
  // (mesma lista testWords do orquestrador) e wordleGame (mecânica de
  // grade/dica — ver src/modules/shared/useWordGuessGame.js) — só usado nos
  // níveis da grade (ver AFDPart1.jsx: WORDLE_GRID_LEVEL_IDS, hoje todo
  // nível ativo de AFD_1 exceto L14).
  // effectiveShortestWord é o alvo jogável da grade (pode diferir do
  // currentLevel.shortestWord real quando este é '' — ver AFDPart1.jsx).
  // newWord/handleTestWord são os MESMOS do TestPanel — a grade escreve
  // direto nesse estado compartilhado (via wordleGame.typeAt/backspaceAt),
  // então digitar ali equivale a digitar no campo "Nova palavra..." e
  // apertar Testar.
  testWords = [],
  wordleGame = null,
  effectiveShortestWord = null,
  newWord = '',
  handleTestWord,
}) {
  // Ref local para o canvas-inner (se não for fornecido externamente)
  const localInnerRef = useRef(null);
  const innerRef = innerCanvasRef || localInnerRef;

  // Callback de ref estável por idx (cache) — um `ref={el => ...}` inline no
  // .map() recriaria a função a cada render, o que quebraria o React.memo do
  // TransitionLabel (toda prop de função nova "diferente" força re-render).
  const labelRefSettersRef = useRef(new Map());
  const getLabelRefSetter = useCallback((idx) => {
    let fn = labelRefSettersRef.current.get(idx);
    if (!fn) {
      fn = (el) => { transitionLabelRefs.current[idx] = el; };
      labelRefSettersRef.current.set(idx, fn);
    }
    return fn;
  }, [transitionLabelRefs]);

  // ── Menu de contexto do nó (botão direito, estilo JFLAP) ────────────────────
  const [ctxMenu, setCtxMenu] = useState(null); // { x, y, uid } | null
  const handleNodeContextMenu = useCallback((e, uid) => {
    e.preventDefault();
    e.stopPropagation();
    if (!enableContextMenu || !isDrawingUnlocked || guidedLessonStep !== null) return;
    setCtxMenu({ x: e.clientX, y: e.clientY, uid });
  }, [enableContextMenu, isDrawingUnlocked, guidedLessonStep]);
  const ctxNode = ctxMenu ? nodes.find(n => n.uid === ctxMenu.uid) : null;
  const ctxToggleInitial = useCallback(() => {
    if (!ctxNode) return;
    const wasInitial = ctxNode.isInitial;
    const newNodes = nodes.map(n => ({ ...n, isInitial: wasInitial ? false : n.uid === ctxNode.uid }));
    setNodes(newNodes);
    recordHistory(newNodes, transitions);
  }, [ctxNode, nodes, transitions, recordHistory]);
  const ctxToggleFinal = useCallback(() => {
    if (!ctxNode) return;
    const newNodes = nodes.map(n => n.uid === ctxNode.uid ? { ...n, isFinal: !n.isFinal } : n);
    setNodes(newNodes);
    recordHistory(newNodes, transitions);
  }, [ctxNode, nodes, transitions, recordHistory]);
  const ctxDeleteNode = useCallback(() => {
    if (!ctxNode) return;
    const newNodes = nodes.filter(n => n.uid !== ctxNode.uid);
    const newTrans = transitions.filter(t => t.from !== ctxNode.id && t.to !== ctxNode.id);
    setNodes(newNodes);
    setTransitions(newTrans);
    recordHistory(newNodes, newTrans);
  }, [ctxNode, nodes, transitions, recordHistory]);

  const actualScale = (zoom / 100) * 0.8;

  const [zoomInput, setZoomInput] = useState(String(zoom));
  useEffect(() => { setZoomInput(String(zoom)); }, [zoom]);

  // ── Drag de seta estilo JFLAP ─────────────────────────────────────────────
  const [arrowDrag, setArrowDrag] = useState(null); // { srcUid, x1, y1, x2, y2 }
  const arrowDragRef = useRef(null);
  const arrowDragStartRef = useRef(null); // { x, y } posição inicial do pointerDown
  const prevConnectingSourceRef = useRef(null); // connectingSource antes do pointerDown atual
  const [arrowTargetUid, setArrowTargetUid] = useState(null);
  const arrowTargetUidRef = useRef(null);

  useEffect(() => {
    // Só centraliza/reajusta automaticamente quando a aula guiada está ativa.
    // Recalcula a CADA mudança no grafo (não só na primeira vez), pois o
    // modo Aula vai adicionando nós/setas passo a passo — se o zoom só fosse
    // calculado no 1º passo (grafo com 1 nó só), fases com grafos grandes
    // (ex.: L55, 12 estados) ficariam cortadas nos passos finais.
    if (displayNodes.length === 0 || guidedLessonStep === null) return;
    setTimeout(() => {
      if (!viewportRef?.current) return;
      const vp = viewportRef.current;
      const NODE_R = 33; // metade do .node (65px) + folga
      const minX = Math.min(...displayNodes.map(n => n.x)) - NODE_R;
      const maxX = Math.max(...displayNodes.map(n => n.x)) + NODE_R;
      const minY = Math.min(...displayNodes.map(n => n.y)) - NODE_R;
      const maxY = Math.max(...displayNodes.map(n => n.y)) + NODE_R;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const spanX = maxX - minX;
      const spanY = maxY - minY;

      // Mede o espaço real do viewport e reduz o zoom (nunca aumenta acima de
      // 100) o quanto for necessário para o grafo inteiro caber, tanto na
      // largura quanto na altura — sem isso, grafos grandes (ex.: L55) ficam
      // cortados nas bordas em telas menores.
      const PAD = 0.9; // 10% de margem de respiro
      const fitScaleX = spanX > 0 ? (vp.clientWidth  * PAD) / spanX : 0.8;
      const fitScaleY = spanY > 0 ? (vp.clientHeight * PAD) / spanY : 0.8;
      const fitScale = Math.min(0.8, fitScaleX, fitScaleY);
      const fitZoom = Math.max(25, Math.min(100, Math.round((fitScale / 0.8) * 100)));
      if (fitZoom !== zoom) setZoom(fitZoom);

      const scale = (fitZoom / 100) * 0.8;
      vp.scrollLeft = centerX * scale - vp.clientWidth / 2;
      vp.scrollTop  = centerY * scale - vp.clientHeight / 2;
    }, 50);
  }, [displayNodes, zoom, guidedLessonStep, setZoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer: canvas ───────────────────────────────────────────────────────
  const handlePointerDownCanvas = useCallback((e) => {
    if (!isDrawingUnlocked) return;

    if (interactionMode === 'DRAW') {
      const { x, y } = pxFromEvent(e, innerRef);
      if (isErasing) {
        const snapshot = [...drawingsRef.current];
        setDrawingStack(prev => [...prev, snapshot]);
      } else if (drawTool === 'pencil') {
        const stroke = { type: 'pencil', color: drawColor, width: drawSize, points: [{ x, y }] };
        currentStrokeRef.current = stroke;
        setCurrentStroke(stroke);
      } else {
        const stroke = { type: drawTool, color: drawColor, width: drawSize, x1: x, y1: y, x2: x, y2: y };
        currentStrokeRef.current = stroke;
        setCurrentStroke(stroke);
      }
      isDrawingRef.current = true;
      e.target.setPointerCapture(e.pointerId);
      return;
    }

    if (interactionMode === 'ADD_NODE') {
      const { x, y } = pxFromEvent(e, innerRef);
      const ix = Math.max(5, Math.min(INNER_W - 5, x));
      const iy = Math.max(5, Math.min(INNER_H - 5, y));
      let num = nodes.length;
      const usedLabels = new Set(nodes.map(n => n.label));
      while (usedLabels.has(`q${num}`)) num++;
      const newLabel = `q${num}`;
      const newNodes = [...nodes, { uid: genUid(), id: newLabel, label: newLabel, x: ix, y: iy, isInitial: false, isFinal: false }];
      setNodes(newNodes);
      recordHistory(newNodes, transitions);
      return;
    }

    if (interactionMode === 'CONNECTING') {
      // Clique no canvas vazio cancela a seleção de fonte
      setConnectingSource(null);
      return;
    }

    if (interactionMode === 'IDLE' && e.button === 0) {
      const { x, y } = pxFromEvent(e, innerRef);
      setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
      if (!e.ctrlKey) setSelectedNodes([]);
      e.target.setPointerCapture(e.pointerId);
    } else {
      setSelectedNodes([]);
    }
  }, [isDrawingUnlocked, interactionMode, zoom, nodes, transitions, recordHistory, drawColor, drawSize, isErasing, drawTool]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer: nó ───────────────────────────────────────────────────────────
  const handlePointerDownNode = useCallback((e, uid) => {
    if (!isDrawingUnlocked) return;
    e.stopPropagation();

    if (interactionMode === 'ERASE') {
      const targetNode = nodes.find(n => n.uid === uid);
      const newNodes = nodes.filter(n => n.uid !== uid);
      const newTrans = targetNode
        ? transitions.filter(t => t.from !== targetNode.id && t.to !== targetNode.id)
        : transitions;
      setNodes(newNodes);
      setTransitions(newTrans);
      recordHistory(newNodes, newTrans);
      return;
    }
    if (interactionMode === 'TOGGLE_INITIAL') {
      const target = nodes.find(n => n.uid === uid);
      const wasInitial = target?.isInitial;
      const newNodes = nodes.map(n => ({ ...n, isInitial: wasInitial ? false : n.uid === uid }));
      setNodes(newNodes);
      recordHistory(newNodes, transitions);
      setInteractionMode('IDLE'); // desseleciona a carta após 1 uso (diferente de Final/Seta, que ficam ativas)
      return;
    }
    if (interactionMode === 'TOGGLE_FINAL') {
      const newNodes = nodes.map(n => n.uid === uid ? { ...n, isFinal: !n.isFinal } : n);
      setNodes(newNodes);
      recordHistory(newNodes, transitions);
      return;
    }
    if (interactionMode === 'CONNECTING') {
      const srcNode = nodes.find(n => n.uid === uid);
      if (!srcNode) return;
      prevConnectingSourceRef.current = connectingSource;
      const drag = { srcUid: uid, x1: srcNode.x, y1: srcNode.y, x2: srcNode.x, y2: srcNode.y };
      arrowDragRef.current = drag;
      arrowDragStartRef.current = { x: srcNode.x, y: srcNode.y };
      setArrowDrag({ ...drag });
      setConnectingSource(uid);
      return;
    }

    if (interactionMode === 'IDLE') {
      const cur = selectedNodes.includes(uid) ? selectedNodes : (e.ctrlKey ? [...selectedNodes, uid] : [uid]);
      setSelectedNodes(cur);
      const { x, y } = pxFromEvent(e, innerRef);
      setDragInfo({
        isDragging: true,
        initialNodes: JSON.parse(JSON.stringify(nodes)),
        startX: x,
        startY: y,
      });
      e.target.setPointerCapture(e.pointerId);
    }
  }, [isDrawingUnlocked, interactionMode, connectingSource, selectedNodes, nodes, transitions, recordHistory, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer up no nó: trata clique simples e loop no modo CONNECTING ───────
  const handlePointerUpNode = useCallback((e, uid) => {
    if (!isDrawingUnlocked || interactionMode !== 'CONNECTING') return;
    if (!arrowDragRef.current) return;

    const start = arrowDragStartRef.current;
    const cur = arrowDragRef.current;
    const dist = start ? Math.hypot(cur.x2 - start.x, cur.y2 - start.y) : 0;
    const isDrag = dist > 8;

    // Se foi drag real, deixa o handlePointerUp do canvas resolver
    if (isDrag) return;

    // Clique simples (sem arraste): cancelar o drag visual e redirecionar para o canvas não processar
    e.stopPropagation();
    arrowDragRef.current = null;
    arrowDragStartRef.current = null;
    arrowTargetUidRef.current = null;
    setArrowDrag(null);
    setArrowTargetUid(null);

    // prevConnectingSourceRef tem o connectingSource de ANTES deste pointerDown
    const prevSrc = prevConnectingSourceRef.current;

    if (!prevSrc) {
      // Primeiro clique: nó já foi selecionado como fonte no pointerDown (connectingSource = uid)
      // Não faz mais nada — o highlight de selected-source já aparece
    } else if (prevSrc === uid) {
      // Segundo clique no mesmo nó: cria loop
      setConnectingSource(null);
      const srcNode = nodes.find(n => n.uid === uid);
      if (srcNode) {
        const exists = transitions.some(t => t.from === srcNode.id && t.to === srcNode.id);
        if (exists) {
          showToast('Seta já existe! Clique na seta para adicionar um símbolo.', 'info');
        } else {
          const newTrans = [...transitions, { from: srcNode.id, symbol: '', to: srcNode.id }];
          setTransitions(newTrans);
          recordHistory(nodes, newTrans);
          squashNextHistoryRef.current = true;
        }
      }
    } else {
      // Segundo clique em nó diferente: cria seta de prevSrc → uid
      setConnectingSource(null);
      const srcNode = nodes.find(n => n.uid === prevSrc);
      const tgtNode = nodes.find(n => n.uid === uid);
      if (srcNode && tgtNode) {
        const exists = transitions.some(t => t.from === srcNode.id && t.to === tgtNode.id);
        if (exists) {
          showToast('Seta já existe! Clique na seta para adicionar um símbolo.', 'info');
        } else {
          const newTrans = [...transitions, { from: srcNode.id, symbol: '', to: tgtNode.id }];
          setTransitions(newTrans);
          recordHistory(nodes, newTrans);
          squashNextHistoryRef.current = true;
        }
      }
    }
  }, [isDrawingUnlocked, interactionMode, nodes, transitions, recordHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer: move ─────────────────────────────────────────────────────────
  const handlePointerMove = useCallback((e) => {
    if (!isDrawingUnlocked) return;

    const { x: ix, y: iy } = pxFromEvent(e, innerRef);

    if (interactionMode === 'DRAW' && isDrawingRef.current) {
      if (isErasing) {
        const ERASE_R = 20;
        setDrawings(prev => {
          const next = prev.filter(s =>
            !s.points.some(p => Math.hypot(p.x - ix, p.y - iy) < ERASE_R)
          );
          drawingsRef.current = next;
          return next;
        });
      } else if (currentStrokeRef.current) {
        if (drawTool === 'pencil') {
          const pts = currentStrokeRef.current.points;
          const last = pts[pts.length - 1];
          if (Math.hypot(ix - last.x, iy - last.y) < 3) return;
          const updated = { ...currentStrokeRef.current, points: [...pts, { x: ix, y: iy }] };
          currentStrokeRef.current = updated;
          setCurrentStroke({ ...updated });
        } else {
          const updated = { ...currentStrokeRef.current, x2: ix, y2: iy };
          currentStrokeRef.current = updated;
          setCurrentStroke({ ...updated });
        }
      }
      return;
    }

    if (arrowDragRef.current) {
      const upd = { ...arrowDragRef.current, x2: ix, y2: iy };
      arrowDragRef.current = upd;
      setArrowDrag({ ...upd });
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const nodeEl = el?.closest('[data-uid]');
      const hoveredUid = nodeEl?.dataset.uid ?? null;
      const targetUid = hoveredUid && hoveredUid !== arrowDragRef.current.srcUid ? hoveredUid : null;
      arrowTargetUidRef.current = targetUid;
      setArrowTargetUid(targetUid);
      return;
    }

    if (selectionBox) {
      setSelectionBox(s => ({ ...s, currentX: ix, currentY: iy }));
    } else if (dragInfo.isDragging) {
      const dx = ix - dragInfo.startX;
      const dy = iy - dragInfo.startY;
      setNodes(prev => prev.map(n => {
        if (!selectedNodes.includes(n.uid)) return n;
        const init = dragInfo.initialNodes.find(i => i.uid === n.uid);
        if (!init) return n;
        const { x: cx, y: cy } = clampToViewport(init.x + dx, init.y + dy, viewportRef, actualScale);
        return {
          ...n,
          x: cx,
          y: cy,
        };
      }));
    }
  }, [isDrawingUnlocked, zoom, selectionBox, dragInfo, selectedNodes, interactionMode, isErasing, drawTool, viewportRef, actualScale]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer: up ───────────────────────────────────────────────────────────
  const handlePointerUp = useCallback((e) => {
    try { e.target.releasePointerCapture(e.pointerId); } catch { /* ignore */ }

    // Drag de seta: cria transição se houver alvo, senão cancela
    if (arrowDragRef.current) {
      const start = arrowDragStartRef.current;
      const cur = arrowDragRef.current;
      const dist = start ? Math.hypot(cur.x2 - start.x, cur.y2 - start.y) : 0;
      const isDrag = dist > 8;

      const srcUid = arrowDragRef.current.srcUid;
      const tgtUid = arrowTargetUidRef.current;
      arrowDragRef.current = null;
      arrowDragStartRef.current = null;
      arrowTargetUidRef.current = null;
      setArrowDrag(null);
      setArrowTargetUid(null);

      if (isDrag) {
        // Drag real que terminou no canvas vazio: cancela tudo
        setConnectingSource(null);
        if (tgtUid) {
          const srcNode = nodes.find(n => n.uid === srcUid);
          const tgtNode = nodes.find(n => n.uid === tgtUid);
          if (srcNode && tgtNode) {
            const exists = transitions.some(t => t.from === srcNode.id && t.to === tgtNode.id);
            if (exists) {
              showToast('Seta já existe! Clique na seta para adicionar um símbolo.', 'info');
            } else {
              const newTrans = [...transitions, { from: srcNode.id, symbol: '', to: tgtNode.id }];
              setTransitions(newTrans);
              recordHistory(nodes, newTrans);
              squashNextHistoryRef.current = true;
            }
          }
        }
      }
      // Se não foi drag (clique simples), handlePointerUpNode já tratou — não faz nada aqui
      return;
    }

    if (interactionMode === 'DRAW' && isDrawingRef.current) {
      isDrawingRef.current = false;
      const stroke = currentStrokeRef.current;
      const isShape = stroke && stroke.type && stroke.type !== 'pencil';
      const valid = stroke && (
        isShape
          ? Math.hypot(stroke.x2 - stroke.x1, stroke.y2 - stroke.y1) > 4
          : stroke.points && stroke.points.length > 1
      );
      if (!isErasing && valid) {
        const snapshot = [...drawingsRef.current];
        setDrawingStack(prev => [...prev, snapshot]);
        setDrawings(prev => {
          const next = [...prev, stroke];
          drawingsRef.current = next;
          return next;
        });
      }
      currentStrokeRef.current = null;
      setCurrentStroke(null);
      return;
    }

    if (dragInfo.isDragging) {
      // Só grava histórico se algum nó realmente mudou de posição
      const moved = dragInfo.initialNodes.some(init => {
        const cur = nodes.find(n => n.uid === init.uid);
        return cur && (Math.abs(cur.x - init.x) > 1 || Math.abs(cur.y - init.y) > 1);
      });
      if (moved) recordHistory(nodes, transitions);
      setDragInfo({ isDragging: false, initialNodes: [], startX: 0, startY: 0 });
    }

    if (selectionBox) {
      const minX = Math.min(selectionBox.startX, selectionBox.currentX);
      const maxX = Math.max(selectionBox.startX, selectionBox.currentX);
      const minY = Math.min(selectionBox.startY, selectionBox.currentY);
      const maxY = Math.max(selectionBox.startY, selectionBox.currentY);
      const sel = nodes.filter(n => n.x >= minX && n.x <= maxX && n.y >= minY && n.y <= maxY).map(n => n.uid);
      setSelectedNodes(e.ctrlKey ? [...new Set([...selectedNodes, ...sel])] : sel);
      setSelectionBox(null);
    }
  }, [dragInfo, selectionBox, nodes, transitions, selectedNodes, recordHistory, interactionMode, isErasing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      className={`canvas-area ${
        interactionMode === 'ERASE'    ? 'erase-mode' :
        interactionMode === 'ADD_NODE' ? 'add-node-mode' :
        interactionMode === 'DRAW'     ? (isErasing ? 'draw-erase-mode' : 'draw-mode') :
        interactionMode !== 'IDLE'     ? 'connecting-mode' : ''}`}
      ref={canvasRef}
    >
      {/* HUD Zoom — absolutamente posicionado na section, acima do viewport */}
      {isDrawingUnlocked && (
        <div style={{ position:'absolute', top:10, right:10, display:'flex', gap:4, zIndex:60, alignItems:'center' }}>
          <button onClick={setDrawMode} title="Riscar"
            style={{ width:30, height:30, background: interactionMode==='DRAW' ? '#bfdbfe' : '#fef08a',
              border: interactionMode==='DRAW' ? '2.5px solid #3b82f6' : '2.5px solid #000',
              borderRadius:8, fontSize:15, cursor:'pointer',
              boxShadow: interactionMode==='DRAW' ? '2px 2px 0 #1d4ed8' : '2px 2px 0 #000',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M3 12 L10 5 L12 7 L5 14 Z" fill="#fbbf24" stroke="#000" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M10 5 L12 3 L14 5 L12 7 Z" fill="#fb923c" stroke="#000" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M3 12 L1.5 14.5 L5 14 Z" fill="#374151" stroke="#000" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </button>
          <div style={{ display:'flex', gap:2, background:'#fff', padding:'3px 6px', border:'2.5px solid #000', borderRadius:8, boxShadow:'3px 3px 0 #000', alignItems:'center' }}>
            <button onClick={() => setZoom(z => Math.max(25, z - 10))}
              style={{ fontWeight:'bold', width:20, height:22, cursor:'pointer', border:'none', background:'transparent', fontSize:16, color:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
            <input
              type="text"
              inputMode="numeric"
              value={zoomInput}
              onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setZoomInput(v); }}
              onBlur={() => { let v = Number(zoomInput); if (isNaN(v) || v < 25) v = 25; else if (v > 200) v = 200; setZoom(v); setZoomInput(String(v)); }}
              onKeyDown={e => { if (e.key === 'Enter') { let v = Number(zoomInput); if (isNaN(v) || v < 25) v = 25; else if (v > 200) v = 200; setZoom(v); setZoomInput(String(v)); e.target.blur(); } }}
              style={{ width:'32px', textAlign:'center', border:'none', background:'transparent', outline:'none', fontWeight:'bold', fontSize:'11px', fontFamily:'monospace', color:'#000', padding:0, margin:0 }}
            /><span style={{ fontSize:11, fontWeight:'bold', color:'#000' }}>%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))}
              style={{ fontWeight:'bold', width:20, height:22, cursor:'pointer', border:'none', background:'transparent', fontSize:16, color:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
            <button onClick={() => { setZoom(100); const vp = viewportRef?.current; if (vp) { vp.scrollLeft = 0; vp.scrollTop = 0; } }}
              style={{ fontWeight:'bold', marginLeft:2, cursor:'pointer', border:'none', background:'transparent', color:'var(--accent-blue)', fontSize:11 }}>↺</button>
          </div>
        </div>
      )}

      <div className="canvas-label">Área de Montagem</div>
      {isDrawingUnlocked && (interactionMode !== 'IDLE' || selectedSymbolCard) && (
        <div className="canvas-action-label">
          {selectedSymbolCard                                       && `Usar Símbolo: ${selectedSymbolCard}`}
          {!selectedSymbolCard && interactionMode === 'CONNECTING'     && '↗ Criar Seta'}
          {!selectedSymbolCard && interactionMode === 'TOGGLE_FINAL'   && '◎ Definir Final'}
          {!selectedSymbolCard && interactionMode === 'TOGGLE_INITIAL' && '▶ Estado Inicial'}
          {!selectedSymbolCard && interactionMode === 'ERASE'          && '🗑 Apagar'}
          {!selectedSymbolCard && interactionMode === 'ADD_NODE'       && '◯ Novo Estado'}
          {!selectedSymbolCard && interactionMode === 'DRAW' && !isErasing && '✏ Riscar'}
          {!selectedSymbolCard && interactionMode === 'DRAW' &&  isErasing && '⌫ Apagando Rabiscos'}
        </div>
      )}

      {!isDrawingUnlocked && guidedLessonStep === null ? (
        <div className="locked-overlay">
          {/* Grade estilo Wordle/Termo — níveis em WORDLE_GRID_LEVEL_IDS
              (AFDPart1.jsx: hoje todo nível ativo de AFD_1 exceto L14). Só aparece quando o aluno pediu
              dica (hintStage>0) ou já testou alguma palavra. Nesse estado, o
              layout muda: Maurílio fica ancorado à ESQUERDA (não sobrepõe
              mais a grade) e a grade ocupa o centro do espaço restante —
              mesma ideia do minigame standalone "Menor Palavra". Antes do 1º
              clique em Dica, o layout continua sendo o original (Maurílio +
              balão centralizados). effectiveShortestWord é sempre string
              não-vazia nesse gate (nos níveis λ como L11, já é a 2ª menor
              palavra — ver AFDPart1.jsx). */}
          {currentLevel?.id != null && effectiveShortestWord && wordleGame && (wordleGame.hintStage > 0 || testWords.length > 0) ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'flex-start', zIndex: 1 }}>
                <img src={imgMaurilioApontando} alt="Professor" style={{ height: 280 }} />
                {/* Balão PADRÃO do Maurílio (MaurilioBalloon) — sempre que a
                    grade está ativa, anunciando o tamanho da menor palavra
                    jogável (nunca a palavra em si). Quando a menor palavra
                    REAL é λ (shortestWord===''), o texto também explica a 2ª
                    menor palavra; effectiveShortestWord é a 2ª menor calculada
                    nesse caso, ou a própria shortestWord nos demais níveis. */}
                <MaurilioBalloon fontSize={13}>
                  {currentLevel.shortestWord === ''
                    ? `A menor palavra é "Vazia (λ)", encontre a 2ª menor palavra, tem tamanho ${effectiveShortestWord.length}.`
                    : `A menor palavra tem tamanho ${effectiveShortestWord.length}.`}
                </MaurilioBalloon>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 12, padding: '14px 18px' }}>
                  <WordleBoard
                    attempts={testWords}
                    targetLength={effectiveShortestWord.length}
                    shortestWord={effectiveShortestWord}
                    hintStage={wordleGame.hintStage}
                    guess={newWord}
                    typeAt={wordleGame.typeAt}
                    backspaceAt={wordleGame.backspaceAt}
                    onSubmit={handleTestWord}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', display:'flex', alignItems:'center', justifyContent:'center', marginTop:80 }}>
              <img src={imgMaurilioApontando} alt="Professor" style={{ height:320, zIndex:1 }} />
              <MaurilioBalloon>1ª Coisa: Descubra a Menor Palavra!</MaurilioBalloon>
            </div>
          )}
        </div>
      ) : (
        <>
        {/* ── Dica de início ── */}
        {nodes.length === 0 && guidedLessonStep === null && interactionMode !== 'DRAW' && (
          <div className="canvas-empty-hint">
            Clique em <b>◯ Novo Estado</b> e comece a montar seu AFD!
          </div>
        )}

        {/* ── Toolbar de desenho (fora do scroll, posição absoluta) ── */}
        {interactionMode === 'DRAW' && (
          <div className="draw-toolbar">
            {[
              { id: 'pencil', icon: (
                <svg width="15" height="15" viewBox="0 0 15 15">
                  <path d="M2 13 Q4 8 7 7.5 Q10 7 13 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>), title: 'Lápis (rabisco livre)' },
              { id: 'line', icon: (
                <svg width="15" height="15" viewBox="0 0 15 15">
                  <line x1="2" y1="7.5" x2="13" y2="7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>), title: 'Linha reta' },
              { id: 'arrow', icon: (
                <svg width="15" height="15" viewBox="0 0 15 15">
                  <line x1="2" y1="7.5" x2="11" y2="7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  <polygon points="11,4.5 15,7.5 11,10.5" fill="currentColor"/>
                </svg>), title: 'Seta' },
              { id: 'rect', icon: (
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <rect x="2" y="3" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="2" rx="1"/>
                </svg>), title: 'Retângulo' },
            ].map(({ id, icon, title }) => (
              <button key={id}
                className={`draw-tool-btn draw-type-btn${drawTool === id && !isErasing ? ' active' : ''}`}
                title={title}
                onClick={() => { setDrawTool(id); setIsErasing(false); }}>
                {icon}
              </button>
            ))}
            <div className="draw-toolbar-sep" />
            {DRAW_COLORS.map(({ hex, label }) => (
              <button key={hex}
                className={`draw-color-btn${drawColor === hex && !isErasing ? ' active' : ''}`}
                style={{ background: hex === '#f8f8f8' ? '#f8f8f8' : hex,
                  border: hex === '#f8f8f8' ? '2.5px solid #aaa' : '2.5px solid #000' }}
                title={label}
                onClick={() => { setDrawColor(hex); setIsErasing(false); }}
              />
            ))}
            <div className="draw-toolbar-sep" />
            <div className="draw-stroke-size">
              {[2, 4, 7].map(sz => (
                <button key={sz}
                  className={drawSize === sz ? 'active' : ''}
                  style={{ width: 8 + sz * 3, height: 8 + sz * 3 }}
                  title={`Espessura ${sz}`}
                  onClick={() => { setDrawSize(sz); setIsErasing(false); }}
                >
                  <span style={{ display:'block', width: sz * 1.5, height: sz * 1.5,
                    background: '#000', borderRadius: '50%' }} />
                </button>
              ))}
            </div>
            <div className="draw-toolbar-sep" />
            <button className={`draw-tool-btn${isErasing ? ' active' : ''}`}
              title="Borracha"
              onClick={() => setIsErasing(e => !e)}>⌫</button>
            <button className="draw-tool-btn"
              title="Apagar todos os rabiscos"
              onClick={() => {
                const snapshot = [...drawingsRef.current];
                setDrawingStack(prev => [...prev, snapshot]);
                setDrawings([]);
                drawingsRef.current = [];
              }}>🗑</button>
            <div className="draw-toolbar-sep" />
            <button className="draw-tool-btn" title="Fechar ferramenta"
              style={{ fontSize: 11, fontWeight: 900 }}
              onClick={() => setInteractionMode('IDLE')}>✕</button>
          </div>
        )}

        {/* ── Viewport scrollável ── */}
        <div ref={viewportRef} style={{ position:'absolute', inset:0, overflow:'auto' }}>
          {/* Zoom-wrapper: define área de scroll para o tamanho visual do canvas */}
          <div style={{ position:'relative', width: INNER_W * actualScale, height: INNER_H * actualScale, overflow:'hidden' }}>
            {/* Canvas-inner 2000×2000 escalado */}
            <div
              className="canvas-inner"
              ref={innerRef}
              style={{
                position:'absolute', top:0, left:0,
                width: INNER_W, height: INNER_H,
                transform: `scale(${actualScale})`,
                transformOrigin: 'top left',
              }}
              onPointerDown={handlePointerDownCanvas}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Lasso */}
              {selectionBox && (
                <div style={{
                  position:'absolute', border:'2px dashed #2563eb', backgroundColor:'rgba(59,130,246,0.15)',
                  left: Math.min(selectionBox.startX, selectionBox.currentX),
                  top:  Math.min(selectionBox.startY, selectionBox.currentY),
                  width:  Math.abs(selectionBox.currentX - selectionBox.startX),
                  height: Math.abs(selectionBox.currentY - selectionBox.startY),
                  pointerEvents:'none', zIndex:1000 }} />
              )}

              {/* SVG transições */}
              <svg className="connections-svg">
                <defs>
                  <marker id="ah-ghost" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0,10 4,0 8" fill="#888"/></marker>
                  <marker id="ah"    markerWidth="18" markerHeight="14" refX="48" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#000"/></marker>
                  <marker id="ahe"   markerWidth="18" markerHeight="14" refX="48" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#ef4444"/></marker>
                  <marker id="ahr"   markerWidth="18" markerHeight="14" refX="48" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#dc2626"/></marker>
                  <marker id="ahsl"  markerWidth="18" markerHeight="14" refX="18" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#000"/></marker>
                  <marker id="ahsle" markerWidth="18" markerHeight="14" refX="18" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#ef4444"/></marker>
                </defs>
                {transitionRenders.map(tr => (
                  <path key={tr.idx} d={tr.pathD}
                    className={`transition-line ${interactionMode==='ERASE'?'erasable':''} ${highlightedError===`transition-${tr.idx}`?'line-error':''}`}
                    markerEnd={`url(#${
                      tr.src.uid === tr.tgt.uid || tr.bidir
                        ? (interactionMode === 'ERASE' ? 'ahsle' : 'ahsl')
                        : (interactionMode === 'ERASE' ? 'ahe' : highlightedError === `transition-${tr.idx}` ? 'ahr' : 'ah')
                    })`}
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onClick={e => handleTransitionLineClick(e, tr.idx)} />
                ))}
                {arrowDrag && (() => {
                  const dx = arrowDrag.x2 - arrowDrag.x1;
                  const dy = arrowDrag.y2 - arrowDrag.y1;
                  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                  const tip = 14; // recua a ponta para a seta não ultrapassar o cursor
                  const ex = arrowDrag.x2 - (dx/dist)*tip;
                  const ey = arrowDrag.y2 - (dy/dist)*tip;
                  return (
                    <line
                      x1={arrowDrag.x1} y1={arrowDrag.y1}
                      x2={ex} y2={ey}
                      stroke="#888" strokeWidth="2" strokeDasharray="8 4"
                      markerEnd="url(#ah-ghost)"
                      style={{ pointerEvents: 'none' }}
                    />
                  );
                })()}
              </svg>

              {/* Labels das transições */}
              {transitionRenders.map(tr => (
                <TransitionLabel
                  key={`lbl-${tr.from}-${tr.to}`}
                  ref={getLabelRefSetter(tr.idx)}
                  idx={tr.idx}
                  symbol={tr.symbol}
                  interactionMode={interactionMode}
                  selectedSymbolCard={selectedSymbolCard}
                  isDrawingUnlocked={isDrawingUnlocked}
                  lessonActive={lessonActive}
                  isError={highlightedError === `transition-${tr.idx}` || !!errorTransitionIndices?.has(tr.idx)}
                  activeSymbol={simHighlight?.tIdx === tr.idx ? simHighlight.symbol : null}
                  activeSeq={simHighlight?.tIdx === tr.idx ? simHighlight.seq : null}
                  labelSide={tr.labelSide}
                  left={tr.labelPxX}
                  top={tr.labelPxY}
                  onAdd={handleAddSymbol}
                  onEdit={handleEditSymbol}
                  onErase={handleEraseTransition}
                  onEraseSymbol={handleEraseSymbol}
                  onAppendCard={handleAppendCardToTransition}
                />
              ))}

              {/* Camada de rabiscos */}
              <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                pointerEvents:'none', overflow:'visible' }}>
                {drawings.map((stroke, i) => <StrokeEl key={i} stroke={stroke} idx={i} />)}
                {currentStroke && <StrokeEl stroke={currentStroke} idx="cur" />}
              </svg>

              {/* Nós — posicionados em px absolutos */}
              {displayNodes.map(node => {
                const simCls =
                  simHighlight.nodeId === node.id
                    ? simHighlight.type === 'ok'    ? 'sim-active'
                    : simHighlight.type === 'done'  ? 'sim-done'
                    : simHighlight.type === 'error' ? 'sim-error'
                    : '' : '';
                return (
                  <div key={node.uid}
                    data-uid={node.uid}
                    className={`node ${node.isInitial?'initial':''} ${node.isFinal?'final':''} ${selectedNodes.includes(node.uid)?'selected':''} ${interactionMode==='ERASE'?'erasable-node':''} ${connectingSource===node.uid?'selected-source':''} ${errorNodeIds?.has(node.id)?'node-error':''} ${highlightedError===node.id?'error-pulse-severe':''} ${simCls} ${arrowTargetUid===node.uid?'arrow-target':''}`}
                    style={{ top:`${node.y}px`, left:`${node.x}px` }}
                    onPointerDown={e => handlePointerDownNode(e, node.uid)}
                    onPointerUp={e => handlePointerUpNode(e, node.uid)}
                    onContextMenu={e => handleNodeContextMenu(e, node.uid)}>
                    <input
                      type="text"
                      className="node-id-input"
                      value={node.label ?? node.id}
                      translate="no"
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      readOnly={interactionMode === 'ERASE'}
                      onFocus={() => handleNodeLabelFocus(node.uid, node.label ?? node.id)}
                      onChange={e => handleNodeLabelChange(node.uid, e.target.value)}
                      onBlur={e => handleNodeLabelBlur(node.uid, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Aula Guiada (overlay clássico) ── */}
        {guidedLessonStep !== null && currentLevel?.guidedLesson &&
          (currentLevel?.boardWords?.length ?? 0) === 0 && (
          <GuidedLessonOverlay
            steps={currentLevel.guidedLesson}
            step={guidedLessonStep}
            onNext={() => setGuidedLessonStep(s => s + 1)}
            onPrev={() => setGuidedLessonStep(s => s - 1)}
            onFinish={() => {
              setGuidedLessonStep(null);
              const sn = userNodesSnapshot.current ?? [];
              const st = userTransitionsSnapshot.current ?? [];
              setNodes(sn);
              setTransitions(st);
              resetHistory(sn, st);
            }}
          />
        )}
        </>
      )}

      {ctxMenu && ctxNode && (
        <NodeContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          isInitial={ctxNode.isInitial} isFinal={ctxNode.isFinal}
          onToggleInitial={ctxToggleInitial} onToggleFinal={ctxToggleFinal}
          onDelete={ctxDeleteNode}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </section>
  );
}
