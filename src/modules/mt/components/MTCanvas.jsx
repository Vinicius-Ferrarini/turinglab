// ─── MTCanvas: canvas da MT (mesmo motor do AP/AFD: canvas fixo 8000×8000px +
// zoom real via CSS transform + viewport scrollável) ──────────────────────────
// Diferenças do APCanvas:
//   - Transições: { read, write, move } em vez de { read, pop, push }
//   - TMTransitionLabel (chip) + TMTransitionEditor (popup) substituem APTransitionLabel
//   - Modo TOGGLE_FINAL para marcar estados aceitores (MT tem final, diferente do AP)
import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import TMTransitionLabel from './TMTransitionLabel';
import TMTransitionEditor from './TMTransitionEditor';
import StrokeEl from '../../afd/components/StrokeEl';
import NodeContextMenu from '../../afd/components/NodeContextMenu';
import { DRAW_COLORS } from '../../ap/hooks/useAPDrawing';
import { INNER_W, INNER_H } from '../../afd/hooks/useCanvasState.js';
import WordleBoard from '../../afd/components/WordleBoard';
import imgMaurilioApontando from '../../../assets/maurilio2_apontando_pro_lado.webp';
import imgBalaoFala         from '../../../assets/balao_fala_redondo.webp';

// Balão de fala PADRÃO do Maurílio — mesmas dimensões/posição do AFD/AP.
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

// Geometria da aresta (path + posição do chip de label) — usada tanto pro
// render de arestas existentes (edgeRenders) quanto pro editor de uma aresta
// ainda inexistente (commitEdge), que precisa saber onde abrir o popup antes
// de qualquer transição ter sido de fato criada.
function computeEdgeGeometry(src, tgt, bidir) {
  const sx = src.x, sy = src.y;
  const tx = tgt.x, ty = tgt.y;
  const selfLoop = src.id === tgt.id;
  let pathD, lx, ly;
  if (selfLoop) {
    pathD = `M ${sx - 16} ${sy - 29} C ${sx - 58} ${sy - 96} ${sx + 58} ${sy - 96} ${sx + 16} ${sy - 29}`;
    lx = sx; ly = sy - 92;
  } else if (bidir) {
    const dx = tx - sx, dy = ty - sy, dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist, ny = dx / dist, off = 42;
    const qcx = (sx + tx) / 2 + nx * off, qcy = (sy + ty) / 2 + ny * off;
    const NR = 32;
    const tanX = tx - qcx, tanY = ty - qcy, tanDist = Math.hypot(tanX, tanY) || 1;
    const endX = tx - (tanX / tanDist) * NR, endY = ty - (tanY / tanDist) * NR;
    pathD = `M ${sx} ${sy} Q ${qcx} ${qcy} ${endX} ${endY}`;
    lx = ((sx + tx) / 2 + qcx) / 2 + nx * 12;
    ly = ((sy + ty) / 2 + qcy) / 2 + ny * 12;
  } else {
    pathD = `M ${sx} ${sy} L ${tx} ${ty}`;
    lx = (sx + tx) / 2; ly = (sy + ty) / 2 - 14;
  }
  return { pathD, lx, ly, selfLoop };
}

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

export default function MTCanvas({
  canvasRef, innerCanvasRef, viewportRef, zoom, setZoom,
  nodes, transitions, mode, setMode, beginDrag, discardSnapshot,
  connectingSource, setConnectingSource,
  addNode, moveNodes, toggleInitial, toggleFinal, setNodeLabel, renameNode, deleteNode,
  addTriple, editTriple, removeTriple, removeEdge,
  draw, lessonActive, activeNodeId, activeTransition,
  // Realce do estado atual durante o simulador "🔬 Simular" (fora da Aula
  // Guiada — ver MTReconPart1.jsx). Prop separado de activeNodeId porque
  // aquele só se aplica com lessonActive=true; aqui o simulador roda com o
  // canvas em edição normal (lessonActive=false).
  simActiveNodeId = null,
  // tIdx da transição percorrida no passo atual do simulador (índice em
  // `transitions`, mesma convenção de activeTIdx abaixo) + um contador que
  // muda a cada passo — mesmo par tIdx/seq que o AP usa (simHighlight.tIdx/
  // .seq) pra REINICIAR a animação de "piscar" mesmo quando dois passos
  // seguidos destacam o mesmo tIdx (self-loop lido 2x seguidas, por ex.) —
  // sem o seq mudando, o React não remonta o elemento e a animação de
  // iteration-count finito não voltaria a rodar.
  simActiveTIdx = null,
  simActiveSeq = null,
  // Destaque de não-determinismo (Set<nodeId> | null) — ver MTPart1.jsx
  // validate(). Reaproveita a classe/animação .error-pulse-severe já trazida
  // por AFDPart1.css (MTPart1.jsx já importa esse arquivo).
  errorNodeIds = null,
  selectedNodes = [], setSelectedNodes,
  selectionBox, setSelectionBox,
  guidedLessonStep = null,
  isDrawingUnlocked = true,
  // Grade "descubra a menor palavra" — mesma mecânica/visual do AFD/AP. Só a
  // MT Reconhecedora passa isto; a Transdutora tem isDrawingUnlocked fixo.
  wordleGame = null,
  effectiveShortestWord = null,
  rawShortestWord = null,
  languageAttempts = [],
  simWord = '',
  onTestWord,
}) {
  const localInnerRef = useRef(null);
  const innerRef = innerCanvasRef || localInnerRef;
  const dragRef = useRef(null);
  const isDraw = mode === 'DRAW';

  // ── Menu de contexto do nó (botão direito, estilo JFLAP) ────────────────────
  const [ctxMenu, setCtxMenu] = useState(null); // { x, y, uid } | null
  const handleNodeContextMenu = useCallback((e, uid) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDrawingUnlocked || lessonActive) return;
    setCtxMenu({ x: e.clientX, y: e.clientY, uid });
  }, [isDrawingUnlocked, lessonActive]);
  const ctxNode = ctxMenu ? nodes.find(n => n.uid === ctxMenu.uid) : null;

  // Transição recém-criada: abre o editor sozinho.
  const [editing, setEditing] = useState(null); // { type:'edit', tIdx } | { type:'new', from, to, lx, ly } | null

  // ── Drag de seta estilo JFLAP: clique simples só seleciona a origem; é
  // preciso ARRASTAR até o destino (dist > 8) pra criar a transição.
  const [arrowDrag, setArrowDrag] = useState(null); // { srcUid, x1, y1, x2, y2 }
  const arrowDragRef = useRef(null);
  const arrowDragStartRef = useRef(null);
  const prevConnectingSourceRef = useRef(null);
  const [arrowTargetUid, setArrowTargetUid] = useState(null);
  const arrowTargetUidRef = useRef(null);

  const actualScale = (zoom / 100) * 0.8;
  const [zoomInput, setZoomInput] = useState(String(zoom));
  useEffect(() => { setZoomInput(String(zoom)); }, [zoom]);

  // ── Auto-fit do Modo Aula: recalcula o zoom a cada passo p/ o grafo inteiro
  // caber no viewport (mesmo comportamento do APCanvas.jsx) — sem isso, o
  // grafo cresce durante a aula e fica cortado no canto do viewport 8000×8000.
  // Assim como no AP, o bounding box também precisa "esticar" pelos chips de
  // transição empilhados — em self-loops com muitas triplas (ex.: L1 recon,
  // q0 acumulando várias regras a;A,R / b;B,R / ... durante a aula) o chip
  // cresce bem acima do nó (ancorado em sy-92, cada tripla ~27px) e, sem essa
  // folga, o auto-fit calcula o enquadramento só pelas posições dos nós — o
  // chip cresce pra fora da tela sem a câmera "seguir" (bug reportado no L1).
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
      // PAD reduzido de 0.9 pra 0.93 — grafos importados do JFLAP raramente têm
      // proporção igual à do viewport, então o eixo mais apertado (normalmente
      // Y, inflado pelos chips de self-loop) já limita bastante o zoom; uma
      // margem de segurança maior só piorava a sobra visível nas bordas do
      // eixo que folga (reportado no L07 — grafo pequeno com faixas vazias
      // nas laterais mesmo sem nada cortado). Não subir mais que isso: a altura
      // do chip empilhado é uma ESTIMATIVA (CHIP_H aproximado, comentário
      // acima) — testado em 0.97 e já cortava ~11px da base em telas baixas
      // (1366×768, viewport ~1246×520).
      const PAD = 0.93;
      const fitScaleX = spanX > 0 ? (vp.clientWidth  * PAD) / spanX : 0.8;
      const fitScaleY = spanY > 0 ? (vp.clientHeight * PAD) / spanY : 0.8;
      const fitScale = Math.min(0.8, fitScaleX, fitScaleY);
      // Zoom mínimo do auto-fit é mais baixo que o piso do HUD manual (25%) —
      // gabaritos importados do JFLAP às vezes têm layouts bem espalhados
      // verticalmente; sem isso o grafo fica cortado mesmo no menor zoom.
      const fitZoom = Math.max(8, Math.min(100, Math.round((fitScale / 0.8) * 100)));
      const scale = (fitZoom / 100) * 0.8;
      // Desce a "câmera" mais uns px de tela (não de coordenada do canvas) em
      // relação ao centro geométrico — abre uma folga extra acima do conteúdo
      // (ex.: chip do self-loop mais próximo da curva) sem alterar a distância
      // do chip até a própria curva. Valor maior que o do AP (20px): sem essa
      // folga, o topo do grafo (ou o chip do 1º estado) ficava colado na barra
      // do cabeçalho (OBJETIVO/Aula), sem respiro visual nenhum.
      const EXTRA_TOP_GAP = 44;
      // Reserva de canto: o rótulo fixo "Área de Montagem" (canvas-label) fica
      // ancorado no canto inferior-direito do VIEWPORT (CSS bottom/right), não
      // do canvas escalável. Com o PAD mais generoso acima, o grafo passou a
      // encostar bem nas bordas — se um nó final ficar perto desse canto (ex.:
      // L07/q15), sobra sobreposto pelo rótulo. Depois de calcular scroll/scale
      // normalmente, checa se o canto inferior-direito do bbox (em px de tela)
      // invade a zona do rótulo e, se sim, desloca o scroll só o suficiente pra
      // abrir espaço — sem mudar o zoom nem a proporção do enquadramento.
      const CORNER_RESERVE_PX = 56; // ~largura/altura do rótulo + margem de respiro
      const doScroll = () => {
        let sl = centerX * scale - vp.clientWidth / 2;
        let st = centerY * scale - vp.clientHeight / 2 - EXTRA_TOP_GAP;
        const graphRightOnScreen = maxX * scale - sl;
        const graphBottomOnScreen = maxY * scale - st;
        const overflowRight = graphRightOnScreen - (vp.clientWidth - CORNER_RESERVE_PX);
        const overflowBottom = graphBottomOnScreen - (vp.clientHeight - CORNER_RESERVE_PX);
        // Limita o quanto o corner-reserve pode empurrar: nunca deslocar a
        // ponto de cortar o lado OPOSTO do bbox (esquerda/topo) — bug real
        // visto no L07/passo 32, onde abrir espaço pro canto inferior-direito
        // (q15 perto do rótulo) empurrava scrollTop o bastante pra cortar o
        // chip do self-loop de q1 lá em cima. Sobra de cada lado (minX*scale-sl
        // e minY*scale-st) é o quanto ainda dá pra "roubar" com segurança.
        if (overflowRight > 0) sl += Math.min(overflowRight, Math.max(0, minX * scale - sl));
        if (overflowBottom > 0) st += Math.min(overflowBottom, Math.max(0, minY * scale - st));
        vp.scrollLeft = sl;
        vp.scrollTop  = st;
      };
      if (fitZoom !== zoom) {
        setZoom(fitZoom);
        // O <div> canvas-inner só assume o novo width/height (INNER_W*scale via
        // wrapper) depois que o React re-renderiza com o zoom atualizado —
        // setar scrollLeft/Top no mesmo tick ainda vê o tamanho ANTIGO do
        // wrapper e o navegador clampa o valor. requestAnimationFrame espera
        // o próximo paint (já com o zoom novo aplicado) antes de rolar.
        requestAnimationFrame(() => requestAnimationFrame(doScroll));
      } else {
        doScroll();
      }
    }, 50);
  }, [nodes, transitions, zoom, guidedLessonStep, setZoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer no fundo ────────────────────────────────────────────────────────
  const onCanvasDown = useCallback((e) => {
    if (!isDrawingUnlocked) return;
    if (e.target.closest('button')) return;
    if (isDraw) { draw.onDown(e); return; }
    if (e.button !== 0) return;
    setEditing(null);
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

  // Abre o editor para uma aresta NOVA (ainda sem transição salva) entre
  // srcUid → tgtUid. NÃO cria a transição aqui — só ao salvar (onSave do
  // TMTransitionEditor, que já chama addTriple e mostra o toast de bloqueio
  // se o símbolo escolhido colidir). Antes, isto tentava addTriple direto com
  // um rascunho read:'' (branco): se o estado de origem já tivesse QUALQUER
  // transição lendo branco (comum na MT — fim de palavra, retorno de
  // cabeçote...), o bloqueio de determinismo disparava ali mesmo e o editor
  // nunca abria, sem o usuário conseguir escolher outro símbolo.
  const commitEdge = useCallback((srcUid, tgtUid) => {
    const src = nodes.find(n => n.uid === srcUid);
    const tgt = nodes.find(n => n.uid === tgtUid);
    if (!src || !tgt) return;
    const bidir = transitions.some(o => o.from === tgt.id && o.to === src.id);
    const { lx, ly } = computeEdgeGeometry(src, tgt, bidir);
    setEditing({ type: 'new', from: src.id, to: tgt.id, lx, ly });
  }, [nodes, transitions]);

  const onNodeDown = useCallback((e, node) => {
    if (!isDrawingUnlocked) return;
    if (isDraw) return;
    e.stopPropagation();
    if (e.button !== 0) return;
    if (mode === 'ERASE')          { deleteNode(node.uid); return; }
    if (mode === 'TOGGLE_INITIAL') { toggleInitial(node.uid); setMode('IDLE'); return; }
    if (mode === 'TOGGLE_FINAL')   { toggleFinal(node.uid); return; }
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
  }, [isDrawingUnlocked, isDraw, mode, connectingSource, deleteNode, toggleInitial, toggleFinal, setConnectingSource, beginDrag, selectedNodes, setSelectedNodes, nodes]); // eslint-disable-line react-hooks/exhaustive-deps

  const onNodeUp = useCallback((e, node) => {
    if (!isDrawingUnlocked || mode !== 'CONNECTING') return;
    if (!arrowDragRef.current) return;

    const start = arrowDragStartRef.current;
    const cur = arrowDragRef.current;
    const dist = start ? Math.hypot(cur.x2 - start.x, cur.y2 - start.y) : 0;
    const isDrag = dist > 8;

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

  // Modo Aula: tIdx da tripla percorrida no passo atual (se houver), pra
  // destacar tanto a linha da aresta (SVG) quanto o chip específico da regra.
  // Fora da aula, usa o tIdx do simulador "🔬 Simular" (simActiveTIdx) — os
  // dois nunca coexistem (lessonActive=true só durante a Aula Guiada).
  const activeTIdx = useMemo(() => (
    lessonActive && activeTransition
      ? transitions.findIndex(t =>
          t.from === activeTransition.from && t.to === activeTransition.to &&
          t.read === activeTransition.read && t.write === activeTransition.write &&
          t.move === activeTransition.move)
      : !lessonActive && simActiveTIdx != null ? simActiveTIdx : -1
  ), [lessonActive, activeTransition, simActiveTIdx, transitions]);
  // "seq" que muda a cada passo — usado só pra formar a `key` do chip ativo
  // (ver TMTransitionLabel abaixo) e assim reiniciar a animação de piscar
  // mesmo em 2 passos seguidos que destacam o MESMO tIdx. Na aula usa
  // guidedLessonStep (já é um número que muda a cada `lesson.goTo`); no
  // simulador usa simActiveSeq (contador dedicado — ver MTSimPanel/
  // MTReconPart1.jsx). Os dois nunca coexistem (mesma lógica de activeTIdx).
  const activeSeq = lessonActive ? guidedLessonStep : simActiveSeq;

  // ── Agrupa transições por aresta + geometria ────────────────────────────────
  // Memoizado: recalcular groups/edgeRenders (find() por aresta + trig de
  // computeEdgeGeometry) rodava incondicionalmente no body a cada render do
  // MTCanvas — incluindo renders disparados por coisas sem nenhuma relação com
  // o grafo (digitar num campo, mover o mouse durante um traço). Com N nós/M
  // transições isso é O(N·M) repetido à toa; useMemo só recalcula quando
  // nodes/transitions/activeTIdx realmente mudam.
  const edgeRenders = useMemo(() => {
    const groups = [];
    const byKey = new Map();
    transitions.forEach((t, i) => {
      const key = `${t.from}->${t.to}`;
      if (!byKey.has(key)) { const g = { from: t.from, to: t.to, triples: [] }; byKey.set(key, g); groups.push(g); }
      byKey.get(key).triples.push({ read: t.read, write: t.write, move: t.move, tIdx: i });
    });

    return groups.map((g) => {
      const src = nodes.find(n => n.id === g.from);
      const tgt = nodes.find(n => n.id === g.to);
      if (!src || !tgt) return null;
      const bidir = g.from !== g.to && transitions.some(o => o.from === g.to && o.to === g.from);
      const { pathD, lx, ly, selfLoop } = computeEdgeGeometry(src, tgt, bidir);
      const isActiveEdge = activeTIdx !== -1 && g.triples.some(t => t.tIdx === activeTIdx);
      return { ...g, src, tgt, selfLoop, bidir, pathD, lx, ly, isActiveEdge };
    }).filter(Boolean);
  }, [nodes, transitions, activeTIdx]);

  const eraseMode = mode === 'ERASE';

  return (
    <section
      className={`canvas-area ${
        mode === 'ADD_NODE' ? 'add-node-mode' :
        mode === 'ERASE'    ? 'erase-mode' :
        isDraw               ? (draw.isErasing ? 'draw-erase-mode' : 'draw-mode') :
        mode !== 'IDLE'      ? 'connecting-mode' : ''}`}
      ref={canvasRef}
    >
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
          {mode === 'TOGGLE_FINAL'   && '⊙ Estado Final'}
          {isDraw                    && (draw.isErasing ? '⌫ Apagando rabiscos' : '✏ Riscar')}
        </div>
      )}

      {!isDrawingUnlocked && !lessonActive ? (
        <div className="locked-overlay">
          {effectiveShortestWord && wordleGame && (wordleGame.hintStage > 0 || languageAttempts.length > 0) ? (
            // Grade Termo ativa (aluno pediu dica OU já tentou): Maurílio à
            // ESQUERDA + grade no centro — mesmo layout/estilo do AFD/AP.
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
        <div className="ap-empty-hint">Clique em <b>◯ Novo Estado</b> e comece a montar sua MT!</div>
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
                <marker id="mtah"  markerWidth="18" markerHeight="14" refX="48" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#000" /></marker>
                <marker id="mtahs" markerWidth="18" markerHeight="14" refX="18" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#000" /></marker>
                <marker id="mtah-ghost" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0,10 4,0 8" fill="#888"/></marker>
                {/* Modo Aula: seta amarela p/ a aresta percorrida no passo atual — mesmo tom do nó/chip ativos. */}
                <marker id="mtah-active"  markerWidth="18" markerHeight="14" refX="48" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#a16207" /></marker>
                <marker id="mtahs-active" markerWidth="18" markerHeight="14" refX="18" refY="7" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0,18 7,0 14" fill="#a16207" /></marker>
              </defs>
              {edgeRenders.map((er) => (
                <path key={`${er.from}->${er.to}`} d={er.pathD}
                  className={`transition-line ${eraseMode ? 'erasable' : ''} ${er.isActiveEdge ? 'active-transition-line' : ''}`}
                  markerEnd={`url(#${er.selfLoop || er.bidir ? (er.isActiveEdge ? 'mtahs-active' : 'mtahs') : (er.isActiveEdge ? 'mtah-active' : 'mtah')})`}
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
                    markerEnd="url(#mtah-ghost)"
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })()}
            </svg>

            {/* Rótulos (triplas) */}
            {edgeRenders.map((er) => (
              <div key={`lbl-${er.from}->${er.to}`}
                style={{
                  position: 'absolute', left: er.lx, top: er.ly,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  pointerEvents: isDraw ? 'none' : undefined, zIndex: 20,
                }}>
                {er.triples.map(t => (
                  editing?.type === 'edit' && editing.tIdx === t.tIdx ? (
                    <TMTransitionEditor key={t.tIdx}
                      initial={t}
                      onSave={tr => { if (editTriple(t.tIdx, tr) !== false) setEditing(null); }}
                      onDelete={() => { removeTriple(t.tIdx); setEditing(null); }}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    // key muda a cada passo em que ESTE tIdx é o ativo (t.tIdx===
                    // activeTIdx ? `${tIdx}-${seq}` : tIdx) — força o React a
                    // REMONTAR o elemento, reiniciando a animação de piscar
                    // (ap-tl-chip-blink-equivalente) mesmo quando 2 passos
                    // seguidos destacam a mesma transição (self-loop lido 2x
                    // seguidas, por ex.) — sem isso, TMTransitionLabel (memo)
                    // não re-renderizaria e a animação de iteration-count
                    // finito nunca voltaria a tocar. Mesmo padrão de
                    // APTransitionLabel.jsx (AP).
                    <div key={t.tIdx === activeTIdx ? `${t.tIdx}-${activeSeq}` : t.tIdx} style={{ position: 'relative' }}>
                      <TMTransitionLabel
                        transition={t}
                        eraseMode={eraseMode}
                        lessonActive={lessonActive}
                        onRemove={removeTriple}
                        onEdit={(tIdx) => setEditing({ type: 'edit', tIdx })}
                        isActive={t.tIdx === activeTIdx}
                      />
                    </div>
                  )
                ))}
                {editing?.type === 'new' && editing.from === er.from && editing.to === er.to ? (
                  <TMTransitionEditor
                    onSave={tr => { if (addTriple(er.from, er.to, tr) !== false) setEditing(null); }}
                    onCancel={() => setEditing(null)}
                  />
                ) : !eraseMode && !lessonActive ? (
                  <button
                    style={{ position: 'absolute', top: '50%', left: '100%', transform: 'translate(2px, -50%)',
                      width: 15, height: 15, border: '1.5px solid #16a34a', borderRadius: 4,
                      background: '#bbf7d0', fontWeight: 900, cursor: 'pointer', color: '#166534',
                      boxShadow: '1px 1px 0 rgba(22,163,74,.4)', fontSize: 10, lineHeight: 1, padding: 0 }}
                    onClick={e => { e.stopPropagation(); setEditing({ type: 'new', from: er.from, to: er.to, lx: er.lx, ly: er.ly }); }}>
                    ＋
                  </button>
                ) : null}
              </div>
            ))}

            {/* Editor para aresta nova (CONNECTING → alvo, edge ainda não existe) */}
            {editing?.type === 'new' && !edgeRenders.some(er => er.from === editing.from && er.to === editing.to) && (
              <div style={{ position: 'absolute', left: editing.lx, top: editing.ly, transform: 'translate(-50%, -50%)', zIndex: 30 }}>
                <TMTransitionEditor
                  onSave={tr => { if (addTriple(editing.from, editing.to, tr) !== false) setEditing(null); }}
                  onCancel={() => setEditing(null)}
                />
              </div>
            )}

            {/* Camada de rabiscos */}
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
              const isActive = (lessonActive && activeNodeId && node.id === activeNodeId)
                || (!lessonActive && simActiveNodeId && node.id === simActiveNodeId);
              return (
                <div key={node.uid}
                  data-uid={node.uid}
                  className={`node ${node.isInitial ? 'initial' : ''} ${node.isFinal ? 'final' : ''} ${selectedNodes.includes(node.uid) ? 'selected' : ''} ${connectingSource === node.uid ? 'selected-source selected' : ''} ${eraseMode ? 'erasable-node' : ''} ${arrowTargetUid === node.uid ? 'arrow-target' : ''} ${errorNodeIds?.has(node.id) ? 'error-pulse-severe' : ''}`}
                  style={{
                    top: `${node.y}px`, left: `${node.x}px`, pointerEvents: isDraw ? 'none' : 'auto',
                    ...(isActive ? {
                      background: '#fde047', borderColor: '#a16207', color: '#422006',
                      boxShadow: '0 0 0 5px rgba(253,224,71,.45), 3px 3px 0 #000', zIndex: 6,
                    } : {}) }}
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

      {/* Bloqueador do Modo Aula */}
      {lessonActive && (
        <div className="ap-lesson-blocker" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }} />
      )}

      {ctxMenu && ctxNode && (
        <NodeContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          isInitial={ctxNode.isInitial} isFinal={ctxNode.isFinal} showFinal
          onToggleInitial={() => toggleInitial(ctxNode.uid)}
          onToggleFinal={() => toggleFinal(ctxNode.uid)}
          onDelete={() => deleteNode(ctxNode.uid)}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </section>
  );
}
