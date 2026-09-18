// Hook de drawing stack compartilhado — gerencia anotações SVG em AFDPart1 e AFDPart2.
// Retorna overlayRef para fixar no SVG overlay, estado de cor/tamanho/ferramenta,
// handlers de pointer e drawUndo/clearDrawings.
import { useState, useRef, useCallback } from 'react';

export const DRAW_COLORS = [
  { hex: '#FF0000', label: 'Vermelho' },
  { hex: '#1a1a1a', label: 'Grafite' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#22c55e', label: 'Verde' },
  { hex: '#f59e0b', label: 'Laranja' },
  { hex: '#a855f7', label: 'Roxo' },
  { hex: '#f8f8f8', label: 'Branco' },
];

// ─── strokeNearPoint: testa se um clique (x,y) está a até `radius` px de um
// traço — usado pela borracha (clique apaga o traço mais próximo). Puro,
// testável. Traços 'pencil' (ou sem `type` — traços legados, de antes do
// campo existir) guardam uma lista de pontos e são testados ponto a ponto;
// formas (line/arrow/rect) guardam só x1/y1/x2/y2 (sem `points`) e são
// testadas pelas duas pontas + o meio do segmento.
export function strokeNearPoint(stroke, x, y, radius) {
  if (stroke.type === 'pencil' || !stroke.type)
    return stroke.points.some(p => Math.hypot(p.x - x, p.y - y) < radius);
  const mx = (stroke.x1 + stroke.x2) / 2, my = (stroke.y1 + stroke.y2) / 2;
  return Math.hypot(stroke.x1 - x, stroke.y1 - y) < radius
    || Math.hypot(stroke.x2 - x, stroke.y2 - y) < radius
    || Math.hypot(mx - x, my - y) < radius;
}

export default function useDrawing({ cssZoomCompensation = true } = {}) {
  const [drawings, setDrawings]           = useState([]);
  const [drawingStack, setDrawingStack]   = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [drawColor, setDrawColor]         = useState('#FF0000');
  const [drawSize, setDrawSize]           = useState(3);
  const [isErasing, setIsErasing]         = useState(false);
  const [drawTool, setDrawTool]           = useState('pencil');

  const isDrawingRef     = useRef(false);
  const currentStrokeRef = useRef(null);
  const drawingsRef      = useRef([]);
  const overlayRef       = useRef(null);

  const drawUndo = useCallback(() => {
    setDrawingStack(prev => {
      if (prev.length === 0) return prev;
      const snap = prev[prev.length - 1];
      setDrawings(snap);
      drawingsRef.current = snap;
      return prev.slice(0, -1);
    });
  }, []);

  const clearDrawings = useCallback(() => {
    const snapshot = [...drawingsRef.current];
    setDrawingStack(prev => [...prev, snapshot]);
    setDrawings([]);
    drawingsRef.current = [];
  }, []);

  const getSVGCoords = useCallback((e) => {
    const svg = overlayRef.current;
    if (!svg) return { x: 0, y: 0 };
    try {
      const pt = svg.createSVGPoint();
      if (cssZoomCompensation) {
        const parent = svg.parentElement;
        const parentRect = parent ? parent.getBoundingClientRect() : svg.getBoundingClientRect();
        const zoom = parent && parent.offsetWidth ? parentRect.width / parent.offsetWidth : 1;
        pt.x = e.clientX / zoom;
        pt.y = e.clientY / zoom;
      } else {
        pt.x = e.clientX;
        pt.y = e.clientY;
      }
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const p = pt.matrixTransform(ctm.inverse());
      return { x: p.x, y: p.y };
    } catch { return { x: 0, y: 0 }; }
  }, []);

  const handleOverlayDown = useCallback((e) => {
    const { x, y } = getSVGCoords(e);
    if (isErasing) {
      const snapshot = [...drawingsRef.current];
      setDrawingStack(prev => [...prev, snapshot]);
    } else if (drawTool === 'pencil') {
      const s = { type: 'pencil', color: drawColor, width: drawSize, points: [{ x, y }] };
      currentStrokeRef.current = s;
      setCurrentStroke(s);
    } else {
      const s = { type: drawTool, color: drawColor, width: drawSize, x1: x, y1: y, x2: x, y2: y };
      currentStrokeRef.current = s;
      setCurrentStroke(s);
    }
    isDrawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [isErasing, drawTool, drawColor, drawSize, getSVGCoords]);

  const handleOverlayMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    const { x, y } = getSVGCoords(e);
    if (isErasing) {
      const R = 20;
      setDrawings(prev => {
        const next = prev.filter(s => !strokeNearPoint(s, x, y, R));
        drawingsRef.current = next;
        return next;
      });
    } else if (drawTool === 'pencil' && currentStrokeRef.current) {
      const pts = currentStrokeRef.current.points;
      const last = pts[pts.length - 1];
      if (Math.hypot(x - last.x, y - last.y) < 3) return;
      const updated = { ...currentStrokeRef.current, points: [...pts, { x, y }] };
      currentStrokeRef.current = updated;
      setCurrentStroke({ ...updated });
    } else if (currentStrokeRef.current) {
      const updated = { ...currentStrokeRef.current, x2: x, y2: y };
      currentStrokeRef.current = updated;
      setCurrentStroke({ ...updated });
    }
  }, [isErasing, drawTool, getSVGCoords]);

  const handleOverlayUp = useCallback((e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const stroke = currentStrokeRef.current;
    const isShape = stroke && stroke.type !== 'pencil';
    const valid = stroke && (isShape
      ? Math.hypot(stroke.x2 - stroke.x1, stroke.y2 - stroke.y1) > 4
      : stroke.points && stroke.points.length > 1);
    if (!isErasing && valid) {
      const snapshot = [...drawingsRef.current];
      setDrawingStack(prev => [...prev, snapshot]);
      setDrawings(prev => { const next = [...prev, stroke]; drawingsRef.current = next; return next; });
    }
    currentStrokeRef.current = null;
    setCurrentStroke(null);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {
      // pointer já pode não estar capturado — nada a fazer
    }
  }, [isErasing]);

  return {
    // ref para fixar no SVG overlay
    overlayRef,
    // estado
    drawings,
    drawingStack,
    currentStroke,
    drawColor, setDrawColor,
    drawSize,  setDrawSize,
    isErasing, setIsErasing,
    drawTool,  setDrawTool,
    // ações
    drawUndo,
    clearDrawings,
    // handlers de pointer
    getSVGCoords,
    handleOverlayDown,
    handleOverlayMove,
    handleOverlayUp,
  };
}
