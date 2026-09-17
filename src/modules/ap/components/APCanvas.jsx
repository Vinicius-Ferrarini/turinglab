// ─── APCanvas: canvas do AP (mesmo motor do AFD: canvas fixo 8000×8000px +
// zoom real via CSS transform + viewport scrollável) ──────────────────────────
// Modos: IDLE (arrastar nó), ADD_NODE, CONNECTING, ERASE, TOGGLE_INITIAL, DRAW
// (rabisco). Transições do mesmo par (from→to) viram uma aresta com várias
// triplas (JFLAP). Inclui camada de rabisco (StrokeEl) e toolbar de desenho.
import { useCallback, useRef, useState, useEffect } from 'react';
import APTransitionLabel from './APTransitionLabel';
import StrokeEl from '../../afd/components/StrokeEl';
import NodeContextMenu from '../../afd/components/NodeContextMenu';
import { DRAW_COLORS } from '../hooks/useAPDrawing';
import { INNER_W, INNER_H } from '../../afd/hooks/useCanvasState.js';
import WordleBoard from '../../afd/components/WordleBoard';
import imgMaurilioApontando from '../../../assets/maurilio2_apontando_pro_lado.webp';
import imgBalaoFala         from '../../../assets/balao_fala_redondo.webp';

// Balão de fala PADRÃO do Maurílio — mesmas dimensões/posição do AFD
// (CanvasArea.jsx), nunca redimensionado por texto específico.
function MaurilioBalloon({ children, fontSize = 16 }) {
  return (
    <div style={{ position: 'relative', width: 210, height: 140, marginLeft: -80, alignSelf: 'flex-start', marginTop: -80 }}>
      <img src={imgBalaoFala} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '14px 25px 34px 25px', boxSizing: 'border-box', color: '#000', fontWeight: 'bold', fontSize, textAlign: 'center', zIndex: 2 }}>
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
// (mesma lógica do CanvasArea.jsx do AFD). NODE_R é a margem (metade do nó)
// para o círculo não ficar meio cortado na borda.
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

export default function APCanvas({
  canvasRef, innerCanvasRef, viewportRef, zoom, setZoom,
  nodes, transitions, mode, setMode, simHighlight, beginDrag, discardSnapshot,
  connectingSource, setConnectingSource,
  addNode, moveNodes, toggleInitial, setNodeLabel, renameNode, deleteNode,
  addTriple, editTriple, removeTriple, removeEdge,
  draw, lessonActive, highlightEdge, lessonHighlightTIdx = null,
  selectedNodes = [], setSelectedNodes,
  selectionBox, setSelectionBox,
  guidedLessonStep = null,
  isDrawingUnlocked = true,
  // Grade "descubra a menor palavra" — mesma mecânica/visual do AFD.
  wordleGame = null,
  effectiveShortestWord = null,
  rawShortestWord = null,
  languageAttempts = [],
  simWord = '',
  onTestWord,
  errorTransitionIndices = null,
}) {
  const localInnerRef = useRef(null);
  const innerRef = innerCanvasRef || localInnerRef;
  const dragRef = useRef(null);
  const isDraw = mode === 'DRAW';

  // ── Menu de contexto do nó (botão direito, estilo JFLAP) — AP só tem Estado
  // Inicial (aceita por pilha vazia, sem estado final). ──────────────────────
  const [ctxMenu, setCtxMenu] = useState(null); // { x, y, uid } | null
  const handleNodeContextMenu = useCallback((e, uid) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDrawingUnlocked || lessonActive || guidedLessonStep !== null) return;
    setCtxMenu({ x: e.clientX, y: e.clientY, uid });
  }, [isDrawingUnlocked, lessonActive, guidedLessonStep]);
  const ctxNode = ctxMenu ? nodes.find(n => n.uid === ctxMenu.uid) : null;

  // Seta recém-criada (modo "Criar Seta"): abre o editor da tripla sozinho, sem
  // exigir que o aluno descubra que precisa clicar no chip "λ, λ ; λ" depois.
  const [autoEditKey, setAutoEditKey] = useState(null); // { from, to, tIdx } | null
  // Estável (sem depender de `er`) — evita recriar a função a cada edge no
  // .map() abaixo, o que quebraria o React.memo do APTransitionLabel.
  const clearAutoEditKey = useCallback(() => setAutoEditKey(null), []);

  // ── Drag de seta estilo JFLAP (mesmo mecanismo do CanvasArea.jsx do AFD):
  // clique simples só seleciona a origem; é preciso ARRASTAR até o destino
  // (dist > 8) pra criar a transição — evita disparar addTriple num clique só.
  const [arrowDrag, setArrowDrag] = useState(null); // { srcUid, x1, y1, x2, y2 }
  const arrowDragRef = useRef(null);
  const arrowDragStartRef = useRef(null); // { x, y } posição inicial do pointerDown
  const prevConnectingSourceRef = useRef(null); // connectingSource antes do pointerDown atual
  const [arrowTargetUid, setArrowTargetUid] = useState(null);
  const arrowTargetUidRef = useRef(null);

  const actualScale = (zoom / 100) * 0.8;
  const [zoomInput, setZoomInput] = useState(String(zoom));
  useEffect(() => { setZoomInput(String(zoom)); }, [zoom]);

  // ── Auto-fit do Modo Aula: recalcula o zoom a cada passo p/ o grafo inteiro
  // caber no viewport (mesmo comportamento do CanvasArea.jsx do AFD), MAS aqui
  // o bounding box também precisa "esticar" pelos rótulos de transição — em
  // self-loops (ex.: L18, q0→q0 recebendo muitas triplas durante a aula) o
  // chip cresce verticalmente pra cima do nó (empilha read/pop/push por
  // tripla, ~27px cada) e, sem essa folga, o auto-fit calcula o enquadramento
  // só pelas posições dos nós — o chip cresce pra fora da tela sem a câmera
  // "seguir". Aproxima a altura de cada chip por triplas × ~27px e soma ao
  // offset fixo de cada tipo de aresta (self-loop já nasce 92px acima do nó;
  // bidir/reta ficam perto da reta central).
  useEffect(() => {
    if (nodes.length === 0 || guidedLessonStep === null) return;
    setTimeout(() => {
      if (!viewportRef?.current) return;
      const vp = viewportRef.current;
      const NODE_R = 33;
      const CHIP_H = 27; // altura aproximada de cada tripla empilhada no chip

      // Maior nº de triplas por aresta (agrupando por from->to, como no render).
      const tripleCountByKey = new Map();
      transitions.forEach(t => {
        const key = `${t.from}->${t.to}`;
        tripleCountByKey.set(key, (tripleCountByKey.get(key) || 0) + 1);
      });

      let minX = Math.min(...nodes.map(n => n.x)) - NODE_R;
      let maxX = Math.max(...nodes.map(n => n.x)) + NODE_R;
      let minY = Math.min(...nodes.map(n => n.y)) - NODE_R;
      let maxY = Math.max(...nodes.map(n => n.y)) + NODE_R;

      tripleCountByKey.forEach((count, key) => {
        const [from, to] = key.split('->');
        const node = nodes.find(n => n.id === from);
        if (!node) return;
        const stackH = count * CHIP_H;
        if (from === to) {
          // Self-loop: label ancorada 92px acima do nó pela BASE (translate
          // -100% no render) — o chip inteiro cresce pra cima a partir dali.
          minY = Math.min(minY, node.y - 92 - stackH);
        } else {
          // Aresta reta/bidir: label perto do meio do segmento — folga vertical
          // básica (metade do chip) já cobre o caso comum sem exigir achar o
          // nó de destino aqui.
          minY = Math.min(minY, node.y - stackH / 2);
          maxY = Math.max(maxY, node.y + stackH / 2);
        }
      });

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const spanX = maxX - minX;
      const spanY = maxY - minY;
      const PAD = 0.9;
      const fitScaleX = spanX > 0 ? (vp.clientWidth  * PAD) / spanX : 0.8;
      const fitScaleY = spanY > 0 ? (vp.clientHeight * PAD) / spanY : 0.8;
      const fitScale = Math.min(0.8, fitScaleX, fitScaleY);
      const fitZoom = Math.max(25, Math.min(100, Math.round((fitScale / 0.8) * 100)));
      if (fitZoom !== zoom) setZoom(fitZoom);
      const scale = (fitZoom / 100) * 0.8;
      // Desce a "câmera" mais uns 20px de tela (não de coordenada do canvas) em
      // relação ao centro geométrico — abre uma folga extra acima do conteúdo
      // (ex.: chip do self-loop mais próximo da curva) sem alterar a distância
      // do chip até a própria curva.
      const EXTRA_TOP_GAP = 20;
      vp.scrollLeft = centerX * scale - vp.clientWidth / 2;
      vp.scrollTop  = centerY * scale - vp.clientHeight / 2 - EXTRA_TOP_GAP;
    }, 50);
  }, [nodes, transitions, zoom, guidedLessonStep, setZoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer no fundo ────────────────────────────────────────────────────────
  const onCanvasDown = useCallback((e) => {
    if (!isDrawingUnlocked) return;
    // Toques que começam num botão (HUD "Riscar" / toolbar de desenho) NÃO devem
    // virar traço nem capturar o ponteiro no canvas — senão o ponteiro é roubado
    // do botão e o clique (fechar lápis / trocar ferramenta) nunca dispara.
    if (e.target.closest('button')) return;
    if (isDraw) { draw.onDown(e); return; }
    if (e.button !== 0) return;
    if (mode === 'ADD_NODE') {
      const { x, y } = pxFromEvent(e, innerRef);
      addNode(Math.max(5, Math.min(INNER_W - 5, x)), Math.max(5, Math.min(INNER_H - 5, y)));
      return;
    }
    if (mode === 'IDLE') {
      const { x, y } = pxFromEvent(e, innerRef);
      setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
      if (!e.ctrlKey) setSelectedNodes([]);
      e.target.setPointerCapture?.(e.pointerId);
      return;
    }
    setSelectedNodes([]);
  }, [isDrawingUnlocked, isDraw, draw, mode, addNode, setSelectionBox, setSelectedNodes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cria a transição (tripla em branco) entre srcUid → tgtUid e abre o editor
  // automaticamente, igual ao clique único de antes — só chamado após um
  // arraste real ou um 2º clique simples (loop / nó diferente).
  const commitEdge = useCallback((srcUid, tgtUid) => {
    const src = nodes.find(n => n.uid === srcUid);
    const tgt = nodes.find(n => n.uid === tgtUid);
    if (!src || !tgt) return;
    const newTIdx = transitions.length;
    const ok = addTriple(src.id, tgt.id, { read: '', pop: '', push: '' });
    if (ok) setAutoEditKey({ from: src.id, to: tgt.id, tIdx: newTIdx });
  }, [nodes, transitions, addTriple]);

  const onNodeDown = useCallback((e, node) => {
    if (!isDrawingUnlocked) return;
    if (isDraw) return;
    e.stopPropagation();
    if (e.button !== 0) return;
    if (mode === 'ERASE')          { deleteNode(node.uid); return; }
    if (mode === 'TOGGLE_INITIAL') { toggleInitial(node.uid); setMode('IDLE'); return; }
    if (mode === 'CONNECTING') {
      prevConnectingSourceRef.current = connectingSource;
      const drag = { srcUid: node.uid, x1: node.x, y1: node.y, x2: node.x, y2: node.y };
      arrowDragRef.current = drag;
      arrowDragStartRef.current = { x: node.x, y: node.y };
      setArrowDrag({ ...drag });
      setConnectingSource(node.uid);
      return;
    }
    if (mode === 'IDLE') {
      const newSel = e.ctrlKey
        ? (selectedNodes.includes(node.uid) ? selectedNodes.filter(id => id !== node.uid) : [...selectedNodes, node.uid])
        : (selectedNodes.includes(node.uid) ? selectedNodes : [node.uid]);
      setSelectedNodes(newSel);
      beginDrag();
      const { x, y } = pxFromEvent(e, innerRef);
      // Guarda a posição inicial de TODOS os nós selecionados (não só o clicado),
      // pra mover o grupo inteiro junto — antes só o nó sob o cursor se movia.
      const origins = nodes
        .filter(n => newSel.includes(n.uid))
        .map(n => ({ uid: n.uid, ox: n.x, oy: n.y }));
      dragRef.current = { sx: x, sy: y, origins };
      e.target.setPointerCapture?.(e.pointerId);
    }
  }, [isDrawingUnlocked, isDraw, mode, connectingSource, beginDrag, selectedNodes, setSelectedNodes, nodes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer up no nó: trata clique simples (sem arraste) no modo CONNECTING —
  // mesma lógica do handlePointerUpNode do AFD (loop / seta pra outro nó).
  const onNodeUp = useCallback((e, node) => {
    if (!isDrawingUnlocked || mode !== 'CONNECTING') return;
    if (!arrowDragRef.current) return;

    const start = arrowDragStartRef.current;
    const cur = arrowDragRef.current;
    const dist = start ? Math.hypot(cur.x2 - start.x, cur.y2 - start.y) : 0;
    const isDrag = dist > 8;

    // Se foi um arraste real, deixa o onUp do canvas resolver.
    if (isDrag) return;

    e.stopPropagation();
    arrowDragRef.current = null;
    arrowDragStartRef.current = null;
    arrowTargetUidRef.current = null;
    setArrowDrag(null);
    setArrowTargetUid(null);

    const prevSrc = prevConnectingSourceRef.current;
    if (!prevSrc) {
      // 1º clique: nó já virou fonte no pointerDown — só o highlight aparece.
    } else {
      // 2º clique (mesmo nó = loop, ou nó diferente): cria a transição.
      setConnectingSource(null);
      commitEdge(prevSrc, node.uid);
    }
  }, [isDrawingUnlocked, mode, commitEdge, setConnectingSource]);

  const onMove = useCallback((e) => {
    if (!isDrawingUnlocked) return;
    if (isDraw) { draw.onMove(e); return; }
    if (arrowDragRef.current) {
      const { x, y } = pxFromEvent(e, innerRef);
      const upd = { ...arrowDragRef.current, x2: x, y2: y };
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
      const { x, y } = pxFromEvent(e, innerRef);
      setSelectionBox(s => s ? { ...s, currentX: x, currentY: y } : null);
      return;
    }
    const d = dragRef.current;
    if (!d) return;
    const { x, y } = pxFromEvent(e, innerRef);
    const dx = x - d.sx, dy = y - d.sy;
    // Um único dispatch pra mover TODOS os nós selecionados — chamar moveNode em
    // loop perderia as mudanças anteriores (cada chamada fecha sobre o mesmo
    // `nodes` do render atual, então a última chamada sobrescreve as outras).
    moveNodes(d.origins.map(o => {
      const { x: nx, y: ny } = clampToViewport(o.ox + dx, o.oy + dy, viewportRef, actualScale);
      return { uid: o.uid, x: nx, y: ny };
    }));
  }, [isDrawingUnlocked, isDraw, draw, moveNodes, selectionBox, setSelectionBox, viewportRef, actualScale]); // eslint-disable-line react-hooks/exhaustive-deps

  const onUp = useCallback((e) => {
    if (!isDrawingUnlocked) return;
    try { e.target.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }

    // Drag de seta: cria transição se soltou em cima de um nó-alvo, senão cancela.
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
        setConnectingSource(null);
        if (tgtUid) commitEdge(srcUid, tgtUid);
      }
      // Clique simples já foi tratado pelo onNodeUp — não faz nada aqui.
      return;
    }

    if (isDraw) { draw.onUp(e); return; }
    if (selectionBox) {
      const minX = Math.min(selectionBox.startX, selectionBox.currentX);
      const maxX = Math.max(selectionBox.startX, selectionBox.currentX);
      const minY = Math.min(selectionBox.startY, selectionBox.currentY);
      const maxY = Math.max(selectionBox.startY, selectionBox.currentY);
      const sel = nodes.filter(n => n.x >= minX && n.x <= maxX && n.y >= minY && n.y <= maxY).map(n => n.uid);
      setSelectedNodes(e.ctrlKey ? [...new Set([...selectedNodes, ...sel])] : sel);
      setSelectionBox(null);
      return;
    }
    // Clique simples no nó sem arrastar (ex.: só focar o campo de nome e sair
    // sem editar): o beginDrag do onNodeDown já empurrou um SNAPSHOT — como o
    // nó não se moveu, cancela esse snapshot pra não sujar o "desfazer".
    if (dragRef.current) {
      const d = dragRef.current;
      const moved = d.origins.some(o => {
        const cur = nodes.find(n => n.uid === o.uid);
        return cur && (Math.abs(cur.x - o.ox) > 1 || Math.abs(cur.y - o.oy) > 1);
      });
      if (!moved) discardSnapshot?.();
    }
    dragRef.current = null;
  }, [isDrawingUnlocked, isDraw, draw, selectionBox, nodes, selectedNodes, setSelectedNodes, setSelectionBox, commitEdge, setConnectingSource, discardSnapshot]);

  // ── Agrupa transições por aresta (from→to) ──────────────────────────────────
  const groups = [];
  const byKey = new Map();
  transitions.forEach((t, i) => {
    const key = `${t.from}->${t.to}`;
    if (!byKey.has(key)) { const g = { from: t.from, to: t.to, triples: [] }; byKey.set(key, g); groups.push(g); }
    byKey.get(key).triples.push({ read: t.read, pop: t.pop, push: t.push, tIdx: i });
  });

  const edgeRenders = groups.map((g) => {
    const src = nodes.find(n => n.id === g.from);
    const tgt = nodes.find(n => n.id === g.to);
    if (!src || !tgt) return null;
    const sx = src.x, sy = src.y;
    const tx = tgt.x, ty = tgt.y;
    const selfLoop = g.from === g.to;
    const bidir = !selfLoop && transitions.some(o => o.from === g.to && o.to === g.from);
    let pathD, lx, ly, labelSide = null;
    if (selfLoop) {
      pathD = `M ${sx - 16} ${sy - 29} C ${sx - 58} ${sy - 96} ${sx + 58} ${sy - 96} ${sx + 16} ${sy - 29}`;
      lx = sx; ly = sy - 92;
      labelSide = 'top';
    } else if (bidir) {
      const dx = tx - sx, dy = ty - sy, dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist, ny = dx / dist, off = 42;
      const qcx = (sx + tx) / 2 + nx * off, qcy = (sy + ty) / 2 + ny * off;
      // Recua o fim do path ao longo da TANGENTE da curva (não da reta sp→tp),
      // senão a ponta da seta (marker) fica torta perto do nó de destino.
      const NR = 32;
      const tanX = tx - qcx, tanY = ty - qcy, tanDist = Math.hypot(tanX, tanY) || 1;
      const endX = tx - (tanX / tanDist) * NR, endY = ty - (tanY / tanDist) * NR;
      pathD = `M ${sx} ${sy} Q ${qcx} ${qcy} ${endX} ${endY}`;
      // Rótulo colado na curva (não na reta central). O offset extra é pequeno
      // de propósito: como o chip agora ancora pela BORDA externa (ver
      // labelSide abaixo), ele já cresce inteiro para fora da curva sozinho —
      // um offset grande aqui só afasta a tripla mais próxima sem necessidade.
      lx = qcx;
      ly = qcy;
      // Lado da curva (mesmo raciocínio do AFD, useAFDGraph.js): ny<0 a curva
      // sobe, ny>0 desce. O chip (várias triplas empilhadas) precisa crescer
      // PARA FORA da curva — nunca em direção à aresta oposta do par
      // bidirecional — senão o chip de uma seta cobre a outra seta.
      labelSide = ny < 0 ? 'top' : 'bottom';
    } else {
      pathD = `M ${sx} ${sy} L ${tx} ${ty}`;
      lx = (sx + tx) / 2; ly = (sy + ty) / 2 - 14;
    }
    return { ...g, src, tgt, selfLoop, bidir, pathD, lx, ly, labelSide };
  }).filter(Boolean);

  const eraseMode = mode === 'ERASE';

  return (
    <section
      className={`canvas-area ${
        mode === 'ADD_NODE' ? 'add-node-mode' :
        mode === 'ERASE'    ? 'erase-mode' :
        isDraw              ? (draw.isErasing ? 'draw-erase-mode' : 'draw-mode') :
        mode !== 'IDLE'     ? 'connecting-mode' : ''}`}
      ref={canvasRef}
    >
      {/* HUD: Zoom + botão Riscar (mesmo visual do AFD; só depois de destravado) */}
      {isDrawingUnlocked && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 60, display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={() => setMode(isDraw ? 'IDLE' : 'DRAW')} title="Riscar"
            style={{ width: 30, height: 30, background: isDraw ? '#bfdbfe' : '#fef08a',
              border: isDraw ? '2.5px solid #3b82f6' : '2.5px solid #000',
              borderRadius: 8, fontSize: 15, cursor: 'pointer',
              boxShadow: isDraw ? '2px 2px 0 #1d4ed8' : '2px 2px 0 #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M3 12 L10 5 L12 7 L5 14 Z" fill="#fbbf24" stroke="#000" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M10 5 L12 3 L14 5 L12 7 Z" fill="#fb923c" stroke="#000" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M3 12 L1.5 14.5 L5 14 Z" fill="#374151" stroke="#000" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ display: 'flex', gap: 2, background: '#fff', padding: '3px 6px', border: '2.5px solid #000', borderRadius: 8, boxShadow: '3px 3px 0 #000', alignItems: 'center' }}>
            <button onClick={() => setZoom(z => Math.max(25, z - 10))}
              style={{ fontWeight: 'bold', width: 20, height: 22, cursor: 'pointer', border: 'none', background: 'transparent', fontSize: 16, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <input
              type="text"
              inputMode="numeric"
              value={zoomInput}
              onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setZoomInput(v); }}
              onBlur={() => { let v = Number(zoomInput); if (isNaN(v) || v < 25) v = 25; else if (v > 200) v = 200; setZoom(v); setZoomInput(String(v)); }}
              onKeyDown={e => { if (e.key === 'Enter') { let v = Number(zoomInput); if (isNaN(v) || v < 25) v = 25; else if (v > 200) v = 200; setZoom(v); setZoomInput(String(v)); e.target.blur(); } }}
              style={{ width: '32px', textAlign: 'center', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace', color: '#000', padding: 0, margin: 0 }}
            /><span style={{ fontSize: 11, fontWeight: 'bold', color: '#000' }}>%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))}
              style={{ fontWeight: 'bold', width: 20, height: 22, cursor: 'pointer', border: 'none', background: 'transparent', fontSize: 16, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            <button onClick={() => { setZoom(100); const vp = viewportRef?.current; if (vp) { vp.scrollLeft = 0; vp.scrollTop = 0; } }}
              style={{ fontWeight: 'bold', marginLeft: 2, cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--accent-blue)', fontSize: 11 }}>↺</button>
          </div>
        </div>
      )}

      <div className="canvas-label">Área de Montagem</div>
      {isDrawingUnlocked && mode !== 'IDLE' && (
        <div className="canvas-action-label">
          {mode === 'ADD_NODE'       && '◯ Novo Estado'}
          {mode === 'CONNECTING'     && (connectingSource ? '↗ Clique no destino' : '↗ Clique na origem')}
          {mode === 'ERASE'          && '🗑 Apagar'}
          {mode === 'TOGGLE_INITIAL' && '▶ Estado Inicial'}
          {isDraw                    && (draw.isErasing ? '⌫ Apagando rabiscos' : '✏ Riscar')}
        </div>
      )}

      {!isDrawingUnlocked && !lessonActive ? (
        <div className="locked-overlay">
          {effectiveShortestWord && wordleGame && (wordleGame.hintStage > 0 || languageAttempts.length > 0) ? (
            // Grade Termo ativa (aluno pediu dica OU já tentou): Maurílio ancorado
            // à ESQUERDA + grade no centro — mesmo layout/estilo do AFD.
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'flex-start', zIndex: 1 }}>
                <img src={imgMaurilioApontando} alt="Professor" style={{ height: 280 }} />
                <MaurilioBalloon fontSize={13}>
                  {rawShortestWord === ''
                    ? `A menor palavra é "Vazia (λ)", encontre a 2ª menor palavra, tem tamanho ${effectiveShortestWord.length}.`
                    : `A menor palavra tem tamanho ${effectiveShortestWord.length}.`}
                </MaurilioBalloon>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 12, padding: '14px 18px' }}>
                  <WordleBoard
                    attempts={languageAttempts}
                    targetLength={effectiveShortestWord.length}
                    shortestWord={effectiveShortestWord}
                    hintStage={wordleGame.hintStage}
                    guess={simWord}
                    typeAt={wordleGame.typeAt}
                    backspaceAt={wordleGame.backspaceAt}
                    onSubmit={onTestWord}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
              <img src={imgMaurilioApontando} alt="Professor" style={{ height: 320, zIndex: 1 }} />
              <MaurilioBalloon>1ª Coisa: Descubra a Menor Palavra!</MaurilioBalloon>
            </div>
          )}
        </div>
      ) : (
      <>
      {nodes.length === 0 && !isDraw && !lessonActive && (
        <div className="ap-empty-hint">Clique em <b>◯ Novo Estado</b> e comece a montar seu AP!</div>
      )}

      {/* Toolbar de desenho */}
      {isDraw && (
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
            <button key={id} className={`draw-tool-btn draw-type-btn${draw.drawTool === id && !draw.isErasing ? ' active' : ''}`}
              title={title} onClick={() => { draw.setDrawTool(id); draw.setIsErasing(false); }}>{icon}</button>
          ))}
          <div className="draw-toolbar-sep" />
          {DRAW_COLORS.map(({ hex, label }) => (
            <button key={hex} className={`draw-color-btn${draw.drawColor === hex && !draw.isErasing ? ' active' : ''}`}
              style={{ background: hex, border: hex === '#f8f8f8' ? '2.5px solid #aaa' : '2.5px solid #000' }}
              title={label} onClick={() => { draw.setDrawColor(hex); draw.setIsErasing(false); }} />
          ))}
          <div className="draw-toolbar-sep" />
          <div className="draw-stroke-size">
            {[2, 4, 7].map(sz => (
              <button key={sz} className={draw.drawSize === sz ? 'active' : ''}
                style={{ width: 8 + sz * 3, height: 8 + sz * 3 }} title={`Espessura ${sz}`}
                onClick={() => { draw.setDrawSize(sz); draw.setIsErasing(false); }}>
                <span style={{ display: 'block', width: sz * 1.5, height: sz * 1.5, background: '#000', borderRadius: '50%' }} />
              </button>
            ))}
          </div>
          <div className="draw-toolbar-sep" />
          <button className={`draw-tool-btn${draw.isErasing ? ' active' : ''}`} title="Borracha"
            onClick={() => draw.setIsErasing(e => !e)}>⌫</button>
          <button className="draw-tool-btn" title="Limpar rabiscos" onClick={draw.clearDrawings}>🗑</button>
          <div className="draw-toolbar-sep" />
          <button className="draw-tool-btn" title="Fechar" style={{ fontSize: 11, fontWeight: 900 }}
            onClick={() => setMode('IDLE')}>✕</button>
        </div>
      )}

      {/* ── Viewport scrollável ── */}
      <div ref={viewportRef} style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
        <div style={{ position: 'relative', width: INNER_W * actualScale, height: INNER_H * actualScale, overflow: 'hidden' }}>
          <div
            className="canvas-inner"
            ref={innerRef}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: INNER_W, height: INNER_H,
              transform: `scale(${actualScale})`,
              transformOrigin: 'top left',
            }}
            onPointerDown={onCanvasDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          >
            {/* SVG das setas */}
            <svg className="connections-svg">
              <defs>
                <marker id="apah"  markerWidth="18" markerHeight="14" refX="48" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#000" /></marker>
                <marker id="apahs" markerWidth="18" markerHeight="14" refX="18" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#000" /></marker>
                <marker id="apah-ghost" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0,10 4,0 8" fill="#888"/></marker>
              </defs>
              {edgeRenders.map((er) => (
                <path key={`${er.from}->${er.to}`} d={er.pathD}
                  className={`transition-line ${eraseMode ? 'erasable' : ''} ${
                    highlightEdge && er.from === highlightEdge.from && er.to === highlightEdge.to ? 'lesson-hl' : ''}`}
                  markerEnd={`url(#${er.selfLoop || er.bidir ? 'apahs' : 'apah'})`}
                  style={{ pointerEvents: isDraw ? 'none' : 'stroke', cursor: eraseMode ? 'pointer' : 'default' }}
                  onClick={(e) => { if (eraseMode) { e.stopPropagation(); removeEdge(er.from, er.to); } }} />
              ))}
              {arrowDrag && (() => {
                const dx = arrowDrag.x2 - arrowDrag.x1;
                const dy = arrowDrag.y2 - arrowDrag.y1;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const tip = 14;
                const ex = arrowDrag.x2 - (dx / dist) * tip;
                const ey = arrowDrag.y2 - (dy / dist) * tip;
                return (
                  <line
                    x1={arrowDrag.x1} y1={arrowDrag.y1}
                    x2={ex} y2={ey}
                    stroke="#888" strokeWidth="2" strokeDasharray="8 4"
                    markerEnd="url(#apah-ghost)"
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })()}
            </svg>

            {/* Rótulos (triplas) */}
            {edgeRenders.map((er) => (
              <APTransitionLabel
                key={`lbl-${er.from}->${er.to}`}
                from={er.from}
                to={er.to}
                triples={er.triples}
                eraseMode={eraseMode}
                lessonActive={lessonActive}
                left={er.lx}
                top={er.ly}
                pointerEventsNone={isDraw}
                labelSide={er.labelSide}
                onAddTriple={addTriple}
                onEditTriple={editTriple}
                onRemoveTriple={removeTriple}
                autoEdit={autoEditKey && autoEditKey.from === er.from && autoEditKey.to === er.to ? autoEditKey.tIdx : null}
                onAutoEditConsumed={clearAutoEditKey}
                highlightTIdx={simHighlight?.tIdx ?? lessonHighlightTIdx ?? null}
                highlightSeq={simHighlight?.tIdx != null ? simHighlight.seq : null}
                errorTransitionIndices={errorTransitionIndices}
              />
            ))}

            {/* Camada de rabiscos (acima das setas, abaixo dos nós) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
              {draw.drawings.map((s, i) => <StrokeEl key={i} stroke={s} idx={i} />)}
              {draw.currentStroke && <StrokeEl stroke={draw.currentStroke} idx="cur" />}
            </svg>

            {/* Lasso de seleção */}
            {selectionBox && (
              <div style={{
                position: 'absolute', pointerEvents: 'none', zIndex: 1000,
                border: '2px dashed #2563eb', backgroundColor: 'rgba(59,130,246,0.15)',
                left:   Math.min(selectionBox.startX, selectionBox.currentX),
                top:    Math.min(selectionBox.startY, selectionBox.currentY),
                width:  Math.abs(selectionBox.currentX - selectionBox.startX),
                height: Math.abs(selectionBox.currentY - selectionBox.startY),
              }} />
            )}

            {/* Nós — posicionados em px absolutos */}
            {nodes.map((node) => {
              const sim = simHighlight?.nodeId === node.id ? `sim-${simHighlight.type}` : '';
              return (
                <div key={node.uid}
                  data-uid={node.uid}
                  className={`node ${node.isInitial ? 'initial' : ''} ${selectedNodes.includes(node.uid) ? 'selected' : ''} ${connectingSource === node.uid ? 'selected-source selected' : ''} ${eraseMode ? 'erasable-node' : ''} ${sim} ${arrowTargetUid === node.uid ? 'arrow-target' : ''}`}
                  style={{ top: `${node.y}px`, left: `${node.x}px`, pointerEvents: isDraw ? 'none' : 'auto' }}
                  onPointerDown={(e) => onNodeDown(e, node)}
                  onPointerUp={(e) => onNodeUp(e, node)}
                  onContextMenu={(e) => handleNodeContextMenu(e, node.uid)}>
                  <input type="text" className="node-id-input" value={node.label ?? node.id}
                    translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
                    readOnly={mode !== 'IDLE' || lessonActive}
                    onChange={(e) => setNodeLabel(node.uid, e.target.value)}
                    onBlur={(e) => renameNode(node.uid, e.target.value)} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Bloqueador do Modo Aula: impede editar o grafo enquanto a aula roda */}
      {lessonActive && (
        <div className="ap-lesson-blocker" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }} />
      )}

      {ctxMenu && ctxNode && (
        <NodeContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          isInitial={ctxNode.isInitial} showFinal={false}
          onToggleInitial={() => toggleInitial(ctxNode.uid)}
          onDelete={() => deleteNode(ctxNode.uid)}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </section>
  );
}
